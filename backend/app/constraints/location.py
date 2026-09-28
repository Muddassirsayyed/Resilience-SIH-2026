from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, Corridor
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class LocationDepartmentValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "LocationDepartmentValidator"

    def validate(
        self,
        task: MaintenanceTask,
        block_window: BlockWindow,
        db: Session,
        context: Optional[Dict[str, Any]] = None
    ) -> List[ConstraintResult]:
        results = []
        if not task or not block_window:
            return results

        # 1. Location / Corridor Alignment Check
        window_corridor_code = block_window.corridor.code if block_window.corridor else "UNKNOWN"
        task_location = task.location or ""
        asset_corridor_code = task.asset.corridor.code if (task.asset and task.asset.corridor) else ""

        is_aligned = (
            window_corridor_code in task_location or 
            asset_corridor_code == window_corridor_code or
            context and context.get("bypass_location_check")
        )

        if not is_aligned:
            results.append(ConstraintResult(
                constraint_code="LOCATION_CORRIDOR_MISMATCH",
                constraint_type=ConstraintTypeEnum.LOCATION,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message=f"Task location '{task_location}' does not belong to candidate block window corridor '{window_corridor_code}'.",
                details={
                    "task_location": task_location,
                    "window_corridor": window_corridor_code,
                    "asset_corridor": asset_corridor_code
                },
                affected_entity=f"Task {task.task_id}",
                suggested_action="Select a candidate block window on the matching railway corridor."
            ))
        else:
            results.append(ConstraintResult(
                constraint_code="LOCATION_CORRIDOR_MATCHED",
                constraint_type=ConstraintTypeEnum.LOCATION,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message=f"Task location '{task_location}' matches block window corridor '{window_corridor_code}'."
            ))

        # 2. Department Responsibility Check
        if not task.department:
            results.append(ConstraintResult(
                constraint_code="DEPARTMENT_UNASSIGNED",
                constraint_type=ConstraintTypeEnum.DEPARTMENT,
                severity=ConstraintSeverityEnum.WARNING,
                passed=False,
                message=f"Task '{task.task_id}' has no assigned owner department.",
                affected_entity=f"Task {task.task_id}",
                suggested_action="Assign owning department (Engineering, TRD, S&T)."
            ))
        else:
            results.append(ConstraintResult(
                constraint_code="DEPARTMENT_VALIDATED",
                constraint_type=ConstraintTypeEnum.DEPARTMENT,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message=f"Task owned by department '{task.department.code}' ({task.department.name})."
            ))

        return results
