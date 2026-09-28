"""
Dynamic Disruption Re-Planning & What-If Scenario Simulation Service.

Provides a non-mutating operational simulation sandbox for railway dispatchers:
- Supports train delays, train cancellations, emergency track blockages,
  maintenance window closures, and multi-resource capacity reductions.
- Executes the AI Priority Engine + OR-Tools CP-SAT scheduler against scenario copies.
- Computes comprehensive What-If comparison deltas against baseline plans.
- Strictly preserves baseline operational data immutability.
"""

import copy
from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict, List, Literal, Optional, Tuple, Union
import uuid
from pydantic import BaseModel, Field, field_validator

from .conflicts import detect_conflicts
from .cp_sat_scheduler import _parse_iso
from .prioritization import prioritize_tasks
from .resources import CrewResource, MachineResource, ResourcePool
from .scheduler import schedule_blocks

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Pydantic Disruption Models with Strict Validation
# ---------------------------------------------------------

class TrainDelayDisruption(BaseModel):
    type: Literal["train_delay"]
    train_id: str = Field(..., description="ID or number of train to delay, e.g. CONF-801, 12626")
    delay_minutes: int = Field(..., description="Delay duration in minutes (must be > 0)")

    @field_validator("delay_minutes")
    @classmethod
    def validate_positive_delay(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("delay_minutes must be greater than 0")
        return v


class TrainCancellationDisruption(BaseModel):
    type: Literal["train_cancellation"]
    train_id: str = Field(..., description="ID or train number of the cancelled train")


class EmergencyBlockageDisruption(BaseModel):
    type: Literal["emergency_blockage"]
    section_code: Optional[str] = Field(default="", description="Corridor section code affected, e.g. MTJ-NY-L1")
    section_id: Optional[str] = Field(default="", description="Alternative section identifier")
    corridor_id: Optional[str] = Field(default="", description="Target corridor identifier, e.g. COR-NCR-01")
    location: str = Field(default="", description="Descriptive location string")
    start_time: str = Field(..., description="Start of emergency track blockage (ISO 8601)")
    end_time: str = Field(..., description="End of emergency track blockage (ISO 8601)")
    description: Optional[str] = Field(
        default="Emergency Broken Rail / Track Fracture Blockage",
        description="Reason for unexpected track closure"
    )

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_iso_times(cls, v: str) -> str:
        try:
            _parse_iso(v)
            return v
        except Exception as e:
            raise ValueError(f"Invalid ISO 8601 datetime format: {e}")


class WindowClosureDisruption(BaseModel):
    type: Literal["window_closure"]
    window_id: str = Field(..., description="Candidate maintenance window ID, e.g. BP-2026-001")
    closure_type: Literal["full", "shorten"] = Field(
        default="full", description="'full' cancellation or 'shorten' duration"
    )
    new_end_time: Optional[str] = Field(
        default=None, description="New curtailed end time if closure_type is shorten"
    )


class ResourceReductionDisruption(BaseModel):
    type: Literal["resource_reduction"]
    resource_type: Literal["crew", "machine"] = Field(..., description="'crew' or 'machine'")
    type_name: str = Field(
        ..., description="Specific trade or machine type (e.g. electrical, track, tamping_machine)"
    )
    new_capacity: int = Field(..., description="Curtailed available capacity (must be >= 0)")

    @field_validator("new_capacity")
    @classmethod
    def validate_capacity(cls, v: int) -> int:
        if v < 0:
            raise ValueError("new_capacity cannot be negative")
        return v


DisruptionItem = Union[
    TrainDelayDisruption,
    TrainCancellationDisruption,
    EmergencyBlockageDisruption,
    WindowClosureDisruption,
    ResourceReductionDisruption,
]


class ScenarioCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Readable scenario label")
    description: Optional[str] = Field(default="", description="Scenario rationale and context")
    disruptions: List[DisruptionItem] = Field(default_factory=list, description="List of disruptions")


# ---------------------------------------------------------
# What-If Comparison Models
# ---------------------------------------------------------

class ChangedTaskItem(BaseModel):
    task_id: str
    task_title: str
    base_window: Optional[str] = None
    scenario_window: Optional[str] = None
    base_start: Optional[str] = None
    scenario_start: Optional[str] = None
    base_end: Optional[str] = None
    scenario_end: Optional[str] = None
    status: Literal["UNCHANGED", "MOVED", "REMOVED", "NEW"]


class WhatIfComparison(BaseModel):
    tasks_scheduled_base: int
    tasks_scheduled_scenario: int
    tasks_new: List[str]
    tasks_removed: List[str]
    tasks_moved: List[str]
    tasks_unchanged: List[str]
    changed_tasks: List[ChangedTaskItem]
    conflicts_before: int
    conflicts_after: int
    conflicts_resolved: int
    newly_introduced_conflicts: int
    optimization_score: str
    scheduler_type: str
    resource_impact: Dict[str, Any] = Field(default_factory=dict)


class ScenarioItem(BaseModel):
    scenario_id: str
    name: str
    description: str
    disruptions: List[Dict[str, Any]]
    created_at: str
    status: Literal["CREATED", "RUNNING", "COMPLETED", "FAILED"]
    result: Optional[WhatIfComparison] = None


# ---------------------------------------------------------
# Scenario Engine Implementation
# ---------------------------------------------------------

class ScenarioEngine:
    """
    Manages in-memory scenarios, applies disruptions to deep copies of data,
    executes the CP-SAT re-planner, and produces What-If comparison deltas.
    """

    def __init__(self):
        self._scenarios: Dict[str, ScenarioItem] = {}

    def create_scenario(self, req: ScenarioCreateRequest) -> ScenarioItem:
        scen_id = f"SCEN-{uuid.uuid4().hex[:8].upper()}"
        item = ScenarioItem(
            scenario_id=scen_id,
            name=req.name,
            description=req.description or "",
            disruptions=[d.model_dump() for d in req.disruptions],
            created_at=datetime.now(timezone.utc).isoformat(),
            status="CREATED",
            result=None,
        )
        self._scenarios[scen_id] = item
        return item

    def get_scenario(self, scenario_id: str) -> Optional[ScenarioItem]:
        return self._scenarios.get(scenario_id)

    def list_scenarios(self) -> List[ScenarioItem]:
        return list(self._scenarios.values())

    def delete_scenario(self, scenario_id: str) -> bool:
        if scenario_id in self._scenarios:
            del self._scenarios[scenario_id]
            return True
        return False

    def apply_disruptions(
        self,
        base_tasks: List[Dict[str, Any]],
        base_trains: List[Dict[str, Any]],
        base_windows: List[Dict[str, Any]],
        base_pool: Optional[ResourcePool],
        disruptions: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], ResourcePool]:
        """
        Deep-copy baseline structures and apply disruptions immutably.
        Guarantees that input lists are never mutated in place.
        """
        sim_tasks = copy.deepcopy(base_tasks)
        sim_trains = copy.deepcopy(base_trains)
        sim_windows = copy.deepcopy(base_windows)
        sim_pool = copy.deepcopy(base_pool) if base_pool else ResourcePool.default_railway_pool()

        for d in disruptions:
            d_type = d.get("type")

            # 1. Train Delay
            if d_type == "train_delay":
                t_id = str(d.get("train_id", "")).strip().lower()
                delay_mins = int(d.get("delay_minutes", 0))
                matched = False
                for train in sim_trains:
                    tr_id = str(train.get("id", "")).strip().lower()
                    tr_name = str(train.get("train", "")).strip().lower()
                    if t_id in tr_id or t_id in tr_name:
                        try:
                            s_dt = _parse_iso(train["overlap_start"]) + timedelta(minutes=delay_mins)
                            e_dt = _parse_iso(train["overlap_end"]) + timedelta(minutes=delay_mins)
                            train["overlap_start"] = s_dt.isoformat()
                            train["overlap_end"] = e_dt.isoformat()
                            train["impact"] = f"Delayed by +{delay_mins} mins: {train.get('impact', '')}"
                            matched = True
                        except Exception as ex:
                            logger.error("Failed to parse train times for delay: %s", ex)
                if not matched:
                    logger.warning("Train delay target '%s' not found in active movements.", t_id)

            # 2. Train Cancellation
            elif d_type == "train_cancellation":
                t_id = str(d.get("train_id", "")).strip().lower()
                sim_trains = [
                    tr for tr in sim_trains
                    if t_id not in str(tr.get("id", "")).strip().lower()
                    and t_id not in str(tr.get("train", "")).strip().lower()
                ]

            # 3. Emergency Track Blockage
            elif d_type == "emergency_blockage":
                sec = str(d.get("section_id") or d.get("section_code", "")).strip()
                cor = str(d.get("corridor_id", "")).strip()
                loc = str(d.get("location", "")).strip() or sec
                s_str = d.get("start_time", "")
                e_str = d.get("end_time", "")
                desc = d.get("description", "Emergency Track Blockage")
                # Insert as hard corridor blockage train movement to force avoidance
                emergency_train = {
                    "id": f"EMERGENCY-BLOCK-{uuid.uuid4().hex[:6].upper()}",
                    "train": f"CORRIDOR CLOSURE: {desc}",
                    "section_code": sec,
                    "section_id": sec,
                    "corridor_id": cor,
                    "location": loc,
                    "overlap_start": s_str,
                    "overlap_end": e_str,
                    "conflict_type": "Emergency Track Fracture / Corridor Blockage",
                    "severity": "CRITICAL",
                    "impact": "Track impassable due to emergency defect inspection.",
                    "status": "UNRESOLVED",
                }
                sim_trains.append(emergency_train)

            # 4. Maintenance Window Closure
            elif d_type == "window_closure":
                w_id = str(d.get("window_id", "")).strip().lower()
                c_type = d.get("closure_type", "full")
                if c_type == "full":
                    sim_windows = [
                        w for w in sim_windows if str(w.get("id", "")).strip().lower() != w_id
                    ]
                elif c_type == "shorten":
                    new_end = d.get("new_end_time")
                    if new_end:
                        for w in sim_windows:
                            if str(w.get("id", "")).strip().lower() == w_id:
                                w["end_time"] = new_end

            # 5. Resource Reduction
            elif d_type == "resource_reduction":
                r_type = d.get("resource_type", "crew")
                t_name = str(d.get("type_name", "")).strip().lower()
                new_cap = int(d.get("new_capacity", 0))
                if r_type == "crew":
                    sim_pool.crews[t_name] = CrewResource(
                        crew_id=f"CREW-{t_name.upper()}-MOD",
                        crew_type=t_name,
                        capacity=new_cap
                    )
                elif r_type == "machine":
                    sim_pool.machines[t_name] = MachineResource(
                        machine_id=f"MCH-{t_name.upper()}-MOD",
                        machine_type=t_name,
                        capacity=new_cap
                    )

        return sim_tasks, sim_trains, sim_windows, sim_pool

    def run_scenario(
        self,
        scenario_id: str,
        base_tasks: List[Dict[str, Any]],
        base_trains: List[Dict[str, Any]],
        base_windows: List[Dict[str, Any]],
        base_pool: Optional[ResourcePool] = None,
    ) -> WhatIfComparison:
        """
        Execute What-If simulation:
        1. Produce baseline schedule snapshot (if not already cached)
        2. Apply disruptions to cloned data
        3. Run CP-SAT / fallback scheduler
        4. Detect conflicts
        5. Compute delta comparison
        """
        scenario = self.get_scenario(scenario_id)
        if not scenario:
            raise KeyError(f"Scenario '{scenario_id}' not found.")

        scenario.status = "RUNNING"

        try:
            # 1. Baseline Schedule
            prioritized_base = prioritize_tasks(base_tasks)
            base_result = schedule_blocks(
                tasks=prioritized_base,
                candidate_windows=base_windows,
                train_movements=base_trains,
                initial_conflicts_count=len(base_trains),
                resource_pool=base_pool,
            )

            # 2. Apply Disruptions on Isolated Clones
            sim_tasks, sim_trains, sim_windows, sim_pool = self.apply_disruptions(
                base_tasks=base_tasks,
                base_trains=base_trains,
                base_windows=base_windows,
                base_pool=base_pool,
                disruptions=scenario.disruptions,
            )

            # 3. Re-Optimize using CP-SAT with Fallback
            prioritized_sim = prioritize_tasks(sim_tasks)
            sim_result = schedule_blocks(
                tasks=prioritized_sim,
                candidate_windows=sim_windows,
                train_movements=sim_trains,
                initial_conflicts_count=len(sim_trains),
                resource_pool=sim_pool,
            )

            # 4. Conflict Detection on Scenario Outcome
            sim_detected_conflicts = detect_conflicts(sim_result.scheduled_blocks, sim_trains)

            # 5. What-If Delta Analysis
            comparison = self._compare_schedules(
                base_blocks=base_result.scheduled_blocks,
                scenario_blocks=sim_result.scheduled_blocks,
                base_conflicts_count=len(base_trains),
                scenario_conflicts_after=len(sim_detected_conflicts),
                scheduler_type=sim_result.scheduler_type,
                optimization_score=sim_result.optimization_score,
                resource_pool=sim_pool,
            )

            scenario.status = "COMPLETED"
            scenario.result = comparison
            return comparison

        except Exception as e:
            scenario.status = "FAILED"
            logger.exception("Scenario execution failed: %s", e)
            raise e

    def _compare_schedules(
        self,
        base_blocks: List[Dict[str, Any]],
        scenario_blocks: List[Dict[str, Any]],
        base_conflicts_count: int,
        scenario_conflicts_after: int,
        scheduler_type: str,
        optimization_score: str,
        resource_pool: ResourcePool,
    ) -> WhatIfComparison:
        """
        Compare base blocks vs scenario blocks to identify changed task assignments.
        """
        # Map: task_title -> (window_id, start_time, end_time)
        base_task_map: Dict[str, Tuple[str, str, str]] = {}
        for b in base_blocks:
            w_id = b.get("id", "")
            s_time = b.get("start_time", "")
            e_time = b.get("end_time", "")
            for t_title in b.get("assigned_tasks", []):
                base_task_map[t_title] = (w_id, s_time, e_time)

        scenario_task_map: Dict[str, Tuple[str, str, str]] = {}
        for b in scenario_blocks:
            w_id = b.get("id", "")
            s_time = b.get("start_time", "")
            e_time = b.get("end_time", "")
            for t_title in b.get("assigned_tasks", []):
                scenario_task_map[t_title] = (w_id, s_time, e_time)

        all_titles = set(base_task_map.keys()).union(set(scenario_task_map.keys()))

        tasks_new: List[str] = []
        tasks_removed: List[str] = []
        tasks_moved: List[str] = []
        tasks_unchanged: List[str] = []
        changed_tasks: List[ChangedTaskItem] = []

        for title in sorted(all_titles):
            in_base = title in base_task_map
            in_scen = title in scenario_task_map

            if in_base and not in_scen:
                tasks_removed.append(title)
                bw, bs, be = base_task_map[title]
                changed_tasks.append(
                    ChangedTaskItem(
                        task_id=title,
                        task_title=title,
                        base_window=bw,
                        base_start=bs,
                        base_end=be,
                        status="REMOVED",
                    )
                )
            elif not in_base and in_scen:
                tasks_new.append(title)
                sw, ss, se = scenario_task_map[title]
                changed_tasks.append(
                    ChangedTaskItem(
                        task_id=title,
                        task_title=title,
                        scenario_window=sw,
                        scenario_start=ss,
                        scenario_end=se,
                        status="NEW",
                    )
                )
            else:
                bw, bs, be = base_task_map[title]
                sw, ss, se = scenario_task_map[title]
                if bw != sw or bs != ss or be != se:
                    tasks_moved.append(title)
                    changed_tasks.append(
                        ChangedTaskItem(
                            task_id=title,
                            task_title=title,
                            base_window=bw,
                            scenario_window=sw,
                            base_start=bs,
                            scenario_start=ss,
                            base_end=be,
                            scenario_end=se,
                            status="MOVED",
                        )
                    )
                else:
                    tasks_unchanged.append(title)
                    changed_tasks.append(
                        ChangedTaskItem(
                            task_id=title,
                            task_title=title,
                            base_window=bw,
                            scenario_window=sw,
                            base_start=bs,
                            scenario_start=ss,
                            base_end=be,
                            scenario_end=se,
                            status="UNCHANGED",
                        )
                    )

        conflicts_res = max(0, base_conflicts_count - scenario_conflicts_after)
        newly_introduced = max(0, scenario_conflicts_after - base_conflicts_count)

        resource_impact = {
            "crew_capacities": {k: v.capacity for k, v in resource_pool.crews.items()},
            "machine_capacities": {k: v.capacity for k, v in resource_pool.machines.items()},
        }

        return WhatIfComparison(
            tasks_scheduled_base=len(base_task_map),
            tasks_scheduled_scenario=len(scenario_task_map),
            tasks_new=tasks_new,
            tasks_removed=tasks_removed,
            tasks_moved=tasks_moved,
            tasks_unchanged=tasks_unchanged,
            changed_tasks=changed_tasks,
            conflicts_before=base_conflicts_count,
            conflicts_after=scenario_conflicts_after,
            conflicts_resolved=conflicts_res,
            newly_introduced_conflicts=newly_introduced,
            optimization_score=optimization_score,
            scheduler_type=scheduler_type,
            resource_impact=resource_impact,
        )


# Global scenario engine singleton
scenario_engine = ScenarioEngine()
