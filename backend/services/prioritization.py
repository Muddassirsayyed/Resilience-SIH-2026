import copy
from typing import Any, Iterable, List, Mapping
from .scoring import calculate_priority_score


def _to_enriched_dict(task: Any) -> dict:
    """
    Safely convert a task item to a dictionary copy without mutating original inputs.
    """
    if isinstance(task, Mapping):
        task_dict = copy.deepcopy(dict(task))
    elif hasattr(task, "model_dump"):  # Pydantic v2
        task_dict = copy.deepcopy(task.model_dump())
    elif hasattr(task, "dict"):  # Pydantic v1
        task_dict = copy.deepcopy(task.dict())
    elif hasattr(task, "__dict__"):
        task_dict = copy.deepcopy(vars(task))
    else:
        task_dict = {"raw_task": copy.deepcopy(task)}

    score = calculate_priority_score(task)
    task_dict["priority_score"] = score
    return task_dict


def prioritize_tasks(tasks: Iterable[Any]) -> List[dict]:
    """
    Prioritize maintenance tasks based on computed AI priority score.

    Responsibilities:
    - Accepts maintenance tasks
    - Calculates priority score using calculate_priority_score
    - Attaches priority_score to each task object
    - Sorts descending by priority_score
    - Returns enriched task objects without mutating original inputs

    Args:
        tasks: An iterable of maintenance task dictionaries or model instances.

    Returns:
        List[dict]: Enriched task dictionaries sorted in descending order of priority_score.
    """
    if not tasks:
        return []

    enriched = [_to_enriched_dict(task) for task in tasks]
    enriched.sort(key=lambda item: item.get("priority_score", 0.0), reverse=True)
    return enriched
