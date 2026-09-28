"""
Comprehensive Test Suite for Phase 8: Dynamic Disruption Re-Planning & What-If Scenarios.

Validates:
Test 1 — Scenario creation (valid scenario creates successfully)
Test 2 — Train delay (delayed train shifts conflict window)
Test 3 — Train cancellation (cancelled train removes conflict window)
Test 4 — Emergency track blockage (hard constraint prevents maintenance)
Test 5 — Window closure (tasks depending on closed window re-planned/deferred)
Test 6 — Resource reduction (reduced crew capacity restricts scheduling)
Test 7 — Base immutability (MANDATORY: base datasets and CSV files remain untouched)
Test 8 — Scenario comparison (What-If accurately computes moved/removed/new/unchanged)
Test 9 — Invalid scenario validation (invalid disruptions raise HTTP 400 / ValueError)
Test 10 — API endpoints integration (/api/scenarios CRUD and run flow)
"""

import copy
import os
import pytest
from fastapi.testclient import TestClient

from main import (
    app,
    INITIAL_MAINTENANCE_TASKS,
    TRAIN_MOVEMENTS,
    REGENERATED_BLOCK_PLANS,
)
from services.resources import CrewResource, ResourcePool
from services.scenario import (
    ScenarioCreateRequest,
    TrainDelayDisruption,
    TrainCancellationDisruption,
    EmergencyBlockageDisruption,
    WindowClosureDisruption,
    ResourceReductionDisruption,
    ScenarioEngine,
)


@pytest.fixture
def client():
    return TestClient(app)


def test_test1_scenario_creation():
    """Test 1: Valid scenario creates successfully."""
    engine = ScenarioEngine()
    req = ScenarioCreateRequest(
        name="Test Corridor Disruption",
        description="Testing scenario creation",
        disruptions=[
            TrainDelayDisruption(type="train_delay", train_id="CONF-801", delay_minutes=30)
        ],
    )
    scen = engine.create_scenario(req)
    assert scen.scenario_id.startswith("SCEN-")
    assert scen.name == "Test Corridor Disruption"
    assert scen.status == "CREATED"
    assert len(scen.disruptions) == 1
    assert engine.get_scenario(scen.scenario_id) is not None


def test_test2_train_delay_affects_scheduling():
    """Test 2: Delayed train interval shifts and affects scheduling."""
    engine = ScenarioEngine()
    base_tasks = [
        {
            "id": "TASK-1",
            "title": "Track Maintenance",
            "section_code": "SEC-A",
            "duration_hours": 2.0,
            "criticality": 8.0,
            "safety": 8.0,
        }
    ]
    # Window: 02:00 to 05:00
    base_windows = [
        {
            "id": "WIN-1",
            "section_code": "SEC-A",
            "start_time": "2026-09-28T02:00:00Z",
            "end_time": "2026-09-28T05:00:00Z",
            "assigned_tasks": [],
        }
    ]
    # Train originally at 01:00-01:30 (safe, doesn't overlap window)
    base_trains = [
        {
            "id": "TR-101",
            "train": "Express 101",
            "section_code": "SEC-A",
            "overlap_start": "2026-09-28T01:00:00Z",
            "overlap_end": "2026-09-28T01:30:00Z",
        }
    ]

    # Without delay: task is safely scheduled
    _, trains_no_delay, windows_no_delay, pool = engine.apply_disruptions(
        base_tasks, base_trains, base_windows, None, []
    )
    from services.scheduler import schedule_blocks
    res_before = schedule_blocks(base_tasks, windows_no_delay, trains_no_delay)
    assert "Track Maintenance" in res_before.scheduled_blocks[0]["assigned_tasks"]

    # Disrupt: Delay train by 90 minutes -> new train time: 02:30 to 03:00 (right inside window!)
    # Since window is 02:00-05:00 and task is 2.0h, train 02:30-03:00 splits into 02:00-02:30 (0.5h) and 03:00-05:00 (2.0h).
    # But if train is delayed by 120 minutes -> 03:00 to 03:30, available gaps are 02:00-03:00 (1h) and 03:30-05:00 (1.5h).
    # A 2.0h task cannot fit anywhere!
    disruptions = [{"type": "train_delay", "train_id": "TR-101", "delay_minutes": 120}]
    _, sim_trains, sim_windows, _ = engine.apply_disruptions(
        base_tasks, base_trains, base_windows, None, disruptions
    )
    res_after = schedule_blocks(base_tasks, sim_windows, sim_trains)
    # The conflicting window cannot host the 2.0h task anymore
    assert any(t["id"] == "TASK-1" for t in res_after.deferred_tasks)


def test_test3_train_cancellation():
    """Test 3: Cancelled train no longer blocks its interval."""
    engine = ScenarioEngine()
    task = {
        "id": "TASK-URGENT",
        "title": "Urgent Rail Welding",
        "section_code": "SEC-B",
        "duration_hours": 3.0,
        "criticality": 9.0,
        "safety": 9.0,
    }
    # Window overlapping train
    window = {
        "id": "WIN-B",
        "section_code": "SEC-B",
        "start_time": "2026-09-28T02:00:00Z",
        "end_time": "2026-09-28T06:00:00Z",
        "assigned_tasks": [],
    }
    train = {
        "id": "TR-BLOCKER",
        "train": "Heavy Freight",
        "section_code": "SEC-B",
        "overlap_start": "2026-09-28T03:00:00Z",
        "overlap_end": "2026-09-28T05:00:00Z",
    }

    # Before cancellation: window is rejected due to active train
    from services.scheduler import schedule_blocks
    res_with_train = schedule_blocks([task], [window], [train])
    assert len(res_with_train.unresolved_conflicts) == 1
    assert "Urgent Rail Welding" not in res_with_train.scheduled_blocks[0]["assigned_tasks"]

    # Cancel train via disruption
    disruptions = [{"type": "train_cancellation", "train_id": "TR-BLOCKER"}]
    _, sim_trains, sim_windows, _ = engine.apply_disruptions([task], [train], [window], None, disruptions)
    res_cancelled = schedule_blocks([task], sim_windows, sim_trains)

    # After cancellation: window is clear and task is scheduled!
    assert len(res_cancelled.unresolved_conflicts) == 0
    assert "Urgent Rail Welding" in res_cancelled.scheduled_blocks[0]["assigned_tasks"]


def test_test4_emergency_track_blockage():
    """Test 4: Maintenance cannot be scheduled inside emergency blockage."""
    engine = ScenarioEngine()
    task = {
        "id": "TASK-C",
        "title": "Track Alignment",
        "section_code": "SEC-C",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
    }
    window = {
        "id": "WIN-C",
        "section_code": "SEC-C",
        "start_time": "2026-09-28T04:00:00Z",
        "end_time": "2026-09-28T07:00:00Z",
        "assigned_tasks": [],
    }
    # Inject emergency track fracture from 04:30 to 06:30
    disruptions = [
        {
            "type": "emergency_blockage",
            "section_code": "SEC-C",
            "location": "Corridor C",
            "start_time": "2026-09-28T04:30:00Z",
            "end_time": "2026-09-28T06:30:00Z",
            "description": "Rail Fracture Defect",
        }
    ]

    _, sim_trains, sim_windows, _ = engine.apply_disruptions([task], [], [window], None, disruptions)
    from services.scheduler import schedule_blocks
    res = schedule_blocks([task], sim_windows, sim_trains)

    # Emergency blockage prohibits maintenance track block
    assert len(res.unresolved_conflicts) >= 1
    assert "Track Alignment" not in res.scheduled_blocks[0]["assigned_tasks"]
    assert any(t["id"] == "TASK-C" for t in res.deferred_tasks)


def test_test5_maintenance_window_closure():
    """Test 5: Tasks depending on closed window are re-planned or left unscheduled."""
    engine = ScenarioEngine()
    task = {
        "id": "TASK-D",
        "title": "Substation Check",
        "section_code": "SEC-D",
        "duration_hours": 2.0,
        "criticality": 7.0,
        "safety": 7.0,
    }
    window = {
        "id": "WIN-D",
        "section_code": "SEC-D",
        "start_time": "2026-09-28T02:00:00Z",
        "end_time": "2026-09-28T05:00:00Z",
        "assigned_tasks": [],
    }

    # Fully close window WIN-D
    disruptions = [{"type": "window_closure", "window_id": "WIN-D", "closure_type": "full"}]
    _, sim_trains, sim_windows, _ = engine.apply_disruptions([task], [], [window], None, disruptions)

    assert len(sim_windows) == 0
    from services.scheduler import schedule_blocks
    res = schedule_blocks([task], sim_windows, sim_trains)

    assert len(res.scheduled_blocks) == 0
    assert any(t["id"] == "TASK-D" for t in res.deferred_tasks)


def test_test6_resource_reduction():
    """Test 6: Reduced crew capacity restricts simultaneous tasks."""
    engine = ScenarioEngine()
    pool = ResourcePool(
        crews=[CrewResource(crew_id="C-ELEC", crew_type="electrical", capacity=2)]
    )
    task1 = {
        "id": "TASK-E1",
        "title": "Electrical Task 1",
        "section_code": "SEC-E1",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
        "crew_type": "electrical",
        "crew_required": 1,
    }
    task2 = {
        "id": "TASK-E2",
        "title": "Electrical Task 2",
        "section_code": "SEC-E2",
        "duration_hours": 2.0,
        "criticality": 7.0,
        "safety": 7.0,
        "crew_type": "electrical",
        "crew_required": 1,
    }
    windows = [
        {"id": "WIN-E1", "section_code": "SEC-E1", "start_time": "2026-09-28T02:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
        {"id": "WIN-E2", "section_code": "SEC-E2", "start_time": "2026-09-28T02:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
    ]

    # Disruption: cut electrical crew capacity to 1
    disruptions = [
        {"type": "resource_reduction", "resource_type": "crew", "type_name": "electrical", "new_capacity": 1}
    ]
    _, _, _, sim_pool = engine.apply_disruptions([task1, task2], [], windows, pool, disruptions)
    assert sim_pool.get_crew_capacity("electrical") == 1

    from services.scheduler import schedule_blocks
    res = schedule_blocks([task1, task2], windows, [], resource_pool=sim_pool)

    # Only 1 task can run due to cut capacity!
    assert res.tasks_scheduled == 1
    assert res.tasks_unscheduled == 1


def test_test7_base_immutability():
    """Test 7: MANDATORY — Running a scenario does NOT modify base dataset."""
    engine = ScenarioEngine()

    # Deep snapshot of baseline objects before simulation
    tasks_snapshot = copy.deepcopy(INITIAL_MAINTENANCE_TASKS)
    trains_snapshot = copy.deepcopy(TRAIN_MOVEMENTS)
    windows_snapshot = copy.deepcopy(REGENERATED_BLOCK_PLANS)

    # Also capture CSV file sizes and modification times
    csv_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    tasks_csv = os.path.join(csv_dir, "tasks.csv")
    trains_csv = os.path.join(csv_dir, "trains.csv")
    windows_csv = os.path.join(csv_dir, "windows.csv")

    tasks_mtime_before = os.path.getmtime(tasks_csv) if os.path.exists(tasks_csv) else None
    trains_mtime_before = os.path.getmtime(trains_csv) if os.path.exists(trains_csv) else None
    windows_mtime_before = os.path.getmtime(windows_csv) if os.path.exists(windows_csv) else None

    # Create and run a heavy disruption scenario (delays + cancellations + emergency blockage)
    req = ScenarioCreateRequest(
        name="Heavy Multi-Disruption Simulation",
        description="Testing base immutability",
        disruptions=[
            TrainDelayDisruption(type="train_delay", train_id="CONF-801", delay_minutes=60),
            TrainCancellationDisruption(type="train_cancellation", train_id="CONF-802"),
            EmergencyBlockageDisruption(
                type="emergency_blockage",
                section_code="MTJ-NY-L1",
                location="Mathura North Yard",
                start_time="2026-09-28T05:00:00Z",
                end_time="2026-09-28T09:00:00Z",
            ),
            WindowClosureDisruption(type="window_closure", window_id="BP-2026-001"),
        ],
    )
    scen = engine.create_scenario(req)
    result = engine.run_scenario(
        scenario_id=scen.scenario_id,
        base_tasks=INITIAL_MAINTENANCE_TASKS,
        base_trains=TRAIN_MOVEMENTS,
        base_windows=REGENERATED_BLOCK_PLANS,
    )
    assert result is not None

    # Verify baseline in-memory state is 100% UNCHANGED
    assert INITIAL_MAINTENANCE_TASKS == tasks_snapshot, "Base tasks must remain identical"
    assert TRAIN_MOVEMENTS == trains_snapshot, "Base trains must remain identical"
    assert REGENERATED_BLOCK_PLANS == windows_snapshot, "Base windows must remain identical"

    # Verify CSV files on disk were not overwritten
    if tasks_mtime_before:
        assert os.path.getmtime(tasks_csv) == tasks_mtime_before
    if trains_mtime_before:
        assert os.path.getmtime(trains_csv) == trains_mtime_before
    if windows_mtime_before:
        assert os.path.getmtime(windows_csv) == windows_mtime_before


def test_test8_scenario_comparison_deltas():
    """Test 8: Base vs scenario correctly identifies moved/removed/new/unchanged tasks."""
    engine = ScenarioEngine()
    req = ScenarioCreateRequest(
        name="Delta Test",
        disruptions=[
            # Close window BP-2026-001 containing Catenary and Tamping tasks
            WindowClosureDisruption(type="window_closure", window_id="BP-2026-001")
        ],
    )
    scen = engine.create_scenario(req)
    comp = engine.run_scenario(
        scenario_id=scen.scenario_id,
        base_tasks=INITIAL_MAINTENANCE_TASKS,
        base_trains=TRAIN_MOVEMENTS,
        base_windows=REGENERATED_BLOCK_PLANS,
    )

    # When BP-2026-001 is closed, its tasks become REMOVED / deferred
    assert len(comp.tasks_removed) > 0
    assert any(item.status == "REMOVED" for item in comp.changed_tasks)
    assert comp.tasks_scheduled_scenario < comp.tasks_scheduled_base


def test_test9_invalid_scenario_validation(client):
    """Test 9: Invalid disruption payload returns validation error (HTTP 400)."""
    # Negative delay
    res1 = client.post(
        "/api/scenarios",
        json={
            "name": "Invalid Delay",
            "disruptions": [{"type": "train_delay", "train_id": "T1", "delay_minutes": -15}],
        },
    )
    assert res1.status_code == 422 or res1.status_code == 400

    # Negative capacity
    res2 = client.post(
        "/api/scenarios",
        json={
            "name": "Invalid Capacity",
            "disruptions": [
                {
                    "type": "resource_reduction",
                    "resource_type": "crew",
                    "type_name": "track",
                    "new_capacity": -2,
                }
            ],
        },
    )
    assert res2.status_code == 422 or res2.status_code == 400

    # Unknown disruption type
    res3 = client.post(
        "/api/scenarios",
        json={
            "name": "Unknown Type",
            "disruptions": [{"type": "alien_invasion", "target": "Track 1"}],
        },
    )
    assert res3.status_code == 422 or res3.status_code == 400


def test_test10_scenario_api_full_flow(client):
    """Test 10: Scenario CRUD and simulation API lifecycle."""
    # 1. Create
    create_res = client.post(
        "/api/scenarios",
        json={
            "name": "API Test Scenario",
            "description": "Lifecycle integration check",
            "disruptions": [
                {"type": "train_delay", "train_id": "CONF-801", "delay_minutes": 25}
            ],
        },
    )
    assert create_res.status_code == 200
    scen_id = create_res.json()["scenario_id"]

    # 2. Get by ID
    get_res = client.get(f"/api/scenarios/{scen_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "API Test Scenario"

    # 3. List
    list_res = client.get("/api/scenarios")
    assert list_res.status_code == 200
    assert any(s["scenario_id"] == scen_id for s in list_res.json()["data"])

    # 4. Run
    run_res = client.post(f"/api/scenarios/{scen_id}/run")
    assert run_res.status_code == 200
    result_data = run_res.json()["result"]
    assert "tasks_scheduled_scenario" in result_data
    assert "optimization_score" in result_data
    assert "changed_tasks" in result_data

    # 5. Delete
    del_res = client.delete(f"/api/scenarios/{scen_id}")
    assert del_res.status_code == 200

    # 6. Verify 404 after deletion
    del_check = client.get(f"/api/scenarios/{scen_id}")
    assert del_check.status_code == 404
