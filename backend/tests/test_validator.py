# test_validator.py
"""Tests for the independent schedule validator.
These tests verify that the validator correctly accepts a valid schedule and
detects obvious violations such as overlapping blocks at the same location.
"""

import pytest
from services.validator import validate_schedule, ScheduleValidationError

# Helper data fixtures
@pytest.fixture
def simple_task():
    return {
        "id": "TASK-001",
        "title": "Task A",
        "location": "Loc1",
        "section_code": "SEC-1",
        "duration_hours": 1.0,
        "criticality": 5,
        "safety": 9,
        "overdue": 2,
        "train_impact": 3,
        "asset_impact": 4,
        "status": "PENDING_BLOCK",
    }

@pytest.fixture
def simple_tasks(simple_task):
    return [simple_task]

@pytest.fixture
def simple_train():
    # No trains for the simple valid case
    return []

@pytest.fixture
def valid_block():
    return {
        "id": "BLOCK-1",
        "location": "Loc1",
        "section_code": "SEC-1",
        "start_time": "2026-09-28T01:00:00Z",
        "end_time": "2026-09-28T02:00:00Z",
        "assigned_tasks": ["Task A"],
        "status": "OPTIMIZED & RESOLVED",
        "priority": "NORMAL",
    }

def test_validator_accepts_valid_schedule(valid_block, simple_tasks, simple_train):
    # Should not raise and return True
    assert validate_schedule([valid_block], simple_tasks, simple_train) is True

def test_validator_detects_overlap_same_location(valid_block, simple_tasks, simple_train):
    # Create a second block that overlaps the first at the same location
    overlapping_block = valid_block.copy()
    overlapping_block["id"] = "BLOCK-2"
    overlapping_block["start_time"] = "2026-09-28T01:30:00Z"
    overlapping_block["end_time"] = "2026-09-28T02:30:00Z"
    with pytest.raises(ScheduleValidationError) as excinfo:
        validate_schedule([valid_block, overlapping_block], simple_tasks, simple_train)
    # The error message should mention a location resource conflict
    assert any("Location resource conflict" in msg for msg in excinfo.value.errors)
