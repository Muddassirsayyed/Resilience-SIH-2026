import pytest
from app.services.scheduler import generate_schedule
from app.services.conflict import detect_conflicts

def test_crew_constraint():
    tasks = [
        {"task_id": "T1", "location": "L1", "duration": 60, "crew": "CrewA"},
        {"task_id": "T2", "location": "L2", "duration": 60, "crew": "CrewA"},
    ]
    trains = []
    result = generate_schedule(tasks, trains)
    scheduled = result["scheduled_tasks"]
    assert len(scheduled) == 2
    t1 = next(t for t in scheduled if t["task_id"] == "T1")
    t2 = next(t for t in scheduled if t["task_id"] == "T2")
    # Since they share CrewA, they must not overlap
    assert t1["end"] <= t2["start"] or t2["end"] <= t1["start"]

def test_task_dependencies():
    tasks = [
        {"task_id": "T1", "location": "L1", "duration": 60},
        {"task_id": "T2", "location": "L2", "duration": 30, "depends_on": ["T1"]},
    ]
    trains = []
    result = generate_schedule(tasks, trains)
    scheduled = result["scheduled_tasks"]
    assert len(scheduled) == 2
    t1 = next(t for t in scheduled if t["task_id"] == "T1")
    t2 = next(t for t in scheduled if t["task_id"] == "T2")
    # T2 must start after T1 ends
    assert t2["start"] >= t1["end"]

def test_safety_buffers_with_trains():
    tasks = [
        {"task_id": "T1", "location": "L1", "duration": 60, "buffer_after": 10, "buffer_before": 5},
    ]
    trains = [
        {"train_id": "TR1", "location": "L1", "start": 100, "end": 120}
    ]
    # T1 duration is 60.
    # Buffer after is 10. If T1 ends before train arrives (100), T1 must end <= 90 (since 90 + 10 = 100)
    # So T1 start can be 30, end 90.
    # If T1 starts after train leaves (120), T1 must start >= 125 (since 125 - 5 = 120)
    result = generate_schedule(tasks, trains)
    scheduled = result["scheduled_tasks"]
    assert len(scheduled) == 1
    t1 = scheduled[0]
    
    ends_before = t1["end"] + 10 <= trains[0]["start"]
    starts_after = t1["start"] - 5 >= trains[0]["end"]
    assert ends_before or starts_after

def test_safety_buffers_conflict_detection():
    # Detect conflicts should respect buffers
    tasks = [
        {"task_id": "T1", "location": "L1", "start": 95, "end": 100, "buffer_after": 10}
    ]
    trains = [
        {"train_id": "TR1", "location": "L1", "start": 105, "end": 120}
    ]
    # Block ends at 100, buffer after 10 -> padded end 110. Train starts at 105. Conflict!
    conflicts = detect_conflicts(tasks, trains)
    assert len(conflicts) == 1
    assert conflicts[0]["task_id"] == "T1"
