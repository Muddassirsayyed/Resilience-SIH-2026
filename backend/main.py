from typing import List, Optional
from datetime import datetime, timezone
import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.config import config
from services.prioritization import prioritize_tasks
from services.clustering import cluster_tasks
from services.scheduler import schedule_blocks
from services.conflicts import detect_conflicts
from services.data_loader import load_tasks_from_csv, load_trains_from_csv, load_windows_from_csv
from services.scenario import ScenarioCreateRequest, scenario_engine
from services.network import network_graph
from services.network_sync import network_sync_service, NetworkImpactRequest

# Structured Logging Configuration
logging.basicConfig(
    level=getattr(logging, config.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("resilience.api")

app = FastAPI(
    title=config.app_name,
    description="Intelligent Railway Maintenance Block Planner & Network Synchronization API",
    version=config.app_version,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Observability Request Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        "HTTP %s %s status=%d duration=%.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response

# Pydantic Schemas
class BlockPlanItem(BaseModel):
    id: str
    location: str
    start_time: str
    end_time: str
    assigned_tasks: List[str]
    status: str
    section_code: str
    priority: str

class ConflictAlertItem(BaseModel):
    id: str
    task: str
    train: str
    location: str
    overlap_start: str
    overlap_end: str
    conflict_type: str
    severity: str
    impact: str
    status: str

class PlanGenerateResponse(BaseModel):
    success: bool
    message: str
    before_conflict_count: int
    after_conflict_count: int
    conflicts_resolved: int
    optimization_score: str
    generated_at: str

class MaintenanceTaskItem(BaseModel):
    id: str
    title: str
    location: str
    section_code: str
    department: str
    duration_hours: float
    criticality: float
    safety: float
    overdue: float
    train_impact: float
    asset_impact: float
    status: str
    description: Optional[str] = None

class PrioritizedTaskItem(MaintenanceTaskItem):
    priority_score: float

class PrioritizedTasksResponse(BaseModel):
    success: bool
    total: int
    data: List[PrioritizedTaskItem]
    grouped: Optional[dict] = None

# In-Memory State
is_regenerated = False

INITIAL_BLOCK_PLANS = [
    {
        "id": "BP-2026-001",
        "location": "New Delhi - Ghaziabad Section (KM 12-18, Track Line 3)",
        "start_time": "2026-09-28T01:30:00Z",
        "end_time": "2026-09-28T05:30:00Z",
        "assigned_tasks": [
            "Overhead Catenary Line Replacement",
            "Track Ballast Tamping & Alignment",
            "Signal Junction Relay Box Testing"
        ],
        "status": "SCHEDULED",
        "section_code": "NDLS-GZB-L3",
        "priority": "HIGH"
    },
    {
        "id": "BP-2026-002",
        "location": "Mathura Junction North Yard (KM 142-145, Line 1)",
        "start_time": "2026-09-28T03:00:00Z",
        "end_time": "2026-09-28T07:00:00Z",
        "assigned_tasks": [
            "Turnout Switch Diamond Crossing Renewal",
            "Ultrasonic Rail Flaw Detection (USFD)"
        ],
        "status": "PENDING_OPTIMIZATION",
        "section_code": "MTJ-NY-L1",
        "priority": "CRITICAL"
    },
    {
        "id": "BP-2026-003",
        "location": "Agra Cantt - Tundla Main Line (KM 204-210, Up Line)",
        "start_time": "2026-09-28T08:00:00Z",
        "end_time": "2026-09-28T11:30:00Z",
        "assigned_tasks": [
            "Bridge Span Structural Inspection",
            "Automatic Block Signaling Cable Laying"
        ],
        "status": "APPROVED",
        "section_code": "AGC-TDL-UP",
        "priority": "MEDIUM"
    },
    {
        "id": "BP-2026-004",
        "location": "Kanpur Central West Yard (KM 430-434, Line 4)",
        "start_time": "2026-09-28T12:00:00Z",
        "end_time": "2026-09-28T15:00:00Z",
        "assigned_tasks": [
            "Third Rail / OHE Maintenance",
            "Substation Transformer Inspection"
        ],
        "status": "SCHEDULED",
        "section_code": "CNB-WY-L4",
        "priority": "NORMAL"
    }
]

REGENERATED_BLOCK_PLANS = [
    {
        "id": "BP-2026-001",
        "location": "New Delhi - Ghaziabad Section (KM 12-18, Track Line 3)",
        "start_time": "2026-09-28T00:30:00Z",
        "end_time": "2026-09-28T04:00:00Z",
        "assigned_tasks": [
            "Overhead Catenary Line Replacement",
            "Track Ballast Tamping & Alignment",
            "Signal Junction Relay Box Testing"
        ],
        "status": "OPTIMIZED & RESOLVED",
        "section_code": "NDLS-GZB-L3",
        "priority": "HIGH"
    },
    {
        "id": "BP-2026-002",
        "location": "Mathura Junction North Yard (KM 142-145, Line 1)",
        "start_time": "2026-09-28T05:00:00Z",
        "end_time": "2026-09-28T09:00:00Z",
        "assigned_tasks": [
            "Turnout Switch Diamond Crossing Renewal",
            "Ultrasonic Rail Flaw Detection (USFD)"
        ],
        "status": "OPTIMIZED & RESOLVED",
        "section_code": "MTJ-NY-L1",
        "priority": "CRITICAL"
    },
    {
        "id": "BP-2026-003",
        "location": "Agra Cantt - Tundla Main Line (KM 204-210, Up Line)",
        "start_time": "2026-09-28T09:30:00Z",
        "end_time": "2026-09-28T13:00:00Z",
        "assigned_tasks": [
            "Bridge Span Structural Inspection",
            "Automatic Block Signaling Cable Laying"
        ],
        "status": "OPTIMIZED & RESOLVED",
        "section_code": "AGC-TDL-UP",
        "priority": "MEDIUM"
    },
    {
        "id": "BP-2026-004",
        "location": "Kanpur Central West Yard (KM 430-434, Line 4)",
        "start_time": "2026-09-28T13:30:00Z",
        "end_time": "2026-09-28T16:30:00Z",
        "assigned_tasks": [
            "Third Rail / OHE Maintenance",
            "Substation Transformer Inspection"
        ],
        "status": "SCHEDULED",
        "section_code": "CNB-WY-L4",
        "priority": "NORMAL"
    }
]

INITIAL_CONFLICTS = [
    {
        "id": "CONF-801",
        "task": "Turnout Switch Diamond Crossing Renewal (BP-2026-002)",
        "train": "12626 Kerala Express (NDLS -> TVC)",
        "location": "Mathura Junction North Yard (KM 142-145)",
        "overlap_start": "2026-09-28T03:45:00Z",
        "overlap_end": "2026-09-28T04:30:00Z",
        "conflict_type": "Track Block vs Express Passage Overlap",
        "severity": "CRITICAL",
        "impact": "High risk of train stoppage or track maintenance collision window overlap.",
        "status": "UNRESOLVED"
    },
    {
        "id": "CONF-802",
        "task": "Overhead Catenary Line Replacement (BP-2026-001)",
        "train": "12004 Lucknow Shatabdi Express",
        "location": "New Delhi - Ghaziabad Section (KM 12-18)",
        "overlap_start": "2026-09-28T04:15:00Z",
        "overlap_end": "2026-09-28T05:00:00Z",
        "conflict_type": "Power Block Line De-energization",
        "severity": "CRITICAL",
        "impact": "Electric locomotive power disruption on Line 3 during overhead wire maintenance.",
        "status": "UNRESOLVED"
    },
    {
        "id": "CONF-803",
        "task": "Bridge Span Structural Inspection (BP-2026-003)",
        "train": "22436 Vande Bharat Express",
        "location": "Agra Cantt - Tundla Main Line (KM 204-210)",
        "overlap_start": "2026-09-28T08:30:00Z",
        "overlap_end": "2026-09-28T09:00:00Z",
        "conflict_type": "Speed Restriction & Track Occupation",
        "severity": "HIGH",
        "impact": "Speed restricted to 20 km/h during bridge structural sensor testing.",
        "status": "UNRESOLVED"
    }
]

REGENERATED_CONFLICTS = []  # All conflicts resolved!

INITIAL_MAINTENANCE_TASKS = [
    {
        "id": "TASK-MTJ-01",
        "title": "Turnout Switch Diamond Crossing Renewal",
        "location": "Mathura Junction North Yard (KM 142-145)",
        "section_code": "MTJ-NY-L1",
        "department": "Engineering / Track",
        "duration_hours": 4.0,
        "criticality": 9.5,
        "safety": 9.8,
        "overdue": 8.5,
        "train_impact": 9.0,
        "asset_impact": 8.0,
        "status": "PENDING_BLOCK",
        "description": "High risk crossing point renewal on high-speed Delhi-Mumbai corridor"
    },
    {
        "id": "TASK-GZB-02",
        "title": "Overhead Catenary Line Replacement",
        "location": "New Delhi - Ghaziabad Section (KM 12-18)",
        "section_code": "NDLS-GZB-L3",
        "department": "Electrical / TRD",
        "duration_hours": 3.5,
        "criticality": 9.0,
        "safety": 8.5,
        "overdue": 7.0,
        "train_impact": 8.5,
        "asset_impact": 7.5,
        "status": "PENDING_BLOCK",
        "description": "Contact wire replacement to eliminate spark gaps on 25kV traction line"
    },
    {
        "id": "TASK-AGC-03",
        "title": "Bridge Span Structural Inspection",
        "location": "Agra Cantt - Tundla Main Line (KM 204-210)",
        "section_code": "AGC-TDL-UP",
        "department": "Civil / Bridges",
        "duration_hours": 3.5,
        "criticality": 8.0,
        "safety": 9.0,
        "overdue": 6.5,
        "train_impact": 7.0,
        "asset_impact": 7.0,
        "status": "PENDING_BLOCK",
        "description": "Ultrasonic testing of bridge piers and girders under live loads"
    },
    {
        "id": "TASK-GZB-04",
        "title": "Signal Junction Relay Box Testing",
        "location": "New Delhi - Ghaziabad Section (KM 12-18)",
        "section_code": "NDLS-GZB-L3",
        "department": "Signaling & Telecom",
        "duration_hours": 2.5,
        "criticality": 8.5,
        "safety": 8.0,
        "overdue": 7.5,
        "train_impact": 7.0,
        "asset_impact": 6.5,
        "status": "PENDING_BLOCK",
        "description": "Solid-state interlocking relay inspection and fail-safe signal testing"
    },
    {
        "id": "TASK-MTJ-05",
        "title": "Ultrasonic Rail Flaw Detection (USFD)",
        "location": "Mathura Junction North Yard (KM 142-145)",
        "section_code": "MTJ-NY-L1",
        "department": "Engineering / Track",
        "duration_hours": 3.0,
        "criticality": 8.5,
        "safety": 9.2,
        "overdue": 5.5,
        "train_impact": 6.5,
        "asset_impact": 7.0,
        "status": "PENDING_BLOCK",
        "description": "B-scan ultrasonic flaw detection to catch internal rail fissures"
    },
    {
        "id": "TASK-CNB-06",
        "title": "Substation Transformer Inspection",
        "location": "Kanpur Central West Yard (KM 430-434)",
        "section_code": "CNB-WY-L4",
        "department": "Electrical / TRD",
        "duration_hours": 3.0,
        "criticality": 7.5,
        "safety": 7.0,
        "overdue": 6.0,
        "train_impact": 6.0,
        "asset_impact": 8.5,
        "status": "SCHEDULED",
        "description": "Traction power transformer oil testing and bushing thermal scan"
    },
    {
        "id": "TASK-GZB-07",
        "title": "Track Ballast Tamping & Alignment",
        "location": "New Delhi - Ghaziabad Section (KM 12-18)",
        "section_code": "NDLS-GZB-L3",
        "department": "Engineering / Track",
        "duration_hours": 4.0,
        "criticality": 7.0,
        "safety": 6.5,
        "overdue": 5.0,
        "train_impact": 7.5,
        "asset_impact": 6.0,
        "status": "SCHEDULED",
        "description": "Heavy tamping machine alignment for high-density commuter track"
    },
    {
        "id": "TASK-CNB-08",
        "title": "Third Rail / OHE Maintenance",
        "location": "Kanpur Central West Yard (KM 430-434)",
        "section_code": "CNB-WY-L4",
        "department": "Electrical / TRD",
        "duration_hours": 3.0,
        "criticality": 6.5,
        "safety": 6.0,
        "overdue": 4.5,
        "train_impact": 5.5,
        "asset_impact": 6.0,
        "status": "SCHEDULED",
        "description": "Pantograph contact insulator washing and tension balance check"
    }
]

# Canonical CSV data loading with robust fallback
_csv_tasks = load_tasks_from_csv()
_csv_trains = load_trains_from_csv()
_csv_init_windows = load_windows_from_csv(window_type="INITIAL")
_csv_res_windows = load_windows_from_csv(window_type="RESOLVED")

if _csv_tasks:
    INITIAL_MAINTENANCE_TASKS = _csv_tasks
TRAIN_MOVEMENTS = _csv_trains if _csv_trains else INITIAL_CONFLICTS
if _csv_init_windows:
    INITIAL_BLOCK_PLANS = _csv_init_windows
if _csv_res_windows:
    REGENERATED_BLOCK_PLANS = _csv_res_windows

# Dynamically compute initial conflicts from block plans and train timetables
INITIAL_CONFLICTS = detect_conflicts(INITIAL_BLOCK_PLANS, TRAIN_MOVEMENTS)

# In-Memory State
is_regenerated = False
current_block_plans = INITIAL_BLOCK_PLANS
current_conflicts = INITIAL_CONFLICTS

@app.get("/")
def read_root():
    return {"status": "online", "service": "Resilience-SIH-2026 Backend API"}

@app.get("/api/plan", response_model=dict)
def get_block_plan():
    """Retrieve current block plan data"""
    plans = current_block_plans if is_regenerated else INITIAL_BLOCK_PLANS
    return {"success": True, "data": plans, "total": len(plans)}

@app.get("/api/conflicts", response_model=dict)
def get_conflicts():
    """Retrieve current conflict alerts data"""
    conflicts = current_conflicts if is_regenerated else INITIAL_CONFLICTS
    return {"success": True, "data": conflicts, "total": len(conflicts)}

@app.get("/api/prioritized-tasks", response_model=PrioritizedTasksResponse)
def get_prioritized_tasks():
    """Retrieve maintenance tasks prioritized by AI scoring engine and grouped hierarchically"""
    prioritized = prioritize_tasks(INITIAL_MAINTENANCE_TASKS)
    grouped = cluster_tasks(prioritized)
    return PrioritizedTasksResponse(
        success=True,
        total=len(prioritized),
        data=prioritized,
        grouped=grouped
    )

@app.post("/api/plan/generate-plan", response_model=PlanGenerateResponse)
def generate_plan():
    """Execute AI end-to-end constraint-scheduling and conflict-resolution pipeline"""
    global is_regenerated, current_block_plans, current_conflicts
    before_cnt = len(current_conflicts)
    
    # 1. Prioritize tasks
    prioritized_tasks = prioritize_tasks(INITIAL_MAINTENANCE_TASKS)
    
    # 2. Constraint scheduler into conflict-free windows
    result = schedule_blocks(
        tasks=prioritized_tasks,
        candidate_windows=REGENERATED_BLOCK_PLANS,
        train_movements=TRAIN_MOVEMENTS,
        initial_conflicts_count=before_cnt
    )
    # 3. Validate generated schedule using independent validator (non‑blocking)
    from services.validator import validate_schedule
    # Validation errors will be logged but will not abort the API response
    validate_schedule(result.scheduled_blocks, INITIAL_MAINTENANCE_TASKS, TRAIN_MOVEMENTS, raise_exception=False)

    # 4. Dynamic conflict detection on the scheduled blocks
    detected_conflicts = detect_conflicts(result.scheduled_blocks, TRAIN_MOVEMENTS)
    
    is_regenerated = True
    current_block_plans = result.scheduled_blocks
    current_conflicts = detected_conflicts
    after_cnt = len(current_conflicts)
    resolved_count = max(0, before_cnt - after_cnt)
    
    return PlanGenerateResponse(
        success=True,
        message="Resilience Block Plan successfully regenerated and optimized using AI priority scores and constraint scheduler.",
        before_conflict_count=before_cnt,
        after_conflict_count=after_cnt,
        conflicts_resolved=resolved_count,
        optimization_score=result.optimization_score,
        generated_at=datetime.now(timezone.utc).isoformat()
    )

@app.post("/api/plan/reset", response_model=dict)
def reset_plan():
    """Reset plan back to initial state for testing"""
    global is_regenerated, current_block_plans, current_conflicts
    is_regenerated = False
    current_block_plans = INITIAL_BLOCK_PLANS
    current_conflicts = detect_conflicts(INITIAL_BLOCK_PLANS, TRAIN_MOVEMENTS)
    return {"success": True, "message": "Plan state reset to initial conflicts."}


# ---------------------------------------------------------
# Dynamic Disruption & What-If Scenario Endpoints
# ---------------------------------------------------------

@app.post("/api/scenarios", response_model=dict)
def create_scenario(req: ScenarioCreateRequest):
    """Create a new What-If operational scenario with disruptions"""
    try:
        scenario = scenario_engine.create_scenario(req)
        return {
            "success": True,
            "scenario_id": scenario.scenario_id,
            "status": scenario.status,
            "data": scenario.model_dump(),
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/scenarios/{scenario_id}/run", response_model=dict)
def run_scenario(scenario_id: str):
    """Execute What-If scenario simulation against isolated base dataset snapshot"""
    scenario = scenario_engine.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    try:
        comparison = scenario_engine.run_scenario(
            scenario_id=scenario_id,
            base_tasks=INITIAL_MAINTENANCE_TASKS,
            base_trains=TRAIN_MOVEMENTS,
            base_windows=REGENERATED_BLOCK_PLANS,
        )
        return {
            "success": True,
            "scenario_id": scenario_id,
            "status": "COMPLETED",
            "result": comparison.model_dump(),
        }
    except KeyError as ke:
        raise HTTPException(status_code=404, detail=str(ke))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scenario simulation failed: {exc}")


@app.get("/api/scenarios", response_model=dict)
def list_scenarios():
    """List all created operational What-If scenarios"""
    scenarios = scenario_engine.list_scenarios()
    return {
        "success": True,
        "total": len(scenarios),
        "data": [s.model_dump() for s in scenarios],
    }


@app.get("/api/scenarios/{scenario_id}", response_model=dict)
def get_scenario(scenario_id: str):
    """Retrieve details and simulation results for a specific scenario"""
    scenario = scenario_engine.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    return {
        "success": True,
        "data": scenario.model_dump(),
    }


@app.delete("/api/scenarios/{scenario_id}", response_model=dict)
def delete_scenario(scenario_id: str):
    """Delete a temporary What-If scenario"""
    deleted = scenario_engine.delete_scenario(scenario_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    return {
        "success": True,
        "message": f"Scenario '{scenario_id}' successfully deleted.",
    }


# ---------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------

@app.get("/api/health", response_model=dict)
def get_health():
    """Retrieve service health, version, active scheduler mode, and fallback status"""
    from services.cp_sat_scheduler import ORTOOLS_AVAILABLE
    return {
        "status": "ok",
        "version": config.app_version,
        "environment": config.environment,
        "scheduler": "cp_sat" if ORTOOLS_AVAILABLE else "deterministic_fallback",
        "fallback_available": True,
    }


# ---------------------------------------------------------
# Multi-Corridor Railway Network Endpoints
# ---------------------------------------------------------

@app.get("/api/network", response_model=dict)
def get_network_topology():
    """Retrieve full multi-corridor railway network topology"""
    topology = network_graph.get_topology()
    return {
        "success": True,
        "total_corridors": len(topology.corridors),
        "data": topology.model_dump(),
    }


@app.get("/api/network/corridors/{corridor_id}", response_model=dict)
def get_corridor(corridor_id: str):
    """Retrieve details and section list for a specific railway corridor"""
    corridor = network_graph.get_corridor(corridor_id)
    if not corridor:
        raise HTTPException(status_code=404, detail=f"Corridor '{corridor_id}' not found.")
    return {
        "success": True,
        "data": corridor.model_dump(),
    }


@app.get("/api/network/sections/{section_id}", response_model=dict)
def get_section(section_id: str):
    """Retrieve section attributes and neighboring section linkages"""
    section = network_graph.get_section(section_id)
    if not section:
        raise HTTPException(status_code=404, detail=f"Section '{section_id}' not found.")
    neighbors = network_graph.get_neighboring_sections(section_id)
    corridors = network_graph.get_corridors_for_section(section_id)
    return {
        "success": True,
        "data": {
            "section": section.model_dump(),
            "neighbors": [n.model_dump() for n in neighbors],
            "corridors": [c.corridor_id for c in corridors],
        },
    }


@app.post("/api/network/impact", response_model=dict)
def analyze_network_impact(req: NetworkImpactRequest):
    """Calculate operational and safety impact of a block/event on corridor sections"""
    try:
        impact = network_sync_service.calculate_impact(
            req=req,
            tasks=INITIAL_MAINTENANCE_TASKS,
            train_movements=TRAIN_MOVEMENTS,
            block_plans=current_block_plans,
        )
        return {
            "success": True,
            "data": impact.model_dump(),
        }
    except KeyError as ke:
        raise HTTPException(status_code=404, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Impact calculation failed: {exc}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

