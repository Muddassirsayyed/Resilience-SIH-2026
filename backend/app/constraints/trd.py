from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, PowerBlockRequirement
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class TRDPowerBlockValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "TRDPowerBlockValidator"

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

        pwr_req = db.query(PowerBlockRequirement).filter(PowerBlockRequirement.task_id == task.id).first()

        task_needs_power = (
            pwr_req is not None or 
            task.department.code == "TRD" if task.department else False or
            (task.block_request and task.block_request.power_block_required)
        )

        if not task_needs_power:
            results.append(ConstraintResult(
                constraint_code="TRD_POWER_NOT_REQUIRED",
                constraint_type=ConstraintTypeEnum.TRD_POWER,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="No OHE power block required for task."
            ))
            return results

        # If power block is required, check if block window or request supports power isolation
        window_supports_power = (
            context.get("supports_power_isolation") if context else True or
            (task.block_request and task.block_request.power_block_required)
        )

        if not window_supports_power:
            results.append(ConstraintResult(
                constraint_code="TRD_POWER_BLOCK_UNSUPPORTED",
                constraint_type=ConstraintTypeEnum.TRD_POWER,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message=f"Task '{task.task_id}' requires TRD OHE Power Isolation but candidate block window does not permit power shut down.",
                affected_entity=f"Task {task.task_id}",
                suggested_action="Request integrated Traffic and Power Block window from TPC."
            ))
        else:
            isolation_min = pwr_req.isolation_duration_minutes if pwr_req else 15
            restoration_min = pwr_req.restoration_duration_minutes if pwr_req else 15
            total_trd_overhead = isolation_min + restoration_min

            results.append(ConstraintResult(
                constraint_code="TRD_POWER_BLOCK_SATISFIED",
                constraint_type=ConstraintTypeEnum.TRD_POWER,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message=f"TRD Power Block requirement satisfied (isolation: {isolation_min}m, restoration: {restoration_min}m).",
                details={
                    "isolation_minutes": isolation_min,
                    "restoration_minutes": restoration_min,
                    "total_overhead_minutes": total_trd_overhead
                }
            ))

        return results
