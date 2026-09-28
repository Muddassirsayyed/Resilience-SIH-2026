from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, SNTDependency
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class SNTDependencyValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "SNTDependencyValidator"

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

        snt_dep = db.query(SNTDependency).filter(SNTDependency.task_id == task.id).first()

        if not snt_dep and not (task.department and task.department.code == "SNT"):
            results.append(ConstraintResult(
                constraint_code="SNT_DEPENDENCY_NONE",
                constraint_type=ConstraintTypeEnum.SNT_DEPENDENCY,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="No S&T signal disconnection dependency."
            ))
            return results

        if snt_dep:
            disc_min = snt_dep.disconnection_duration_minutes or 20
            rest_min = snt_dep.restoration_duration_minutes or 20
            total_snt_overhead = disc_min + rest_min

            required_total = (task.estimated_duration_minutes or 60) + total_snt_overhead

            if required_total > block_window.duration_minutes:
                results.append(ConstraintResult(
                    constraint_code="SNT_DISCONNECTION_TIMEOUT",
                    constraint_type=ConstraintTypeEnum.SNT_DEPENDENCY,
                    severity=ConstraintSeverityEnum.ERROR,
                    passed=False,
                    message=f"S&T Disconnection memo ({snt_dep.equipment}) requires {required_total} minutes (work + {disc_min}m disc + {rest_min}m rest), exceeding candidate window duration ({block_window.duration_minutes}m).",
                    details={
                        "equipment": snt_dep.equipment,
                        "disconnection_minutes": disc_min,
                        "restoration_minutes": rest_min,
                        "total_required_minutes": required_total,
                        "block_window_minutes": block_window.duration_minutes
                    },
                    affected_entity=f"Equipment {snt_dep.equipment}",
                    suggested_action="Extend block window duration to accommodate S&T signal disconnection and reconnection."
                ))
            else:
                results.append(ConstraintResult(
                    constraint_code="SNT_DISCONNECTION_SATISFIED",
                    constraint_type=ConstraintTypeEnum.SNT_DEPENDENCY,
                    severity=ConstraintSeverityEnum.INFO,
                    passed=True,
                    message=f"S&T Disconnection dependency ({snt_dep.equipment}) satisfied.",
                    details={"equipment": snt_dep.equipment, "total_overhead_minutes": total_snt_overhead}
                ))

        return results
