from typing import Any, Mapping

# Weights for multi-criteria maintenance prioritization
WEIGHT_CRITICALITY = 0.3
WEIGHT_SAFETY = 0.2
WEIGHT_OVERDUE = 0.2
WEIGHT_TRAIN_IMPACT = 0.2
WEIGHT_ASSET_IMPACT = 0.1


def _extract_numeric_field(task: Any, field_name: str, default: float = 0.0) -> float:
    """
    Safely extract a numeric field from a dict or object.
    Returns default (0.0) if field is missing, None, or invalid numeric type.
    """
    if task is None:
        return default

    val = None
    if isinstance(task, Mapping):
        val = task.get(field_name)
    elif hasattr(task, field_name):
        val = getattr(task, field_name)
    elif hasattr(task, "model_dump"):  # Pydantic v2 support
        val = task.model_dump().get(field_name)

    if val is None:
        return default

    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def calculate_priority_score(task: Any) -> float:
    """
    Calculate the AI maintenance priority score for a given task.

    Formula:
        priority_score = (
            0.3 * criticality
            + 0.2 * safety
            + 0.2 * overdue
            + 0.2 * train_impact
            + 0.1 * asset_impact
        )

    Args:
        task: Dict, Pydantic model, or object containing maintenance task attributes.

    Returns:
        float: Computed priority score rounded to 4 decimal places.
    """
    criticality = _extract_numeric_field(task, "criticality", 0.0)
    safety = _extract_numeric_field(task, "safety", 0.0)
    overdue = _extract_numeric_field(task, "overdue", 0.0)
    train_impact = _extract_numeric_field(task, "train_impact", 0.0)
    asset_impact = _extract_numeric_field(task, "asset_impact", 0.0)

    score = (
        WEIGHT_CRITICALITY * criticality
        + WEIGHT_SAFETY * safety
        + WEIGHT_OVERDUE * overdue
        + WEIGHT_TRAIN_IMPACT * train_impact
        + WEIGHT_ASSET_IMPACT * asset_impact
    )

    return round(score, 4)
