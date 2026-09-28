from services.prioritization import prioritize_tasks


def test_prioritization_descending_order():
    """Verify tasks are sorted descending by priority_score."""
    tasks = [
        {"id": "TASK-LOW", "criticality": 1, "safety": 1, "overdue": 1},      # score: 0.3*1 + 0.2*1 + 0.2*1 = 0.7
        {"id": "TASK-HIGH", "criticality": 10, "safety": 9, "overdue": 8},   # score: 0.3*10 + 0.2*9 + 0.2*8 = 6.4
        {"id": "TASK-MED", "criticality": 5, "safety": 5, "overdue": 5},     # score: 0.3*5 + 0.2*5 + 0.2*5 = 3.5
    ]

    prioritized = prioritize_tasks(tasks)

    assert len(prioritized) == 3
    assert prioritized[0]["id"] == "TASK-HIGH"
    assert prioritized[1]["id"] == "TASK-MED"
    assert prioritized[2]["id"] == "TASK-LOW"

    # Confirm scores are strictly descending
    scores = [t["priority_score"] for t in prioritized]
    assert scores == sorted(scores, reverse=True)


def test_prioritization_does_not_mutate_inputs():
    """Verify original input objects and lists are not modified."""
    original_task = {"id": "TASK-1", "criticality": 8, "safety": 7}
    task_list = [original_task]

    prioritized = prioritize_tasks(task_list)

    # Output has priority_score
    assert "priority_score" in prioritized[0]
    # Original object does NOT have priority_score attached
    assert "priority_score" not in original_task
    # List is a new list
    assert prioritized is not task_list


def test_prioritization_empty_and_single():
    """Verify behavior on empty input or single item."""
    assert prioritize_tasks([]) == []
    assert prioritize_tasks(None) == []

    single = [{"id": "SINGLE-1", "criticality": 4}]
    res = prioritize_tasks(single)
    assert len(res) == 1
    assert res[0]["id"] == "SINGLE-1"
    assert "priority_score" in res[0]
