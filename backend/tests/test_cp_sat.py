"""
Comprehensive Test Suite for Phase 7: OR-Tools CP-SAT Solver & Multi-Resource Scheduling.

Validates:
1. Basic CP-SAT scheduling (valid task into valid window).
2. Train safety hard constraint (track occupancy strictly avoided).
3. Window duration limit (oversized task deferred).
4. Priority-aware optimization (highest priority scheduled under contention).
5. Multi-crew cumulative capacity (workforce limit enforcement).
6. Machinery inventory capacity (heavy equipment clash prevention).
7. Location compatibility (spatial mismatch prevention).
8. Resilient deterministic fallback (graceful degradation when CP-SAT fails).
9. CP-SAT model & solver actual execution verification.
"""

from unittest.mock import patch
import pytest

from services.cp_sat_scheduler import CPSATScheduler, ORTOOLS_AVAILABLE
from services.resources import CrewResource, MachineResource, ResourcePool
from services.scheduler import ConstraintScheduler, schedule_blocks


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test1_basic_cp_sat_scheduling():
    """Test 1: A valid task inside a valid maintenance window should be scheduled."""
    scheduler = CPSATScheduler()
    task = {
        "id": "TASK-VALID-01",
        "title": "Turnout Switch Inspection",
        "section_code": "SEC-DELHI-01",
        "location": "Delhi Yard",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
        "overdue": 5.0,
        "train_impact": 6.0,
        "asset_impact": 7.0,
    }
    window = {
        "id": "WIN-SAFE-01",
        "section_code": "SEC-DELHI-01",
        "location": "Delhi Yard",
        "start_time": "2026-09-28T02:00:00Z",
        "end_time": "2026-09-28T06:00:00Z",
        "assigned_tasks": [],
        "status": "PROPOSED",
    }
    trains = []

    result = scheduler.schedule([task], [window], trains)

    assert len(result.scheduled_blocks) == 1
    assert "Turnout Switch Inspection" in result.scheduled_blocks[0]["assigned_tasks"]
    assert result.scheduler_type == "cp_sat"
    assert result.tasks_scheduled == 1
    assert len(result.deferred_tasks) == 0


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test2_train_conflict_hard_safety():
    """Test 2: A task overlapping a train interval must NOT be scheduled (Hard Safety)."""
    scheduler = CPSATScheduler()
    critical_task = {
        "id": "TASK-CRIT-99",
        "title": "Emergency Flash Butt Welding",
        "section_code": "SEC-AGRA-01",
        "location": "Agra Corridor",
        "duration_hours": 3.0,
        "criticality": 10.0,
        "safety": 10.0,
        "overdue": 10.0,
        "train_impact": 10.0,
        "asset_impact": 10.0,
    }
    window = {
        "id": "WIN-DANGER-01",
        "section_code": "SEC-AGRA-01",
        "location": "Agra Corridor",
        "start_time": "2026-09-28T03:00:00Z",
        "end_time": "2026-09-28T07:00:00Z",
        "assigned_tasks": [],
        "status": "UNRESOLVED",
    }
    trains = [
        {
            "id": "TRAIN-RAJDHANI-12952",
            "train": "12952 Mumbai Rajdhani",
            "section_code": "SEC-AGRA-01",
            "overlap_start": "2026-09-28T04:00:00Z",
            "overlap_end": "2026-09-28T04:45:00Z",
        }
    ]

    result = scheduler.schedule([critical_task], [window], trains, initial_conflicts_count=1)

    # Hard safety constraint: task cannot be scheduled in dangerous window
    assert len(result.unresolved_conflicts) == 1
    assert result.unresolved_conflicts[0]["id"] == "TRAIN-RAJDHANI-12952"
    assert "Emergency Flash Butt Welding" not in result.scheduled_blocks[0]["assigned_tasks"]
    assert any(t["id"] == "TASK-CRIT-99" for t in result.deferred_tasks)


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test3_window_duration_respected():
    """Test 3: A task longer than the available maintenance window must NOT be scheduled."""
    scheduler = CPSATScheduler()
    long_task = {
        "id": "TASK-LONG-01",
        "title": "Complete Catenary Wire Re-stringing",
        "section_code": "SEC-KANPUR-01",
        "location": "Kanpur Yard",
        "duration_hours": 6.0,  # 6 hours needed
        "criticality": 9.0,
        "safety": 9.0,
        "overdue": 8.0,
        "train_impact": 8.0,
        "asset_impact": 8.0,
    }
    short_window = {
        "id": "WIN-SHORT-01",
        "section_code": "SEC-KANPUR-01",
        "location": "Kanpur Yard",
        "start_time": "2026-09-28T01:00:00Z",
        "end_time": "2026-09-28T03:30:00Z",  # Only 2.5 hours
        "assigned_tasks": [],
    }

    result = scheduler.schedule([long_task], [short_window], [])

    assert "Complete Catenary Wire Re-stringing" not in result.scheduled_blocks[0]["assigned_tasks"]
    assert any(t["id"] == "TASK-LONG-01" for t in result.deferred_tasks)


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test4_priority_aware_optimization():
    """Test 4: When two feasible tasks compete for limited capacity, the higher-priority task is preferred."""
    scheduler = CPSATScheduler()
    low_priority_task = {
        "id": "TASK-LOW",
        "title": "Signboard Painting",
        "section_code": "SEC-GZB-01",
        "location": "Ghaziabad",
        "duration_hours": 3.0,
        "criticality": 2.0,
        "safety": 2.0,
        "overdue": 1.0,
        "train_impact": 1.0,
        "asset_impact": 1.0,  # Score: ~1.5
    }
    high_priority_task = {
        "id": "TASK-HIGH",
        "title": "USFD Ultrasonic Crack Remediation",
        "section_code": "SEC-GZB-01",
        "location": "Ghaziabad",
        "duration_hours": 3.0,
        "criticality": 9.8,
        "safety": 9.8,
        "overdue": 9.0,
        "train_impact": 9.0,
        "asset_impact": 9.0,  # Score: ~9.54
    }
    # Window can fit only ONE 3.0 hour task (window is 3.5 hours)
    window = {
        "id": "WIN-COMPETE-01",
        "section_code": "SEC-GZB-01",
        "location": "Ghaziabad",
        "start_time": "2026-09-28T01:00:00Z",
        "end_time": "2026-09-28T04:30:00Z",
        "assigned_tasks": [],
    }

    result = scheduler.schedule([low_priority_task, high_priority_task], [window], [])

    scheduled_tasks = result.scheduled_blocks[0]["assigned_tasks"]
    assert "USFD Ultrasonic Crack Remediation" in scheduled_tasks
    assert "Signboard Painting" not in scheduled_tasks
    assert any(t["id"] == "TASK-LOW" for t in result.deferred_tasks)


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test5_crew_capacity_constraint():
    """Test 5: If available crew capacity is 2, two simultaneous tasks may run, but three exceed capacity."""
    scheduler = CPSATScheduler()
    pool = ResourcePool(
        crews=[CrewResource(crew_id="CREW-ELEC", crew_type="electrical", capacity=2)]
    )

    task_a = {
        "id": "TASK-ELEC-1",
        "title": "OHE Insulator Wash",
        "section_code": "SEC-A",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
        "crew_type": "electrical",
        "crew_required": 1,
    }
    task_b = {
        "id": "TASK-ELEC-2",
        "title": "Transformer Bushing Test",
        "section_code": "SEC-B",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
        "crew_type": "electrical",
        "crew_required": 1,
    }
    task_c = {
        "id": "TASK-ELEC-3",
        "title": "Auxiliary Converter Check",
        "section_code": "SEC-C",
        "duration_hours": 2.0,
        "criticality": 7.0,
        "safety": 7.0,
        "crew_type": "electrical",
        "crew_required": 1,
    }

    # Three simultaneous windows at different locations
    windows = [
        {"id": "WIN-A", "section_code": "SEC-A", "start_time": "2026-09-28T02:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
        {"id": "WIN-B", "section_code": "SEC-B", "start_time": "2026-09-28T02:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
        {"id": "WIN-C", "section_code": "SEC-C", "start_time": "2026-09-28T02:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
    ]

    result = scheduler.schedule([task_a, task_b, task_c], windows, [], resource_pool=pool)

    # Crew capacity is 2: exactly 2 simultaneous tasks can be scheduled, 1 must be deferred
    assert result.tasks_scheduled == 2
    assert result.tasks_unscheduled == 1
    assert any(t["id"] == "TASK-ELEC-3" for t in result.deferred_tasks)


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test6_machine_capacity_constraint():
    """Test 6: If only one machine is available, two simultaneous tasks requiring it cannot overlap."""
    scheduler = CPSATScheduler()
    pool = ResourcePool(
        machines=[MachineResource(machine_id="M-TMP", machine_type="tamping_machine", capacity=1)]
    )

    tamping_task_1 = {
        "id": "TASK-TAMP-1",
        "title": "Track Tamping Section 1",
        "section_code": "SEC-TRACK-1",
        "duration_hours": 3.0,
        "criticality": 9.0,
        "safety": 9.0,
        "machine_type": "tamping_machine",
        "machine_required": 1,
    }
    tamping_task_2 = {
        "id": "TASK-TAMP-2",
        "title": "Track Tamping Section 2",
        "section_code": "SEC-TRACK-2",
        "duration_hours": 3.0,
        "criticality": 7.0,
        "safety": 7.0,
        "machine_type": "tamping_machine",
        "machine_required": 1,
    }

    # Two simultaneous windows at 01:00-04:00
    windows = [
        {"id": "WIN-TRK-1", "section_code": "SEC-TRACK-1", "start_time": "2026-09-28T01:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
        {"id": "WIN-TRK-2", "section_code": "SEC-TRACK-2", "start_time": "2026-09-28T01:00:00Z", "end_time": "2026-09-28T04:00:00Z", "assigned_tasks": []},
    ]

    result = scheduler.schedule([tamping_task_1, tamping_task_2], windows, [], resource_pool=pool)

    # Machine inventory is 1: only the higher-criticality tamping task can be scheduled
    assert result.tasks_scheduled == 1
    assert result.tasks_unscheduled == 1
    scheduled_tasks = []
    for b in result.scheduled_blocks:
        scheduled_tasks.extend(b["assigned_tasks"])
    assert "Track Tamping Section 1" in scheduled_tasks
    assert "Track Tamping Section 2" not in scheduled_tasks


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test7_location_constraint():
    """Test 7: A task must not be assigned to an incompatible location window."""
    scheduler = CPSATScheduler()
    delhi_task = {
        "id": "TASK-DELHI",
        "title": "Delhi Junction Signal Test",
        "section_code": "SEC-DELHI-01",
        "location": "New Delhi Central Yard",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
    }
    mumbai_window = {
        "id": "WIN-MUMBAI",
        "section_code": "SEC-MUMBAI-01",
        "location": "Mumbai Central Yard",
        "start_time": "2026-09-28T02:00:00Z",
        "end_time": "2026-09-28T06:00:00Z",
        "assigned_tasks": [],
    }

    result = scheduler.schedule([delhi_task], [mumbai_window], [])

    # Task section/location does not match window -> cannot be assigned
    assert "Delhi Junction Signal Test" not in result.scheduled_blocks[0]["assigned_tasks"]
    assert any(t["id"] == "TASK-DELHI" for t in result.deferred_tasks)


def test_test8_fallback_to_deterministic_scheduler():
    """Test 8: Simulate failing CP-SAT path and verify deterministic scheduler still produces valid result."""
    task = {
        "id": "TASK-FB-01",
        "title": "Fallback Maintenance Item",
        "section_code": "SEC-TEST",
        "location": "Test Depot",
        "duration_hours": 2.0,
        "criticality": 8.0,
        "safety": 8.0,
    }
    window = {
        "id": "WIN-FB-01",
        "section_code": "SEC-TEST",
        "location": "Test Depot",
        "start_time": "2026-09-28T02:00:00Z",
        "end_time": "2026-09-28T05:00:00Z",
        "assigned_tasks": [],
    }

    # Simulate CP-SAT failure by mocking ORTOOLS_AVAILABLE to False
    with patch("services.cp_sat_scheduler.ORTOOLS_AVAILABLE", False):
        result = schedule_blocks([task], [window], [], use_cp_sat=True)

    assert result.scheduler_type == "deterministic_fallback"
    assert len(result.scheduled_blocks) == 1
    assert "Fallback Maintenance Item" in result.scheduled_blocks[0]["assigned_tasks"]


@pytest.mark.skipif(not ORTOOLS_AVAILABLE, reason="OR-Tools is not installed")
def test_test9_cp_sat_solver_actual_execution(monkeypatch):
    """Test 9: Verify CP-SAT solver class actually creates cp_model.CpModel and executes solver."""
    from ortools.sat.python import cp_model
    scheduler = CPSATScheduler()
    assert scheduler is not None

    task = {
        "id": "TASK-EXEC-01",
        "title": "Execution Check Task",
        "section_code": "SEC-EXEC",
        "location": "Execution Yard",
        "duration_hours": 1.5,
        "criticality": 8.5,
        "safety": 8.5,
    }
    window = {
        "id": "WIN-EXEC-01",
        "section_code": "SEC-EXEC",
        "location": "Execution Yard",
        "start_time": "2026-09-28T01:00:00Z",
        "end_time": "2026-09-28T04:00:00Z",
        "assigned_tasks": [],
    }

    orig_solve = cp_model.CpSolver.Solve
    solve_called = []

    def spy_solve(self, model):
        solve_called.append(True)
        return orig_solve(self, model)

    monkeypatch.setattr(cp_model.CpSolver, "Solve", spy_solve)

    result = scheduler.schedule([task], [window], [])
    assert len(solve_called) >= 1, "CpSolver.Solve must be called during scheduling"
    assert result.scheduler_type == "cp_sat"
    assert result.tasks_scheduled == 1
