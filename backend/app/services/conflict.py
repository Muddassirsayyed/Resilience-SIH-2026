"""
conflict.py
===========
Conflict detection service for the AI Maintenance Block Planner.

Phase 4: Validate a generated schedule against train movements and
report every maintenance block that overlaps a train window at the
same location.

Overlap rule (half-open intervals)
-----------------------------------
Two intervals [a_start, a_end) and [b_start, b_end) overlap when:

    a_start < b_end  AND  a_end > b_start

Boundary cases:
  block_end   == train_start  →  NO conflict  (block finishes as train arrives)
  block_start == train_end    →  NO conflict  (block begins as train departs)
  any interior intersection   →  CONFLICT
"""

from __future__ import annotations


def detect_conflicts(
    schedule: list[dict],
    trains: list[dict],
) -> list[dict]:
    """
    Detect maintenance-block / train-movement conflicts.

    Parameters
    ----------
    schedule : list[dict]
        Scheduled maintenance blocks, each containing:
          task_id  (str)  – unique task identifier
          location (str)  – track / station label
          start    (int)  – block start in minutes from day start
          end      (int)  – block end   in minutes from day start
          priority (float)

        Typically sourced from ``generate_schedule()["scheduled_tasks"]``.

    trains : list[dict]
        Train movements, each containing:
          train_id (str)  – unique train identifier
          location (str)  – track / station label
          start    (int)  – track-occupation start (minutes from day start)
          end      (int)  – track-occupation end   (minutes from day start)

    Returns
    -------
    list[dict]
        One entry per conflicting (block, train) pair:

        {
            "task_id":    str,   # from the maintenance block
            "train_id":   str,   # from the train movement
            "location":   str,   # shared location
            "block_start": int,
            "block_end":   int,
            "train_start": int,
            "train_end":   int,
        }

        Returns an empty list when no conflicts exist.

    Notes
    -----
    * Only blocks and trains at the **same location** are compared.
    * The overlap check uses strict half-open interval semantics so that
      adjacent (touching) windows are never flagged as conflicts.
    * ``scheduler.py`` (CP-SAT) already prevents conflicts during
      optimisation.  This function is the safety / audit layer.
    """
    # Validate train inputs to ensure invalid train intervals are not silently accepted
    for train in trains:
        if not isinstance(train, dict):
            raise ValueError(f"Invalid train format: expected dict, got {type(train).__name__}")
        trn_id = train.get("train_id")
        loc = train.get("location")
        if not trn_id or not loc or not isinstance(loc, str) or not loc.strip():
            raise ValueError(f"Invalid train data: missing train_id or location in {train}")
        try:
            t_start = int(train["start"])
            t_end   = int(train["end"])
        except (KeyError, TypeError, ValueError) as err:
            raise ValueError(
                f"Invalid train times for train '{trn_id}': start and end must be integers"
            ) from err

        if t_start >= t_end:
            raise ValueError(
                f"Invalid train interval for train '{trn_id}': start ({t_start}) >= end ({t_end})"
            )
        if t_start < 0 or t_end > 1440:
            raise ValueError(
                f"Train interval for train '{trn_id}' [{t_start}, {t_end}] is out of horizon [0, 1440]"
            )

    conflicts: list[dict] = []

    for block in schedule:
        block_start = int(block["start"])
        block_end   = int(block["end"])

        for train in trains:
            # Rule 1: location must match
            if block["location"] != train["location"]:
                continue

            train_start = int(train["start"])
            train_end   = int(train["end"])

            try: bb = int(block.get("buffer_before", 0))
            except: bb = 0
            try: ba = int(block.get("buffer_after", 0))
            except: ba = 0
            bb = max(0, bb)
            ba = max(0, ba)

            # Rule 2: half-open interval overlap test
            if (block_start - bb) < train_end and (block_end + ba) > train_start:
                conflicts.append({
                    "task_id":    block["task_id"],
                    "train_id":   train["train_id"],
                    "location":   block["location"],
                    "block_start": block_start,
                    "block_end":   block_end,
                    "train_start": train_start,
                    "train_end":   train_end,
                })

    return conflicts
