from typing import Any, Dict, Iterable, List, Mapping, Optional, Protocol


class TaskClusterer(Protocol):
    """
    Protocol definition for maintenance task clusterers.
    Allows future ML clustering algorithms to replace deterministic clustering seamlessly.
    """
    def cluster(self, tasks: Iterable[Any]) -> Dict[str, Dict[str, List[Any]]]:
        ...


def _extract_str_field(task: Any, field_name: str, default: str) -> str:
    """
    Safely extract a string field (like location or department) from a dict or object.
    """
    if task is None:
        return default

    val = None
    if isinstance(task, Mapping):
        val = task.get(field_name)
    elif hasattr(task, field_name):
        val = getattr(task, field_name)
    elif hasattr(task, "model_dump"):
        val = task.model_dump().get(field_name)

    if val is None or not str(val).strip():
        return default

    return str(val).strip()


class DeterministicClusterer:
    """
    Deterministic hierarchical clusterer grouping tasks by:
    location -> department -> tasks
    """

    def __init__(self, default_location: str = "Unknown", default_department: str = "General"):
        self.default_location = default_location
        self.default_department = default_department

    def cluster(self, tasks: Iterable[Any]) -> Dict[str, Dict[str, List[Any]]]:
        """
        Group tasks into a nested dictionary: {location: {department: [tasks...]}}.
        """
        grouped: Dict[str, Dict[str, List[Any]]] = {}

        if not tasks:
            return grouped

        for task in tasks:
            location = _extract_str_field(task, "location", self.default_location)
            department = _extract_str_field(task, "department", self.default_department)

            if location not in grouped:
                grouped[location] = {}

            if department not in grouped[location]:
                grouped[location][department] = []

            grouped[location][department].append(task)

        return grouped


# Global default instance
_default_clusterer = DeterministicClusterer()


def cluster_tasks(
    tasks: Iterable[Any],
    clusterer: Optional[TaskClusterer] = None
) -> Dict[str, Dict[str, List[Any]]]:
    """
    Group tasks deterministically by location and department.

    Example structure:
    {
        "Mumbai": {
            "Electrical": [...],
            "Mechanical": [...]
        }
    }

    Args:
        tasks: Iterable of maintenance task objects or dictionaries.
        clusterer: Optional clusterer conforming to TaskClusterer protocol.
                   Defaults to DeterministicClusterer.

    Returns:
        Dict[str, Dict[str, List[Any]]]: Hierarchically clustered tasks.
    """
    active_clusterer = clusterer or _default_clusterer
    return active_clusterer.cluster(tasks)
