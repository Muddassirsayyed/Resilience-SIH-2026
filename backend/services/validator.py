"""
Independent schedule validation service for the AI Maintenance Block Planner.
Ensures that a generated block plan respects all hard railway constraints:
- Task identity & uniqueness
- Duration fits within block window
- Horizon (0‑1440 minutes) compliance
- Maintenance‑window constraints
- Train‑track safety protection
- No overlapping blocks on the same location (resource conflict)
The validator works on the *current* data model which uses ISO‑8601 timestamps
and task titles (instead of legacy integer minute offsets).  It is deliberately
decoupled from the CP‑SAT solver – the scheduler may produce a schedule that is
then verified before the API response is returned.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)

HORIZON = 1440  # minutes in a 24‑hour planning horizon


class ScheduleValidationError(ValueError):
    """Raised when a schedule violates one or more hard constraints."""

    def __init__(self, errors: List[str]) -> None:
        self.errors = errors
        super().__init__("; ".join(errors))


def _parse_iso(iso_str: str) -> datetime:
    """Parse an ISO‑8601 string to an aware UTC datetime.

    The project stores timestamps as UTC strings (e.g. ``2026‑09‑28T04:15:00Z``).
    ``datetime.fromisoformat`` does not understand the trailing ``Z``, so we
    replace it with ``+00:00`` and ensure a timezone is present.
    """
    clean = iso_str.replace("Z", "+00:00")
    dt = datetime.fromisoformat(clean)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _minutes_since_midnight(dt: datetime) -> int:
    """Return the minute offset of *dt* relative to UTC midnight of the same day."""
    midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    return int((dt - midnight).total_seconds() // 60)


def _task_lookup_by_title(tasks: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Create a mapping ``title -> task dict`` for quick lookup.

    The scheduler stores assigned tasks by their ``title`` field.  All tasks in
    the baseline CSV have a unique title, which we rely on for validation.
    """
    return {task.get("title", ""): task for task in tasks}


def check_schedule(
    scheduled_blocks: List[Dict[str, Any]],
    tasks: List[Dict[str, Any]],
    trains: List[Dict[str, Any]],
) -> Tuple[bool, List[str]]:
    """Perform a full constraint audit on a generated block plan.

    Parameters
    ----------
    scheduled_blocks:
        List of block dictionaries returned by ``schedule_blocks``.  Each block
        contains ``id``, ``location``, ``start_time`` (ISO), ``end_time`` (ISO)
        and ``assigned_tasks`` (list of task titles).
    tasks:
        Complete list of maintenance task dictionaries (the input data set).
    trains:
        List of train movement dictionaries with ``location`` and ``overlap_*``
        ISO timestamps.
    """
    errors: List[str] = []
    title_to_task = _task_lookup_by_title(tasks)
    seen_task_ids: set[str] = set()

    # -------------------------------------------------------------------
    # 1. Per‑block checks – duration, horizon, windows, train safety
    # -------------------------------------------------------------------
    for blk_idx, block in enumerate(scheduled_blocks):
        try:
            blk_start_dt = _parse_iso(block["start_time"])
            blk_end_dt = _parse_iso(block["end_time"])
        except Exception:
            errors.append(f"Block {block.get('id','?')} has malformed timestamps.")
            continue

        blk_start = _minutes_since_midnight(blk_start_dt)
        blk_end = _minutes_since_midnight(blk_end_dt)
        blk_loc = block.get("location")
        blk_id = block.get("id", f"block_{blk_idx}")

        # Horizon constraint
        if blk_start < 0 or blk_end > HORIZON:
            errors.append(
                f"Block '{blk_id}' interval [{blk_start},{blk_end}] outside horizon 0‑{HORIZON}."
            )
        if blk_start >= blk_end:
            errors.append(
                f"Block '{blk_id}' start ({blk_start}) not less than end ({blk_end})."
            )

        # ----------------------------------------------------------------
        # 1.1  Train‑track protection – any train on the same location must not
        #      overlap the block interval.
        # ----------------------------------------------------------------
        for tr in trains:
            if tr.get("location") != blk_loc:
                continue
            try:
                tr_start = _minutes_since_midnight(_parse_iso(tr["overlap_start"]))
                tr_end = _minutes_since_midnight(_parse_iso(tr["overlap_end"]))
            except Exception:
                continue
            if blk_start < tr_end and blk_end > tr_start:
                errors.append(
                    f"Block '{blk_id}' [{blk_start},{blk_end}] conflicts with train '{tr.get('train_id','?')}' [{tr_start},{tr_end}] at location '{blk_loc}'."
                )

        # ----------------------------------------------------------------
        # 1.2  Per‑task checks within the block
        # ----------------------------------------------------------------
        for task_title in block.get("assigned_tasks", []):
            task = title_to_task.get(task_title)
            if not task:
                errors.append(f"Block '{blk_id}' references unknown task title '{task_title}'.")
                continue
            task_id = str(task.get("id") or task.get("task_id") or task_title)
            # Duplicate detection across blocks
            if task_id in seen_task_ids:
                errors.append(f"Task '{task_id}' scheduled in multiple blocks (duplicate).")
            else:
                seen_task_ids.add(task_id)

            # Location consistency – tasks must be in the same location as the block
            if task.get("location") != blk_loc:
                errors.append(
                    f"Task '{task_id}' location '{task.get('location')}' mismatches block location '{blk_loc}'."
                )

            # Duration constraint – block must be at least as long as the task
            expected_dur = int(round(float(task.get("duration_hours", 0)) * 60))
            blk_dur = blk_end - blk_start
            if blk_dur < expected_dur:
                errors.append(
                    f"Block '{blk_id}' duration ({blk_dur} min) shorter than task '{task_id}' required ({expected_dur} min)."
                )

            # Maintenance‑window compliance (if defined)
            win_start_iso = task.get("window_start")
            win_end_iso = task.get("window_end")
            if win_start_iso is not None and win_end_iso is not None:
                try:
                    win_start = _minutes_since_midnight(_parse_iso(win_start_iso))
                    win_end = _minutes_since_midnight(_parse_iso(win_end_iso))
                except Exception:
                    # malformed window – treat as error
                    errors.append(
                        f"Task '{task_id}' has malformed maintenance window timestamps."
                    )
                else:
                    if blk_start < win_start:
                        errors.append(
                            f"Block '{blk_id}' starts before task '{task_id}' window_start ({win_start} min)."
                        )
                    if blk_end > win_end:
                        errors.append(
                            f"Block '{blk_id}' ends after task '{task_id}' window_end ({win_end} min)."
                        )

    # -------------------------------------------------------------------
    # 2. Inter‑block resource conflict – same location blocks must not overlap
    # -------------------------------------------------------------------
    n = len(scheduled_blocks)
    for i in range(n):
        b1 = scheduled_blocks[i]
        try:
            s1 = _minutes_since_midnight(_parse_iso(b1["start_time"]))
            e1 = _minutes_since_midnight(_parse_iso(b1["end_time"]))
        except Exception:
            continue
        loc1 = b1.get("location")
        for j in range(i + 1, n):
            b2 = scheduled_blocks[j]
            if b2.get("location") != loc1:
                continue
            try:
                s2 = _minutes_since_midnight(_parse_iso(b2["start_time"]))
                e2 = _minutes_since_midnight(_parse_iso(b2["end_time"]))
            except Exception:
                continue
            if s1 < e2 and e1 > s2:
                errors.append(
                    f"Location resource conflict: blocks '{b1.get('id')}' and '{b2.get('id')}' overlap at location '{loc1}'."
                )

    return (len(errors) == 0, errors)


def validate_schedule(
    scheduled_blocks: List[Dict[str, Any]],
    tasks: List[Dict[str, Any]],
    trains: List[Dict[str, Any]],
    *,
    raise_exception: bool = True,
) -> bool:
    """Validate a block plan and optionally raise ``ScheduleValidationError``.

    Returns ``True`` if the schedule passes all checks.  When ``raise_exception``
    is ``True`` and validation fails, the function raises ``ScheduleValidationError``
    containing the list of violations.
    """
    is_valid, errors = check_schedule(scheduled_blocks, tasks, trains)
    if not is_valid and raise_exception:
        raise ScheduleValidationError(errors)
    return is_valid
