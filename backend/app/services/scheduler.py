"""
scheduler.py
============
Core CP-SAT scheduling engine for the AI Maintenance Block Planner.

Phase 2 implementation: Google OR-Tools CP-SAT solver.
Phase 5 addition:       per-task maintenance-window constraints (C3).
Phase 7 addition:       per-location resource pools for C1 (correct
                        parallelism between tasks at different locations).

Resource model (Phase 7)
------------------------
A thorough audit of the entire project found NO resource/team/crew/
department/gang/machine/workforce fields in any task dict, test, CSV,
schema, or data store.

This MVP therefore models resources as LOCATIONS only:

  * Two tasks at the SAME   location share one constrained resource
    → they must not overlap in time (location capacity = 1 block at a time).

  * Two tasks at DIFFERENT locations use independent resources
    → they may run in parallel (simultaneous maintenance on different tracks).

If a shared resource field is added in a future phase, a separate
per-resource NoOverlap pool should be added alongside the per-location pools.

Model summary
-------------
Decision variables
  selected[i]  – BoolVar   : whether task i is scheduled
  start[i]     – IntVar    : start time of task i (minutes from day start)
  end[i]       – IntVar    : end time  of task i  (= start[i] + duration[i])
  interval[i]  – Optional IntervalVar : [start, end) present only when selected

Constraints
  C1  Per-location AddNoOverlap pools  (Phase 7 — corrected from global pool)
        Intervals are grouped by task location.  Within each location group,
        no two selected tasks may overlap in time.  Tasks at different
        locations are in separate pools and may run simultaneously.
        OR-Tools optional intervals are automatically ignored when
        selected[i] = False, so unscheduled tasks never block others.

  C2  Train-track protection (per same-location task/train pair)
        For each (task_i, train_j) where location matches:
          before_ij = NewBoolVar
          If selected[i] AND before_ij  → end[i]   <= train_j.start
          If selected[i] AND ¬before_ij → start[i] >= train_j.end
        The solver chooses before_ij freely, which implements the
        logical OR without using AddLinearConstraint incorrectly.

  C3  Maintenance-window constraint (Phase 5)
        Each task carries optional fields ``window_start`` / ``window_end``
        (minutes from day start).  When omitted they default to
        [0, HORIZON] — the full day — preserving backward compatibility.

        Field semantics:
          window_start  – earliest minute the maintenance block may begin
          window_end    – latest  minute the maintenance block must finish

        When selected:
          start[i] >= window_start[i]
          end[i]   <= window_end[i]

        Tasks invalidated at parse time (bad window or duration > window)
        are forced unscheduled (selected = False) so they never crash the
        solver.

Objective  (Phase 8 — coverage-first lexicographic)
  Maximise Σ (coverage_weight + priority_weight[i]) * selected[i]

  where:
    priority_weight[i] = int(round(clamp(priority[i], 0, 1) * PRIORITY_SCALE))
                         ∈ [0, PRIORITY_SCALE]

    coverage_weight    = n_tasks * PRIORITY_SCALE + 1
                         (a constant added per selected task)

  Why this is coverage-first (lexicographic proof):
    Scheduling one extra task adds coverage_weight = n * 1000 + 1 to the
    objective.  The maximum total priority bonus from ALL n tasks is
    n * PRIORITY_SCALE = n * 1000.  Because:

      coverage_weight  =  n * 1000 + 1  >  n * 1000  ≥  Σ priority_weight

    one additional scheduled task always outweighs any possible priority
    difference between two otherwise equal-count schedules.

  Secondary objective (tie-break on task count):
    Among schedules with the same number of selected tasks, the priority
    sum Σ priority_weight[i] * selected[i] determines the winner.

  Priority semantics (Phase 6):
    priority in [0, 1]  → scaled to [0, PRIORITY_SCALE]  (expected range)
    priority < 0        → clamped to 0
    priority > 1        → clamped to 1
    priority missing    → defaults to 0.0

  CP-SAT requires integer coefficients; all weights are integers.
"""

from __future__ import annotations

from ortools.sat.python import cp_model

HORIZON: int = 1440          # one scheduling day in minutes
PRIORITY_SCALE: int = 1_000  # float priority → integer weight in [0, 1000]
# COVERAGE_SCALE is computed inside generate_schedule() as:
#   n_tasks * PRIORITY_SCALE + 1
# It cannot be a module-level constant because it depends on the number of
# tasks in each invocation.  See the objective section of generate_schedule().


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_schedule(tasks: list[dict], trains: list[dict]) -> dict:
    """
    Generate an optimized maintenance schedule using Google OR-Tools CP-SAT.

    Parameters
    ----------
    tasks : list[dict]
        Each dict must contain:
          task_id      (str)   – unique identifier
          location     (str)   – track / station label
          duration     (int)   – maintenance window length in minutes
          priority     (float) – scheduling urgency in [0, 1]

        Optional per-task maintenance-window fields (Phase 5):
          window_start (int)   – earliest start minute  [default: 0]
          window_end   (int)   – latest   end   minute   [default: HORIZON]

        Backward compatibility: tasks without window fields are treated as
        schedulable across the full day (window_start=0, window_end=1440).

    trains : list[dict]
        Each dict must contain:
          train_id (str)   – unique identifier
          location (str)   – track / station label
          start    (int)   – arrival / block-start in minutes from day start
          end      (int)   – departure / block-end   in minutes from day start

    Returns
    -------
    dict
        {
          "status"           : "optimal" | "feasible" | "infeasible" | "unknown",
          "scheduled_tasks"  : [ {task_id, location, duration, priority,
                                  start, end}, ... ],
          "unscheduled_tasks": [ task_id, ... ],
          "objective"        : float,   # weighted priority sum of scheduled tasks
          "wall_time"        : float,   # solver wall-clock time in seconds
        }

    Notes
    -----
    * Tasks whose duration exceeds HORIZON or their window are silently
      left unscheduled.
    * Invalid windows (window_start >= window_end, out-of-range) force the
      task unscheduled rather than crashing the solver.
    * The solver is given a 30-second time limit; a ``"feasible"`` (non-
      optimal) result may be returned for very large instances.
    """
    if not tasks:
        return _empty_result()

    # ------------------------------------------------------------------
    # 0. Validate train movements (hard safety intervals)
    # ------------------------------------------------------------------
    for train in trains:
        if not isinstance(train, dict):
            raise ValueError(f"Invalid train format: expected dict, got {type(train).__name__}")
        trn_id = train.get("train_id")
        loc = train.get("location")
        if not trn_id or not loc or not isinstance(loc, str) or not loc.strip():
            raise ValueError(f"Invalid train data: missing train_id or location in {train}")
        try:
            train_start = int(train["start"])
            train_end   = int(train["end"])
        except (KeyError, TypeError, ValueError) as err:
            raise ValueError(
                f"Invalid train times for train '{trn_id}': start and end must be integers"
            ) from err

        if train_start >= train_end:
            raise ValueError(
                f"Invalid train interval for train '{trn_id}': start ({train_start}) >= end ({train_end})"
            )
        if train_start < 0 or train_end > HORIZON:
            raise ValueError(
                f"Train interval for train '{trn_id}' [{train_start}, {train_end}] is out of horizon [0, {HORIZON}]"
            )

    model = cp_model.CpModel()

    # ------------------------------------------------------------------
    # 1. Build decision variables
    # ------------------------------------------------------------------
    selected:  list[cp_model.IntVar] = []
    starts:    list[cp_model.IntVar] = []
    ends:      list[cp_model.IntVar] = []
    intervals: list[cp_model.IntervalVar] = []
    valid_tasks: list[dict] = []
    task_loc_valid: list[bool] = []

    # Per-location interval pools for C1.
    # key: location string  →  value: list of optional IntervalVars
    # Tasks in the same pool cannot overlap; tasks in different pools can.
    location_intervals: dict[str, list[cp_model.IntervalVar]] = {}
    crew_intervals: dict[str, list[cp_model.IntervalVar]] = {}
    task_id_to_idx: dict[str, int] = {}

    for task in tasks:
        if not isinstance(task, dict):
            continue

        tid = task.get("task_id")
        if tid is None or not str(tid).strip():
            # A task without a task_id cannot be tracked or returned in schedule lists
            continue
        tid = str(tid)

        location = task.get("location")
        loc_ok = bool(location and isinstance(location, str) and location.strip())

        raw_dur = task.get("duration")
        try:
            duration = int(raw_dur)
            dur_ok = (0 < duration <= HORIZON)
        except (TypeError, ValueError):
            duration = -1
            dur_ok = False

        # ---- Phase 5: resolve maintenance window -------------------------
        win_start, win_end, window_ok = _resolve_window(task, duration)
        # ------------------------------------------------------------------

        # A task is infeasible if its location is invalid, duration is invalid,
        # or maintenance window is invalid/too short.
        infeasible = (not loc_ok) or (not dur_ok) or (not window_ok)

        safe_duration = duration if (dur_ok and duration > 0) else 1

        # Clamp variable domains to the maintenance window so the solver
        # never places a task outside it even as a side-effect.
        # When infeasible, use dummy [0,0] / [0, safe_duration] domains — the task will
        # be forced to selected=False before any constraint touches it.
        if not infeasible:
            start_lb = win_start
            start_ub = win_end - safe_duration          # latest valid start
            end_lb   = win_start + safe_duration
            end_ub   = win_end
        else:
            start_lb = start_ub = 0
            end_lb   = end_ub   = safe_duration

        sel   = model.new_bool_var(f"sel_{tid}")
        start = model.new_int_var(start_lb, start_ub, f"start_{tid}")
        end   = model.new_int_var(end_lb,   end_ub,   f"end_{tid}")

        if infeasible:
            model.add(sel == 0)  # definitively exclude infeasible tasks

        # Optional interval: present iff selected.
        # OR-Tools enforces  end == start + duration  when present.
        interval = model.new_optional_interval_var(
            start, safe_duration, end, sel, f"interval_{tid}"
        )

        try: bb = int(task.get("buffer_before", 0))
        except: bb = 0
        try: ba = int(task.get("buffer_after", 0))
        except: ba = 0
        bb = max(0, bb)
        ba = max(0, ba)

        if bb > 0 or ba > 0:
            padded_start = model.new_int_var(start_lb - bb, start_ub, f"p_start_{tid}")
            padded_end   = model.new_int_var(end_lb, end_ub + ba, f"p_end_{tid}")
            model.add(padded_start == start - bb)
            model.add(padded_end == end + ba)
            overlap_interval = model.new_optional_interval_var(padded_start, safe_duration + bb + ba, padded_end, sel, f"p_interval_{tid}")
        else:
            overlap_interval = interval

        selected.append(sel)
        starts.append(start)
        ends.append(end)
        intervals.append(interval)
        task_id_to_idx[tid] = len(valid_tasks)
        valid_tasks.append(task)
        task_loc_valid.append(loc_ok)

        # Register this interval in its location's pool only if location is valid
        if loc_ok:
            location_intervals.setdefault(location, []).append(overlap_interval)
            
        crew = task.get("crew")
        if crew and isinstance(crew, str) and crew.strip():
            crew_intervals.setdefault(crew.strip(), []).append(overlap_interval)

    if not valid_tasks:
        return _empty_result()

    # ------------------------------------------------------------------
    # 2. C1 – Per-location no-overlap  (Phase 7)
    #
    #    One AddNoOverlap constraint per location.  Tasks within the same
    #    location share a single "track" resource and cannot overlap.
    #    Tasks at different locations are in separate pools and may run
    #    simultaneously — correct behaviour for an Indian Railways
    #    maintenance planner where each track section is independent.
    #
    #    AddNoOverlap automatically ignores optional intervals whose
    #    is_present = False, so unscheduled tasks never block others.
    # ------------------------------------------------------------------
    for loc_intervals in location_intervals.values():
        model.add_no_overlap(loc_intervals)
        
    for cr_intervals in crew_intervals.values():
        model.add_no_overlap(cr_intervals)
        
    for i, task in enumerate(valid_tasks):
        deps = task.get("depends_on")
        if isinstance(deps, list):
            for dep_tid in deps:
                dep_tid = str(dep_tid)
                if dep_tid in task_id_to_idx:
                    j = task_id_to_idx[dep_tid]
                    model.add(starts[i] >= ends[j]).only_enforce_if([selected[i], selected[j]])

    # ------------------------------------------------------------------
    # 3. C2 – Train-track protection
    #    For each (task, train) pair sharing the same location the task
    #    must either finish before the train arrives OR start after the
    #    train departs.
    #
    #    Correct OR encoding:
    #      before_ij is a free BoolVar the solver picks.
    #      selected[i] ∧ before_ij  → end[i]   <= train.start
    #      selected[i] ∧ ¬before_ij → start[i] >= train.end
    #
    #    Because the solver must satisfy the active branch, at least one
    #    non-overlap direction is always enforced for selected tasks.
    # ------------------------------------------------------------------
    for i, task in enumerate(valid_tasks):
        if not task_loc_valid[i]:
            continue
        for train in trains:
            if task["location"] != train["location"]:
                continue  # different locations → no conflict

            train_start = int(train["start"])
            train_end   = int(train["end"])
            tid = str(task["task_id"])
            trn = str(train["train_id"])

            before = model.new_bool_var(f"before_{tid}_{trn}")

            try: bb = int(task.get("buffer_before", 0))
            except: bb = 0
            try: ba = int(task.get("buffer_after", 0))
            except: ba = 0
            bb = max(0, bb)
            ba = max(0, ba)

            # Branch A: task ends before train arrives
            model.add(ends[i] + ba <= train_start).only_enforce_if(
                [selected[i], before]
            )

            # Branch B: task starts after train departs
            model.add(starts[i] - bb >= train_end).only_enforce_if(
                [selected[i], before.Not()]
            )

    # ------------------------------------------------------------------
    # 4. Objective – coverage-first, then priority (Phase 8)
    #
    #    We use a single linear objective that is mathematically equivalent
    #    to a lexicographic (coverage, priority) maximisation:
    #
    #      coverage_weight  = n_tasks * PRIORITY_SCALE + 1
    #
    #    Proof of coverage-first dominance:
    #      • Scheduling one extra task contributes coverage_weight to the
    #        objective.
    #      • The maximum combined priority bonus from ALL n tasks is
    #        n * PRIORITY_SCALE.
    #      • Because  n * PRIORITY_SCALE + 1  >  n * PRIORITY_SCALE,
    #        adding one task always improves the objective more than any
    #        possible gain from prioritising tasks within a fixed count.
    #
    #    Coefficient used per task:
    #      total_weight[i]  =  coverage_weight  +  priority_weight[i]
    #                       ∈  [coverage_weight, coverage_weight + PRIORITY_SCALE]
    #
    #    No floating-point coefficients; all values are Python int.
    # ------------------------------------------------------------------
    n_tasks         = len(valid_tasks)
    coverage_weight = n_tasks * PRIORITY_SCALE + 1   # dominates any priority sum

    priority_weights = [_priority_weight(task) for task in valid_tasks]
    total_weights    = [coverage_weight + priority_weights[i]
                        for i in range(n_tasks)]

    model.maximize(
        sum(total_weights[i] * selected[i] for i in range(n_tasks))
    )

    # ------------------------------------------------------------------
    # 5. Solve
    # ------------------------------------------------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    solver.parameters.random_seed = 42
    solver.parameters.num_search_workers = 1

    status_code = solver.solve(model)

    # ------------------------------------------------------------------
    # 6. Extract results
    # ------------------------------------------------------------------
    if status_code in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        scheduled   = []
        unscheduled = []

        for i, task in enumerate(valid_tasks):
            tid = str(task["task_id"])
            if solver.value(selected[i]):
                item = {
                    "task_id":  tid,
                    "location": task["location"],
                    "duration": int(task["duration"]),
                    "priority": float(task.get("priority", 0.0)),
                    "start":    solver.value(starts[i]),
                    "end":      solver.value(ends[i]),
                }
                if "crew" in task:
                    item["crew"] = task["crew"]
                if "depends_on" in task:
                    item["depends_on"] = task["depends_on"]
                if "buffer_before" in task:
                    item["buffer_before"] = task["buffer_before"]
                if "buffer_after" in task:
                    item["buffer_after"] = task["buffer_after"]
                scheduled.append(item)
            else:
                unscheduled.append(tid)

        # Normalize output lists deterministically:
        # Sort scheduled tasks by start time, location, and task_id.
        # Sort unscheduled task IDs alphabetically.
        scheduled.sort(key=lambda t: (t["start"], t["location"], t["task_id"]))
        unscheduled.sort()

        return {
            "status":            "optimal" if status_code == cp_model.OPTIMAL else "feasible",
            "scheduled_tasks":   scheduled,
            "unscheduled_tasks": unscheduled,
            "objective":         solver.objective_value,
            "wall_time":         solver.wall_time,
        }

    # Infeasible or solver error
    unsched_ids = [str(t["task_id"]) for t in valid_tasks if t.get("task_id")]
    return {
        "status":            "infeasible" if status_code == cp_model.INFEASIBLE else "unknown",
        "scheduled_tasks":   [],
        "unscheduled_tasks": sorted(unsched_ids),
        "objective":         0.0,
        "wall_time":         solver.wall_time,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_window(task: dict, duration: int) -> tuple[int, int, bool]:
    """
    Resolve the maintenance window for a task.

    Returns
    -------
    (win_start, win_end, window_ok)

    win_start : int  – earliest valid start minute
    win_end   : int  – latest valid end minute
    window_ok : bool – False when the window is invalid or too short for the
                       task duration (task should be forced unscheduled)

    Defaults (backward compatible)
    --------------------------------
    If the task dict contains no ``window_start`` / ``window_end`` keys,
    the full-day window [0, HORIZON] is used so existing tasks are
    unaffected by the Phase 5 change.

    Validation rules
    ----------------
    * 0 <= window_start <= HORIZON
    * 0 <= window_end   <= HORIZON
    * window_start < window_end
    * (window_end - window_start) >= duration   (task must fit)
    * duration > 0
    """
    if duration <= 0:
        return 0, HORIZON, False

    raw_ws = task.get("window_start")
    raw_we = task.get("window_end")

    if raw_ws is None:
        win_start = 0
    else:
        try:
            win_start = int(raw_ws)
        except (TypeError, ValueError):
            return 0, HORIZON, False

    if raw_we is None:
        win_end = HORIZON
    else:
        try:
            win_end = int(raw_we)
        except (TypeError, ValueError):
            return 0, HORIZON, False

    if not (0 <= win_start <= HORIZON):
        return win_start, win_end, False

    if not (0 <= win_end <= HORIZON):
        return win_start, win_end, False

    if win_start >= win_end:
        return win_start, win_end, False

    if (win_end - win_start) < duration:
        return win_start, win_end, False   # task cannot fit inside window

    return win_start, win_end, True


def _priority_weight(task: dict) -> int:
    """
    Convert a task's ``priority`` field to a non-negative integer weight
    suitable for use as a CP-SAT objective coefficient.

    Clamping rules (Phase 6)
    ------------------------
    * Missing ``priority`` key → treated as 0.0 (lowest preference)
    * priority < 0             → clamped to 0   (no negative incentive)
    * priority > 1             → clamped to 1   (no super-priority)
    * priority in [0, 1]       → scaled normally

    Scaling
    -------
    weight = int(round(clamped_priority * PRIORITY_SCALE))

    ``round()`` before ``int()`` prevents float truncation from producing
    an off-by-one weight at the boundaries
    (e.g. 1.0 * 1000 may evaluate to 999.9999… in float arithmetic).

    Returns
    -------
    int  in range [0, PRIORITY_SCALE]
    """
    raw = task.get("priority", 0.0)

    try:
        value = float(raw)
    except (TypeError, ValueError):
        value = 0.0

    clamped = max(0.0, min(1.0, value))
    return int(round(clamped * PRIORITY_SCALE))


def _empty_result() -> dict:
    """Return a canonical empty schedule (no tasks provided)."""
    return {
        "status":            "optimal",
        "scheduled_tasks":   [],
        "unscheduled_tasks": [],
        "objective":         0.0,
        "wall_time":         0.0,
    }
