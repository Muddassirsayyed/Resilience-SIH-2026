from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class DataQualityValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "DataQualityValidator"

    def validate(
        self,
        task: MaintenanceTask,
        block_window: BlockWindow,
        db: Session,
        context: Optional[Dict[str, Any]] = None
    ) -> List[ConstraintResult]:
        results = []

        if not task:
            results.append(ConstraintResult(
                constraint_code="DQ_MISSING_TASK",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message="Maintenance task data is missing or unreadable.",
                suggested_action="Verify task ID in database."
            ))
            return results

        if not block_window:
            results.append(ConstraintResult(
                constraint_code="DQ_MISSING_BLOCK_WINDOW",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message="Candidate block window data is missing or unreadable.",
                suggested_action="Verify block window ID in database."
            ))
            return results

        # Check asset association
        if not task.asset:
            results.append(ConstraintResult(
                constraint_code="DQ_MISSING_ASSET",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.WARNING,
                passed=False,
                message=f"Task '{task.task_id}' has no associated asset record.",
                affected_entity=f"Task {task.task_id}",
                suggested_action="Link maintenance task to infrastructure asset."
            ))

        # Check block times
        if not block_window.start_time or not block_window.end_time:
            results.append(ConstraintResult(
                constraint_code="DQ_INVALID_TIME_BOUNDS",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message=f"Block window '{block_window.window_code}' has invalid start/end timestamps.",
                affected_entity=f"BlockWindow {block_window.window_code}",
                suggested_action="Configure valid start_time and end_time for block window."
            ))

        if not results:
            results.append(ConstraintResult(
                constraint_code="DQ_CHECK_PASSED",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="Data quality validation passed."
            ))

        return results
