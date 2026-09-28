"""
planning.py
===========
API routes for the maintenance block planning module.

Architecture
------------

GET /api/plan
      ↓
planning.py  →  task_store / train_store  (app/data_store.py)
      ↓
generate_schedule(tasks, trains)           (app/services/scheduler.py)
      ↓
{ "plan": [...], "total_tasks_scheduled": N }

GET /api/conflicts
      ↓
planning.py  →  task_store / train_store  (app/data_store.py)
      ↓
generate_schedule(tasks, trains)           (app/services/scheduler.py)
      ↓
detect_conflicts(schedule, trains)         (app/services/conflict.py)
      ↓
{ "conflicts": [...], "total_conflicts": N }

Endpoints
---------
GET  /api/plan       – Run the CP-SAT scheduler and return the optimized plan.
GET  /api/conflicts  – Run the scheduler then validate for train conflicts.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.data_store import task_store, train_store
from app.services.conflict import detect_conflicts
from app.services.scheduler import generate_schedule
from app.services.validator import ScheduleValidationError, validate_schedule

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------

def _run_scheduler() -> list[dict]:
    """
    Run the CP-SAT scheduler against the current data store contents,
    independently validate the schedule against all hard railway constraints,
    and return the list of scheduled maintenance blocks.

    Raises HTTPException on solver failure, invalid input, or validation failure.
    """
    if not task_store:
        return []

    try:
        result = generate_schedule(tasks=task_store, trains=train_store)
    except ValueError as exc:
        logger.warning("Invalid input to scheduler: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {exc}",
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Scheduler raised an unexpected error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Internal scheduling error. Please contact the system administrator.",
        ) from exc

    if result["status"] in ("infeasible", "unknown"):
        raise HTTPException(
            status_code=503,
            detail=(
                f"Scheduler could not find a feasible solution "
                f"(status: {result['status']})."
            ),
        )

    # Phase 10: Independent validation before returning or exposing plan
    try:
        validate_schedule(
            schedule=result["scheduled_tasks"],
            tasks=task_store,
            trains=train_store,
        )
    except ScheduleValidationError as exc:
        logger.error("Schedule validation failed on generated output: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Internal scheduling error. Please contact the system administrator.",
        ) from exc

    return result["scheduled_tasks"]


# ---------------------------------------------------------------------------
# GET /api/plan
# ---------------------------------------------------------------------------

@router.get("/plan", summary="Get optimized maintenance plan")
def get_plan():
    """
    Run the CP-SAT scheduling engine against the currently loaded tasks
    and trains, and return the optimized maintenance plan.

    Response schema
    ---------------
    {
        "plan": [
            {
                "task_id":  str,
                "location": str,
                "start":    int,   # minutes from day start
                "end":      int,   # minutes from day start
                "priority": float
            },
            ...
        ],
        "total_tasks_scheduled": int
    }

    Returns an empty plan (HTTP 200) when no tasks have been loaded.
    Returns HTTP 503 if the solver returns an infeasible / unknown status.
    """
    scheduled_tasks = _run_scheduler()

    plan = []
    for t in scheduled_tasks:
        item = {
            "task_id":  t["task_id"],
            "location": t["location"],
            "start":    t["start"],
            "end":      t["end"],
            "priority": t["priority"],
        }
        if "crew" in t:
            item["crew"] = t["crew"]
        if "depends_on" in t:
            item["depends_on"] = t["depends_on"]
        if "buffer_before" in t:
            item["buffer_before"] = t["buffer_before"]
        if "buffer_after" in t:
            item["buffer_after"] = t["buffer_after"]
        plan.append(item)

    return {
        "plan":                  plan,
        "total_tasks_scheduled": len(plan),
    }


# ---------------------------------------------------------------------------
# GET /api/conflicts
# ---------------------------------------------------------------------------

@router.get("/conflicts", summary="Get maintenance / train conflicts")
def get_conflicts():
    """
    Run the CP-SAT scheduler, then validate the resulting schedule against
    all loaded train movements and return any detected conflicts.

    Under normal operation the CP-SAT solver already prevents conflicts, so
    this endpoint acts as a **safety / audit layer**.

    Response schema
    ---------------
    {
        "conflicts": [
            {
                "task_id":     str,
                "train_id":    str,
                "location":    str,
                "block_start": int,
                "block_end":   int,
                "train_start": int,
                "train_end":   int
            },
            ...
        ],
        "total_conflicts": int
    }

    Returns an empty list (HTTP 200) when no tasks are loaded or no
    conflicts are found.
    Returns HTTP 503 if the solver returns an infeasible / unknown status.
    """
    # 1. Generate the schedule (or return empty if no tasks)
    scheduled_tasks = _run_scheduler()

    # 2. Detect conflicts between the schedule and train movements
    try:
        conflicts = detect_conflicts(
            schedule=scheduled_tasks,
            trains=train_store,
        )
    except ValueError as exc:
        logger.warning("Invalid input to conflict detection: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {exc}",
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Conflict detection raised an unexpected error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Internal conflict-detection error. Please contact the system administrator.",
        ) from exc

    return {
        "conflicts":       conflicts,
        "total_conflicts": len(conflicts),
    }

