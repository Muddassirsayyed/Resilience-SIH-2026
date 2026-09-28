import pytest
from services.scheduler import (
    ConstraintScheduler,
    schedule_blocks,
    check_temporal_overlap,
    _parse_iso,
)


def test_high_priority_task_selected_first():
    """Verify that when candidate tasks compete for a window, the higher priority task is selected."""
    tasks = [
        {
            "id": "TASK-LOW",
            "title": "Cosmetic Painting",
            "section_code": "NDLS-GZB-L3",
            "location": "New Delhi - Ghaziabad Section",
            "duration_hours": 3.0,
            "criticality": 1.0,
            "safety": 1.0,
            "overdue": 1.0,
            "train_impact": 1.0,
            "asset_impact": 1.0,  # Score: ~1.0
        },
        {
            "id": "TASK-HIGH",
            "title": "Catenary Wire Urgent Replacement",
            "section_code": "NDLS-GZB-L3",
            "location": "New Delhi - Ghaziabad Section",
            "duration_hours": 3.0,
            "criticality": 9.5,
            "safety": 9.5,
            "overdue": 9.0,
            "train_impact": 9.0,
            "asset_impact": 8.0,  # Score: ~9.15
        },
    ]

    # Only a 3.5 hour window available (can only fit one 3.0 hr task)
    windows = [
        {
            "id": "WIN-1",
            "section_code": "NDLS-GZB-L3",
            "location": "New Delhi - Ghaziabad Section",
            "start_time": "2026-09-28T01:00:00Z",
            "end_time": "2026-09-28T04:30:00Z",  # 3.5 hours
            "assigned_tasks": [],
            "status": "PROPOSED",
            "priority": "HIGH",
        }
    ]

    trains = []  # No train conflicts

    result = schedule_blocks(tasks, windows, trains)

    assert len(result.scheduled_blocks) == 1
    scheduled_tasks = result.scheduled_blocks[0]["assigned_tasks"]

    # High priority task MUST be selected
    assert "Catenary Wire Urgent Replacement" in scheduled_tasks
    # Low priority task could not fit within the window and was deferred
    deferred_ids = [t["id"] for t in result.deferred_tasks]
    assert "TASK-LOW" in deferred_ids


def test_safety_constraint_cannot_be_bypassed_by_high_priority():
    """Verify train passage conflicts strictly prevent block scheduling, even for critical tasks."""
    critical_task = {
        "id": "TASK-CRITICAL",
        "title": "Emergency Broken Rail Repair",
        "section_code": "MTJ-NY-L1",
        "location": "Mathura Junction North Yard",
        "duration_hours": 3.0,
        "criticality": 10.0,
        "safety": 10.0,
        "overdue": 10.0,
        "train_impact": 10.0,
        "asset_impact": 10.0,  # Maximum priority: 10.0
    }

    # Window overlaps with high speed Rajdhani passage
    conflicting_window = [
        {
            "id": "WIN-CONFLICT",
            "section_code": "MTJ-NY-L1",
            "location": "Mathura Junction North Yard",
            "start_time": "2026-09-28T03:00:00Z",
            "end_time": "2026-09-28T07:00:00Z",
            "assigned_tasks": [],
            "status": "UNRESOLVED",
        }
    ]

    # Express train passing right in the middle
    trains = [
        {
            "id": "TRAIN-12952",
            "train": "12952 Mumbai Rajdhani Express",
            "section_code": "MTJ-NY-L1",
            "location": "Mathura Junction North Yard",
            "overlap_start": "2026-09-28T04:00:00Z",
            "overlap_end": "2026-09-28T04:45:00Z",
            "conflict_type": "Track Block vs Passenger Express Collision Risk",
            "severity": "CRITICAL",
        }
    ]

    scheduler = ConstraintScheduler()
    result = scheduler.schedule([critical_task], conflicting_window, trains, initial_conflicts_count=1)

    # Safety constraint: Window is rejected due to active train conflict
    assert len(result.unresolved_conflicts) == 1
    assert result.unresolved_conflicts[0]["id"] == "TRAIN-12952"
    # Task was deferred and NOT scheduled in the dangerous window
    deferred_ids = [t["id"] for t in result.deferred_tasks]
    assert "TASK-CRITICAL" in deferred_ids


def test_maintenance_window_duration_respected():
    """Verify task requiring more time than available window is rejected."""
    long_task = {
        "id": "TASK-LONG",
        "title": "Complete Substation Overhaul",
        "section_code": "CNB-WY-L4",
        "location": "Kanpur Central West Yard",
        "duration_hours": 8.0,  # Requires 8 hours
        "criticality": 9.0,
        "safety": 9.0,
        "overdue": 9.0,
        "train_impact": 8.0,
        "asset_impact": 8.0,
    }

    short_window = [
        {
            "id": "WIN-SHORT",
            "section_code": "CNB-WY-L4",
            "location": "Kanpur Central West Yard",
            "start_time": "2026-09-28T01:00:00Z",
            "end_time": "2026-09-28T03:00:00Z",  # Only 2 hours
            "assigned_tasks": [],
            "status": "PROPOSED",
        }
    ]

    result = schedule_blocks([long_task], short_window, [])

    # Task cannot fit inside 2 hour window
    assert "Complete Substation Overhaul" not in result.scheduled_blocks[0]["assigned_tasks"]
    assert any(t["id"] == "TASK-LONG" for t in result.deferred_tasks)


def test_conflict_free_window_schedules_successfully():
    """Verify conflict-free window successfully schedules matching prioritized tasks."""
    task = {
        "id": "TASK-1",
        "title": "USFD Testing",
        "section_code": "MTJ-NY-L1",
        "location": "Mathura Junction North Yard",
        "duration_hours": 2.5,
        "criticality": 8.5,
        "safety": 8.5,
        "overdue": 8.0,
        "train_impact": 7.0,
        "asset_impact": 7.0,
    }

    # Window starts after train clears (05:00 to 09:00)
    safe_window = [
        {
            "id": "WIN-SAFE",
            "section_code": "MTJ-NY-L1",
            "location": "Mathura Junction North Yard",
            "start_time": "2026-09-28T05:00:00Z",
            "end_time": "2026-09-28T09:00:00Z",
            "assigned_tasks": [],
            "status": "PROPOSED",
            "priority": "HIGH",
        }
    ]

    trains = [
        {
            "id": "TRAIN-EARLY",
            "train": "12626 Kerala Express",
            "section_code": "MTJ-NY-L1",
            "overlap_start": "2026-09-28T03:45:00Z",
            "overlap_end": "2026-09-28T04:30:00Z",  # Clears before 05:00!
        }
    ]

    result = schedule_blocks([task], safe_window, trains, initial_conflicts_count=1)

    assert len(result.scheduled_blocks) == 1
    assert result.scheduled_blocks[0]["status"] == "OPTIMIZED & RESOLVED"
    assert "USFD Testing" in result.scheduled_blocks[0]["assigned_tasks"]
    assert len(result.unresolved_conflicts) == 0
    assert result.conflicts_resolved_count == 1
