import os
import pytest
from services.data_loader import load_tasks_from_csv, load_trains_from_csv, load_windows_from_csv
from services.prioritization import prioritize_tasks
from services.scoring import calculate_priority_score
from services.conflicts import detect_conflicts
from services.scheduler import schedule_blocks


def test_csv_loading_and_normalization():
    """Verify tasks, trains, and windows are properly loaded and normalized from CSV."""
    tasks = load_tasks_from_csv()
    assert len(tasks) >= 8

    # Verify task fields and numeric normalization
    for t in tasks:
        assert isinstance(t["id"], str) and len(t["id"]) > 0
        assert isinstance(t["title"], str) and len(t["title"]) > 0
        assert isinstance(t["criticality"], float)
        assert isinstance(t["safety"], float)
        assert isinstance(t["overdue"], float)
        assert isinstance(t["train_impact"], float)
        assert isinstance(t["asset_impact"], float)
        assert isinstance(t["duration_hours"], float)

    trains = load_trains_from_csv()
    assert len(trains) >= 3

    init_windows = load_windows_from_csv(window_type="INITIAL")
    assert len(init_windows) >= 4

    res_windows = load_windows_from_csv(window_type="RESOLVED")
    assert len(res_windows) >= 4


def test_priority_score_calculated_from_real_data():
    """Verify priority_score is derived strictly from real multi-criteria formula with no hardcoded values."""
    tasks = load_tasks_from_csv()
    prioritized = prioritize_tasks(tasks)

    for task in prioritized:
        expected = round(
            0.3 * task["criticality"]
            + 0.2 * task["safety"]
            + 0.2 * task["overdue"]
            + 0.2 * task["train_impact"]
            + 0.1 * task["asset_impact"],
            4,
        )
        assert task["priority_score"] == pytest.approx(expected, rel=1e-4)

    # Verify descending sort order
    scores = [t["priority_score"] for t in prioritized]
    assert scores == sorted(scores, reverse=True)


def test_dynamic_conflict_detection_before_and_after():
    """Verify dynamic conflict detection detects 3 initial conflicts and 0 resolved conflicts."""
    trains = load_trains_from_csv()
    init_windows = load_windows_from_csv(window_type="INITIAL")
    res_windows = load_windows_from_csv(window_type="RESOLVED")

    # Before scheduling: 3 conflicts detected dynamically
    initial_conflicts = detect_conflicts(init_windows, trains)
    assert len(initial_conflicts) == 3

    # Conflict IDs must match the trains passing in overlapping windows
    conflict_ids = {c["id"] for c in initial_conflicts}
    assert "CONF-801" in conflict_ids  # Kerala Express at Mathura
    assert "CONF-802" in conflict_ids  # Shatabdi Express at Ghaziabad
    assert "CONF-803" in conflict_ids  # Vande Bharat Express at Agra

    # After scheduling: 0 conflicts detected dynamically because windows are shifted safely
    resolved_conflicts = detect_conflicts(res_windows, trains)
    assert len(resolved_conflicts) == 0


def test_full_pipeline_flow():
    """Verify complete pipeline: Data -> Prioritize -> Schedule -> Conflict Detection."""
    tasks = load_tasks_from_csv()
    trains = load_trains_from_csv()
    candidate_windows = load_windows_from_csv(window_type="RESOLVED")

    # Step 1: Prioritize
    prioritized = prioritize_tasks(tasks)
    assert len(prioritized) == len(tasks)

    # Step 2: Constraint Schedule
    schedule_res = schedule_blocks(
        tasks=prioritized,
        candidate_windows=candidate_windows,
        train_movements=trains,
        initial_conflicts_count=3,
    )

    # Step 3: Conflict Detection on resulting schedule
    active_conflicts = detect_conflicts(schedule_res.scheduled_blocks, trains)
    assert len(active_conflicts) == 0
    assert schedule_res.conflicts_resolved_count == 3
