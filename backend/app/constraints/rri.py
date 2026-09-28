from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, RRIConstraint
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class RRIYardValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "RRIYardValidator"

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

        # Query RRI yard constraints for this block window
        rri_constraints = db.query(RRIConstraint).filter(RRIConstraint.block_window_id == block_window.id).all()

        if not rri_constraints:
            results.append(ConstraintResult(
                constraint_code="RRI_YARD_FEASIBLE",
                constraint_type=ConstraintTypeEnum.RRI_YARD,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="No Route Relay Interlocking (RRI) yard lock restrictions active."
            ))
            return results

        for rri in rri_constraints:
            is_hard_lock = rri.restriction_type in ["POINT_LOCK", "ROUTE_LOCK", "YARD_LINE_BLOCKED"]
            severity = ConstraintSeverityEnum.ERROR if is_hard_lock else ConstraintSeverityEnum.WARNING

            results.append(ConstraintResult(
                constraint_code=f"RRI_{rri.restriction_type}",
                constraint_type=ConstraintTypeEnum.RRI_YARD,
                severity=severity,
                passed=not is_hard_lock,
                message=f"RRI Yard Lock Conflict: {rri.description or rri.restriction_type} at location {rri.location}.",
                details={
                    "location": rri.location,
                    "route": rri.route,
                    "restriction_type": rri.restriction_type,
                    "conflicting_movement": rri.conflicting_movement
                },
                affected_entity=f"Yard {rri.location}",
                suggested_action="Release yard point/route lock before granting corridor block."
            ))

        return results
