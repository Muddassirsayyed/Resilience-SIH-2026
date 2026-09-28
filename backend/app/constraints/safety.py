from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, SafetyConstraint
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class SafetyConstraintValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "SafetyConstraintValidator"

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

        # Fetch configured safety constraints for this task
        safety_constraints = db.query(SafetyConstraint).filter(SafetyConstraint.task_id == task.id).all()

        if task.safety_critical and not safety_constraints:
            results.append(ConstraintResult(
                constraint_code="SAFETY_CONFIG_MISSING",
                constraint_type=ConstraintTypeEnum.DATA_QUALITY,
                severity=ConstraintSeverityEnum.WARNING,
                passed=False,
                message=f"Task '{task.task_id}' is marked safety critical but lacks specific SafetyConstraint DB records.",
                affected_entity=f"Task {task.task_id}",
                suggested_action="Configure mandatory safety constraints in DB."
            ))

        for sc in safety_constraints:
            # Check if mandatory safety requirement is met
            severity = ConstraintSeverityEnum.ERROR if sc.mandatory else ConstraintSeverityEnum.WARNING
            
            # Check context/window compatibility if specified
            has_violation = False
            details = {
                "constraint_type": sc.constraint_type,
                "mandatory": sc.mandatory,
                "buffer_minutes": sc.buffer_duration_minutes,
                "applicable_department": sc.applicable_department,
                "applicable_location": sc.applicable_location
            }

            # If traffic protection requires specific buffer window
            if sc.constraint_type == "TRAFFIC_PROTECTION" and context and context.get("no_traffic_protection"):
                has_violation = True

            if has_violation:
                results.append(ConstraintResult(
                    constraint_code=f"SAFETY_{sc.constraint_type}",
                    constraint_type=ConstraintTypeEnum.SAFETY,
                    severity=severity,
                    passed=False,
                    message=f"Safety Violation: {sc.description or sc.constraint_type}",
                    details=details,
                    affected_entity=f"Task {task.task_id}",
                    suggested_action="Ensure mandatory safety protection and buffers are granted."
                ))
            else:
                results.append(ConstraintResult(
                    constraint_code=f"SAFETY_{sc.constraint_type}_PASSED",
                    constraint_type=ConstraintTypeEnum.SAFETY,
                    severity=ConstraintSeverityEnum.INFO,
                    passed=True,
                    message=f"Safety rule '{sc.constraint_type}' satisfied (buffer: {sc.buffer_duration_minutes} min).",
                    details=details
                ))

        if not safety_constraints and not task.safety_critical:
            results.append(ConstraintResult(
                constraint_code="SAFETY_RULES_CHECKED",
                constraint_type=ConstraintTypeEnum.SAFETY,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="Standard safety rules verified."
            ))

        return results
