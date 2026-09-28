from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, PowerBlockRequirement, SNTDependency, SafetyConstraint
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class BlockDurationValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "BlockDurationValidator"

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

        # 1. Base work duration
        work_duration = task.estimated_duration_minutes or 60

        # 2. Configurable overheads
        prep_duration = context.get("prep_duration_minutes", 10) if context else 10
        
        # Isolation overhead (from PowerBlockRequirement if TRD)
        pwr_req = db.query(PowerBlockRequirement).filter(PowerBlockRequirement.task_id == task.id).first()
        isolation_duration = pwr_req.isolation_duration_minutes if pwr_req else 0

        # Restoration overhead (from SNTDependency if S&T or PowerBlockRequirement if TRD)
        snt_dep = db.query(SNTDependency).filter(SNTDependency.task_id == task.id).first()
        restoration_duration = (
            (pwr_req.restoration_duration_minutes if pwr_req else 0) + 
            (snt_dep.restoration_duration_minutes if snt_dep else 0)
        )

        # Safety buffer (from SafetyConstraint if configured)
        safety_c = db.query(SafetyConstraint).filter(SafetyConstraint.task_id == task.id).first()
        safety_buffer = safety_c.buffer_duration_minutes if safety_c else 15

        required_total_duration = prep_duration + isolation_duration + work_duration + restoration_duration + safety_buffer
        available_window_duration = block_window.duration_minutes or 0

        details = {
            "work_duration": work_duration,
            "prep_duration": prep_duration,
            "isolation_duration": isolation_duration,
            "restoration_duration": restoration_duration,
            "safety_buffer": safety_buffer,
            "required_total_duration": required_total_duration,
            "available_window_duration": available_window_duration
        }

        if required_total_duration > available_window_duration:
            results.append(ConstraintResult(
                constraint_code="BLOCK_DURATION_INSUFFICIENT",
                constraint_type=ConstraintTypeEnum.BLOCK_DURATION,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message=f"Required total block window ({required_total_duration} mins) exceeds candidate block duration ({available_window_duration} mins).",
                details=details,
                affected_entity=f"BlockWindow {block_window.window_code}",
                suggested_action=f"Select a longer block window of at least {required_total_duration} minutes."
            ))
        else:
            results.append(ConstraintResult(
                constraint_code="BLOCK_DURATION_SUFFICIENT",
                constraint_type=ConstraintTypeEnum.BLOCK_DURATION,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message=f"Block duration sufficient ({required_total_duration} mins required <= {available_window_duration} mins available).",
                details=details
            ))

        return results
