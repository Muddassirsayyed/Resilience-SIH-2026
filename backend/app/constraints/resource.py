from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, Resource, Crew, Machine, ResourceStatusEnum, ResourceTypeEnum
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

class ResourceConstraintValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "ResourceConstraintValidator"

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

        # 1. Crew Gang Check
        required_crew_count = task.required_crew_count or 1
        crews = db.query(Crew).join(Resource).filter(
            Resource.status == ResourceStatusEnum.AVAILABLE,
            Resource.capacity >= required_crew_count
        ).all()

        if not crews:
            results.append(ConstraintResult(
                constraint_code="INSUFFICIENT_CREW",
                constraint_type=ConstraintTypeEnum.RESOURCE,
                severity=ConstraintSeverityEnum.ERROR,
                passed=False,
                message=f"No available maintenance crew with required capacity >= {required_crew_count}.",
                details={"required_crew_count": required_crew_count},
                affected_entity=f"Task {task.task_id}",
                suggested_action="Assign available maintenance gang or adjust crew roster."
            ))
        else:
            results.append(ConstraintResult(
                constraint_code="CREW_AVAILABLE",
                constraint_type=ConstraintTypeEnum.RESOURCE,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message=f"Maintenance crew available ({crews[0].resource.name}, gang capacity: {crews[0].size})."
            ))

        # 2. Track Machine / Heavy Equipment Check
        if task.required_machine_type:
            req_machine_type = task.required_machine_type.upper()
            machines = (
                db.query(Machine)
                .join(Machine.resource)
                .filter(Machine.machine_type == req_machine_type)
                .all()
            )

            avail_machines = [
                m for m in machines
                if m.resource and m.resource.status == ResourceStatusEnum.AVAILABLE
            ]

            if not machines:
                results.append(ConstraintResult(
                    constraint_code="MACHINE_TYPE_NOT_FOUND",
                    constraint_type=ConstraintTypeEnum.RESOURCE,
                    severity=ConstraintSeverityEnum.ERROR,
                    passed=False,
                    message=f"Required track machine type '{req_machine_type}' is not registered in resource inventory.",
                    affected_entity=f"Machine {req_machine_type}",
                    suggested_action="Verify machinery requirement."
                ))
            elif not avail_machines:
                results.append(ConstraintResult(
                    constraint_code="MACHINE_UNAVAILABLE",
                    constraint_type=ConstraintTypeEnum.RESOURCE,
                    severity=ConstraintSeverityEnum.ERROR,
                    passed=False,
                    message=f"Required track machine '{req_machine_type}' exists but is currently busy/under maintenance.",
                    details={"machine_type": req_machine_type, "registered_count": len(machines)},
                    affected_entity=f"Machine {req_machine_type}",
                    suggested_action="Reschedule block when track machine is available."
                ))
            else:
                target_m = avail_machines[0]
                # Check machine location vs task location if context provided
                if context and context.get("enforce_location") and target_m.resource.current_location != task.location:
                    results.append(ConstraintResult(
                        constraint_code="RESOURCE_LOCATION_MISMATCH",
                        constraint_type=ConstraintTypeEnum.RESOURCE,
                        severity=ConstraintSeverityEnum.WARNING,
                        passed=True,
                        message=f"Machine '{target_m.resource.name}' is available at '{target_m.resource.current_location}' and must be repositioned to '{task.location}'.",
                        details={"machine_location": target_m.resource.current_location, "task_location": task.location},
                        suggested_action="Plan machine movement transit before block start."
                    ))
                else:
                    results.append(ConstraintResult(
                        constraint_code="MACHINE_AVAILABLE",
                        constraint_type=ConstraintTypeEnum.RESOURCE,
                        severity=ConstraintSeverityEnum.INFO,
                        passed=True,
                        message=f"Required machine '{req_machine_type}' ({target_m.resource.name}) is available."
                    ))

        return results
