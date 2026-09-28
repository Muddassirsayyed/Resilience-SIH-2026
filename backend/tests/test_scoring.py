import pytest
from pydantic import BaseModel
from typing import Optional

from services.scoring import (
    calculate_priority_score,
    WEIGHT_CRITICALITY,
    WEIGHT_SAFETY,
    WEIGHT_OVERDUE,
    WEIGHT_TRAIN_IMPACT,
    WEIGHT_ASSET_IMPACT,
)


class SampleTaskModel(BaseModel):
    criticality: Optional[float] = None
    safety: Optional[float] = None
    overdue: Optional[float] = None
    train_impact: Optional[float] = None
    asset_impact: Optional[float] = None


def test_scoring_formula_exact_weights():
    """Verify scoring formula with exact known values and weights."""
    task = {
        "criticality": 10.0,
        "safety": 8.0,
        "overdue": 5.0,
        "train_impact": 6.0,
        "asset_impact": 4.0,
    }
    # Expected: 0.3*10 + 0.2*8 + 0.2*5 + 0.2*6 + 0.1*4 = 3.0 + 1.6 + 1.0 + 1.2 + 0.4 = 7.2
    expected_score = (
        WEIGHT_CRITICALITY * 10.0
        + WEIGHT_SAFETY * 8.0
        + WEIGHT_OVERDUE * 5.0
        + WEIGHT_TRAIN_IMPACT * 6.0
        + WEIGHT_ASSET_IMPACT * 4.0
    )
    score = calculate_priority_score(task)
    assert score == pytest.approx(7.2, rel=1e-4)
    assert score == pytest.approx(expected_score, rel=1e-4)


def test_scoring_with_max_scale():
    """Test normalized scale [0-100]."""
    task = {
        "criticality": 100,
        "safety": 100,
        "overdue": 100,
        "train_impact": 100,
        "asset_impact": 100,
    }
    # 0.3*100 + 0.2*100 + 0.2*100 + 0.2*100 + 0.1*100 = 100.0
    score = calculate_priority_score(task)
    assert score == pytest.approx(100.0, rel=1e-4)


def test_scoring_missing_and_null_values():
    """Verify graceful handling when attributes are missing, None, or zero."""
    # Completely empty dict
    assert calculate_priority_score({}) == 0.0

    # None task
    assert calculate_priority_score(None) == 0.0

    # Explicit None values
    task_with_nones = {
        "criticality": None,
        "safety": 10.0,
        "overdue": None,
        "train_impact": None,
        "asset_impact": None,
    }
    # Only safety = 0.2 * 10.0 = 2.0
    assert calculate_priority_score(task_with_nones) == pytest.approx(2.0, rel=1e-4)


def test_scoring_with_invalid_and_string_values():
    """Verify safe fallback on invalid strings and proper conversion for numeric strings."""
    task = {
        "criticality": "10",
        "safety": "invalid_string",
        "overdue": 5,
        "train_impact": None,
        "asset_impact": "2.5",
    }
    # 0.3*10 + 0.2*0 + 0.2*5 + 0.2*0 + 0.1*2.5 = 3.0 + 1.0 + 0.25 = 4.25
    assert calculate_priority_score(task) == pytest.approx(4.25, rel=1e-4)


def test_scoring_pydantic_model():
    """Verify scoring works seamlessly with Pydantic model objects."""
    model = SampleTaskModel(criticality=9.0, safety=7.0, overdue=4.0)
    # 0.3*9 + 0.2*7 + 0.2*4 = 2.7 + 1.4 + 0.8 = 4.9
    assert calculate_priority_score(model) == pytest.approx(4.9, rel=1e-4)
