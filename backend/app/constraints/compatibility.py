from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow
from app.constraints.engine import constraint_engine
from pydantic import BaseModel, ConfigDict

class MultiDepartmentCompatibilityResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    compatible: bool
    status: str
    task_ids: List[str]
    block_window_id: str
    reasons: List[str]
    incompatible_pairs: List[Dict[str, Any]] = []

class MultiDepartmentCompatibilityEvaluator:
    def evaluate_tasks_compatibility(
        self,
        tasks: List[MaintenanceTask],
        block_window: BlockWindow,
        db: Session,
        context: Optional[Dict[str, Any]] = None
    ) -> MultiDepartmentCompatibilityResult:
        if not tasks:
            return MultiDepartmentCompatibilityResult(
                compatible=False,
                status="NO_TASKS",
                task_ids=[],
                block_window_id=block_window.window_code if block_window else "NONE",
                reasons=["No tasks provided for compatibility evaluation."]
            )

        task_ids = [t.task_id for t in tasks]
        window_code = block_window.window_code if block_window else "NONE"
        reasons = []
        incompatible_pairs = []

        # 1. Location & Corridor Compatibility
        corridor_code = block_window.corridor.code if (block_window and block_window.corridor) else ""
        for t in tasks:
            t_loc = t.location or ""
            if corridor_code and corridor_code not in t_loc and (t.asset and t.asset.corridor and t.asset.corridor.code != corridor_code):
                reasons.append(f"Task '{t.task_id}' location ('{t_loc}') is outside block corridor '{corridor_code}'.")
                incompatible_pairs.append({"task_id": t.task_id, "reason": "Corridor mismatch"})

        # 2. Maximum combined duration check for parallel work
        max_single_duration = max((t.estimated_duration_minutes or 60) for t in tasks)
        available_window = block_window.duration_minutes if block_window else 0

        if max_single_duration > available_window:
            reasons.append(f"Longest task duration ({max_single_duration}m) exceeds block window duration ({available_window}m).")

        # 3. Individual candidate feasibility checks
        all_feasible = True
        for t in tasks:
            feas_res = constraint_engine.check_candidate(t, block_window, db, context)
            if not feas_res.feasible:
                all_feasible = False
                reasons.append(f"Task '{t.task_id}' is individually INFEASIBLE: {feas_res.explanation}")
                incompatible_pairs.append({"task_id": t.task_id, "violations": [v.message for v in feas_res.violations]})

        is_compatible = (len(reasons) == 0 and all_feasible)

        if is_compatible:
            depts = set(t.department.code if t.department else "ENGG" for t in tasks)
            status = "COMPATIBLE"
            reasons.append(f"Tasks across departments {list(depts)} can safely share corridor possession window '{window_code}'.")
        else:
            status = "INCOMPATIBLE"

        return MultiDepartmentCompatibilityResult(
            compatible=is_compatible,
            status=status,
            task_ids=task_ids,
            block_window_id=window_code,
            reasons=reasons,
            incompatible_pairs=incompatible_pairs
        )

compatibility_evaluator = MultiDepartmentCompatibilityEvaluator()
