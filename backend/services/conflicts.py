from datetime import datetime, timezone
from typing import Any, Dict, List
from .scheduler import check_temporal_overlap, _parse_iso


def detect_conflicts(
    block_plans: List[Dict[str, Any]],
    train_movements: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Dynamically detect operational conflicts between proposed track blocks and train movements.

    Args:
        block_plans: List of active maintenance block plans with section_code, start_time, end_time.
        train_movements: List of train timetables with section_code, overlap_start, overlap_end.

    Returns:
        List[Dict[str, Any]]: Dynamically detected conflict alerts.
    """
    detected: List[Dict[str, Any]] = []

    for block in block_plans:
        b_sec = block.get("section_code", "")
        b_id = block.get("id", "BP-UNKNOWN")
        tasks = block.get("assigned_tasks", [])
        primary_task = tasks[0] if tasks else "General Track Block"

        try:
            b_start = _parse_iso(block["start_time"])
            b_end = _parse_iso(block["end_time"])
        except (KeyError, ValueError):
            continue

        for train in train_movements:
            t_sec = train.get("section_code", "")

            # Check if corridor section matches
            if b_sec and t_sec and (b_sec == t_sec or b_sec in t_sec or t_sec in b_sec):
                try:
                    t_start = _parse_iso(train["overlap_start"])
                    t_end = _parse_iso(train["overlap_end"])
                except (KeyError, ValueError):
                    continue

                if check_temporal_overlap(b_start, b_end, t_start, t_end):
                    detected.append({
                        "id": train.get("id", f"CONF-{b_id}"),
                        "task": f"{primary_task} ({b_id})",
                        "train": train.get("train", "Express Train"),
                        "location": train.get("location", block.get("location", "Unknown Location")),
                        "overlap_start": train.get("overlap_start"),
                        "overlap_end": train.get("overlap_end"),
                        "conflict_type": train.get("conflict_type", "Track Block vs Train Passage Overlap"),
                        "severity": train.get("severity", "CRITICAL"),
                        "impact": train.get("impact", "Corridor passage collision risk."),
                        "status": "UNRESOLVED",
                    })

    return detected
