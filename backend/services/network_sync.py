"""
Network Synchronization & Multi-Corridor Impact Analysis Service.

Coordinates network topology safety rules, corridor-aware conflict detection,
and dynamic impact calculations for maintenance planning and emergency events.
"""

from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .cp_sat_scheduler import _parse_iso, check_temporal_overlap
from .network import CorridorModel, SectionModel, network_graph

logger = logging.getLogger(__name__)


class NetworkImpactRequest(BaseModel):
    """Input payload for dynamic network corridor impact analysis."""
    section_id: str = Field(..., description="Target railway section identifier, e.g. MTJ-NY-L1")
    start_time: str = Field(..., description="ISO 8601 start timestamp of event/maintenance")
    end_time: str = Field(..., description="ISO 8601 end timestamp of event/maintenance")
    impact_type: Optional[str] = Field(default="maintenance", description="maintenance, emergency, or weather")
    include_adjacent: Optional[bool] = Field(default=False, description="Whether to include adjacent sections in safety perimeter")


class NetworkImpactResponse(BaseModel):
    """Calculated operational impact of an event on network corridors."""
    section_id: str
    affected_section: Optional[SectionModel]
    adjacent_sections: List[SectionModel]
    affected_corridors: List[CorridorModel]
    affected_tasks: List[Dict[str, Any]]
    affected_trains: List[Dict[str, Any]]
    total_impacted_tasks: int
    total_impacted_trains: int
    status: str = "EVALUATED"


class NetworkSyncService:
    """
    Evaluates multi-corridor network relationships, tracks section occupancy,
    and calculates operational impact without duplicating the optimization engine.
    """

    def __init__(self, graph=network_graph):
        self.graph = graph

    def check_section_overlap(
        self,
        section_id: str,
        start_time: str,
        end_time: str,
        train_movements: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Check if any train is scheduled on section_id during [start_time, end_time].
        """
        conflicting_trains: List[Dict[str, Any]] = []
        try:
            s_dt = _parse_iso(start_time)
            e_dt = _parse_iso(end_time)
        except Exception:
            return conflicting_trains

        for train in train_movements:
            _, tr_sec = self.graph.map_train_to_network(train)
            if tr_sec and tr_sec == section_id:
                try:
                    t_start = _parse_iso(train["overlap_start"])
                    t_end = _parse_iso(train["overlap_end"])
                    if check_temporal_overlap(s_dt, e_dt, t_start, t_end):
                        conflicting_trains.append(train)
                except Exception:
                    continue

        return conflicting_trains

    def calculate_impact(
        self,
        req: NetworkImpactRequest,
        tasks: List[Dict[str, Any]],
        train_movements: List[Dict[str, Any]],
        block_plans: Optional[List[Dict[str, Any]]] = None,
    ) -> NetworkImpactResponse:
        """
        Compute real-time operational impact for a given corridor section and time window.
        """
        target_sec = self.graph.get_section(req.section_id)
        if not target_sec:
            raise KeyError(f"Section '{req.section_id}' does not exist in network topology.")

        adjacent_secs = self.graph.get_neighboring_sections(req.section_id)
        corridors = self.graph.get_corridors_for_section(req.section_id)

        try:
            req_start = _parse_iso(req.start_time)
            req_end = _parse_iso(req.end_time)
        except Exception as exc:
            raise ValueError(f"Invalid ISO datetime format: {exc}")

        # Impacted sections scope
        evaluated_section_ids = {req.section_id}
        if req.include_adjacent:
            for adj in adjacent_secs:
                evaluated_section_ids.add(adj.section_id)

        # 1. Identify Impacted Trains
        impacted_trains: List[Dict[str, Any]] = []
        for train in train_movements:
            _, t_sec = self.graph.map_train_to_network(train)
            if t_sec in evaluated_section_ids:
                try:
                    t_start = _parse_iso(train["overlap_start"])
                    t_end = _parse_iso(train["overlap_end"])
                    if check_temporal_overlap(req_start, req_end, t_start, t_end):
                        impacted_trains.append(train)
                except Exception:
                    continue

        # 2. Identify Impacted Tasks
        impacted_tasks: List[Dict[str, Any]] = []
        # Check active blocks if provided
        if block_plans:
            for b in block_plans:
                _, b_sec = self.graph.map_train_to_network(b)
                if b_sec in evaluated_section_ids:
                    try:
                        b_start = _parse_iso(b["start_time"])
                        b_end = _parse_iso(b["end_time"])
                        if check_temporal_overlap(req_start, req_end, b_start, b_end):
                            for task_title in b.get("assigned_tasks", []):
                                impacted_tasks.append({
                                    "title": task_title,
                                    "section_id": b_sec,
                                    "window_id": b.get("id"),
                                    "start_time": b.get("start_time"),
                                    "end_time": b.get("end_time"),
                                })
                    except Exception:
                        continue

        # Also check maintenance task pool matching section
        for t in tasks:
            _, t_sec = self.graph.map_task_to_network(t)
            if t_sec in evaluated_section_ids:
                if not any(it["title"] == t.get("title") for it in impacted_tasks):
                    impacted_tasks.append({
                        "id": t.get("id"),
                        "title": t.get("title"),
                        "section_id": t_sec,
                        "department": t.get("department"),
                        "duration_hours": t.get("duration_hours"),
                    })

        return NetworkImpactResponse(
            section_id=req.section_id,
            affected_section=target_sec,
            adjacent_sections=adjacent_secs,
            affected_corridors=corridors,
            affected_tasks=impacted_tasks,
            affected_trains=impacted_trains,
            total_impacted_tasks=len(impacted_tasks),
            total_impacted_trains=len(impacted_trains),
            status="EVALUATED",
        )


# Global synchronization service singleton
network_sync_service = NetworkSyncService()
