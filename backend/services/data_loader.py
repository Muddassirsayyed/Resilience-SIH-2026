import csv
import os
from typing import Any, Dict, List, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))


def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        return float(val) if val is not None and str(val).strip() != "" else default
    except (ValueError, TypeError):
        return default


def load_tasks_from_csv(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Load canonical maintenance task pool from CSV and normalize numeric attributes.
    """
    path = csv_path or os.path.join(DATA_DIR, "tasks.csv")
    tasks: List[Dict[str, Any]] = []

    if not os.path.exists(path):
        return []

    with open(path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dept = row.get("department", "").strip()
            # Infer default crew type from department if not explicitly set
            default_crew_type = "general"
            dept_lower = dept.lower()
            if "electrical" in dept_lower or "trd" in dept_lower:
                default_crew_type = "electrical"
            elif "track" in dept_lower or "engineering" in dept_lower:
                default_crew_type = "track"
            elif "bridge" in dept_lower or "civil" in dept_lower:
                default_crew_type = "civil"
            elif "signal" in dept_lower or "telecom" in dept_lower:
                default_crew_type = "signaling"

            tasks.append({
                "id": row.get("id", "").strip(),
                "title": row.get("title", "").strip(),
                "location": row.get("location", "").strip(),
                "section_code": row.get("section_code", "").strip(),
                "department": dept,
                "duration_hours": _safe_float(row.get("duration_hours"), 2.0),
                "criticality": _safe_float(row.get("criticality"), 5.0),
                "safety": _safe_float(row.get("safety"), 5.0),
                "overdue": _safe_float(row.get("overdue"), 0.0),
                "train_impact": _safe_float(row.get("train_impact"), 5.0),
                "asset_impact": _safe_float(row.get("asset_impact"), 5.0),
                "status": row.get("status", "PENDING_BLOCK").strip(),
                "description": row.get("description", "").strip(),
                "crew_required": int(_safe_float(row.get("crew_required"), 1.0)),
                "crew_type": row.get("crew_type", "").strip() or default_crew_type,
                "machine_required": int(_safe_float(row.get("machine_required"), 0.0)),
                "machine_type": row.get("machine_type", "").strip(),
            })

    return tasks


def load_trains_from_csv(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Load scheduled train movements from CSV.
    """
    path = csv_path or os.path.join(DATA_DIR, "trains.csv")
    trains: List[Dict[str, Any]] = []

    if not os.path.exists(path):
        return []

    with open(path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trains.append({
                "id": row.get("id", "").strip(),
                "train": row.get("train", "").strip(),
                "location": row.get("location", "").strip(),
                "section_code": row.get("section_code", "").strip(),
                "overlap_start": row.get("overlap_start", "").strip(),
                "overlap_end": row.get("overlap_end", "").strip(),
                "conflict_type": row.get("conflict_type", "Track Block vs Train Passage").strip(),
                "severity": row.get("severity", "HIGH").strip(),
                "impact": row.get("impact", "").strip(),
                "status": row.get("status", "UNRESOLVED").strip(),
            })

    return trains


def load_windows_from_csv(csv_path: Optional[str] = None, window_type: str = "INITIAL") -> List[Dict[str, Any]]:
    """
    Load corridor maintenance block windows from CSV filtered by window_type ('INITIAL' or 'RESOLVED').
    """
    path = csv_path or os.path.join(DATA_DIR, "windows.csv")
    windows: List[Dict[str, Any]] = []

    if not os.path.exists(path):
        return []

    with open(path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("window_type", "INITIAL").strip().upper() == window_type.upper():
                assigned = [
                    t.strip() for t in row.get("assigned_tasks", "").split(";") if t.strip()
                ]
                windows.append({
                    "id": row.get("id", "").strip(),
                    "location": row.get("location", "").strip(),
                    "section_code": row.get("section_code", "").strip(),
                    "start_time": row.get("start_time", "").strip(),
                    "end_time": row.get("end_time", "").strip(),
                    "assigned_tasks": assigned,
                    "status": row.get("status", "SCHEDULED").strip(),
                    "priority": row.get("priority", "NORMAL").strip(),
                })

    return windows
