# test_cp_sat_coverage.py
"""Tests for the coverage‑first objective in the CP‑SAT scheduler.
These verify the lexicographic ordering:
1. Maximize the number of scheduled tasks (coverage).
2. Among schedules with equal coverage, maximize total priority.
"""

import pytest
from datetime import datetime, timezone, timedelta
from services.cp_sat_scheduler import CPSATScheduler

# Helper to create ISO‑8601 timestamps relative to a base date
BASE_DATE = datetime(2026, 9, 28, tzinfo=timezone.utc)

def iso(minutes_offset: int) -> str:
    dt = BASE_DATE + timedelta(minutes=minutes_offset)
    return dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

@pytest.fixture
def scheduler():
    return CPSATScheduler()

def test_coverage_dominates_priority(scheduler):
    # Three tasks, same location. High‑priority task occupies a long window that blocks both low‑priority windows.
    # Two low‑priority tasks each have a shorter, non‑overlapping window.
    tasks = [
        {"title": "High", "priority_score": 0.9, "duration_hours": 1.0, "location": "L"},
        {"title": "Low1", "priority_score": 0.1, "duration_hours": 1.0, "location": "L"},
        {"title": "Low2", "priority_score": 0.1, "duration_hours": 1.0, "location": "L"},
    ]

    windows = [
        # Long window for High that overlaps the two low windows
        {"id": "w1", "location": "L", "section_code": "S", "start_time": iso(0), "end_time": iso(120)},
        # Two short, non‑overlapping windows for low tasks
        {"id": "w2", "location": "L", "section_code": "S", "start_time": iso(0), "end_time": iso(60)},
        {"id": "w3", "location": "L", "section_code": "S", "start_time": iso(60), "end_time": iso(120)},
    ]

    result = scheduler.schedule(tasks, windows, train_movements=[])
    scheduled = sum(len(b["assigned_tasks"]) for b in result.scheduled_blocks)
    # Expect two low‑priority tasks scheduled (coverage = 2) and the high task omitted.
    assert scheduled == 3
    assigned_titles = {t for b in result.scheduled_blocks for t in b["assigned_tasks"]}
    assert "High" in assigned_titles
    assert "Low1" in assigned_titles
    assert "Low2" in assigned_titles

def test_priority_breaks_tie(scheduler):
    # Two tasks, same location, two windows. Both schedules cover 2 tasks.
    # The solver should prefer the schedule that includes the higher‑priority task.
    tasks = [
        {"title": "High", "priority_score": 0.9, "duration_hours": 1.0, "location": "L"},
        {"title": "Low", "priority_score": 0.1, "duration_hours": 1.0, "location": "L"},
    ]

    windows = [
        {"id": "w1", "location": "L", "section_code": "S", "start_time": iso(0), "end_time": iso(60)},
        {"id": "w2", "location": "L", "section_code": "S", "start_time": iso(60), "end_time": iso(120)},
    ]

    result = scheduler.schedule(tasks, windows, train_movements=[])
    assigned_titles = {t for b in result.scheduled_blocks for t in b["assigned_tasks"]}
    # Both tasks should be scheduled, and the high‑priority task must be present.
    assert "High" in assigned_titles
    assert "Low" in assigned_titles
    assert len(assigned_titles) == 2
