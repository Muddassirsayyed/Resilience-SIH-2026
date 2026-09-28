import time
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models import MaintenanceTask, BlockWindow
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, FeasibilityResult, FeasibilityStatusEnum, ConstraintSeverityEnum
)
from app.constraints.data_quality import DataQualityValidator
from app.constraints.location import LocationDepartmentValidator
from app.constraints.block import BlockDurationValidator
from app.constraints.safety import SafetyConstraintValidator
from app.constraints.train import TrainConflictValidator
from app.constraints.resource import ResourceConstraintValidator
from app.constraints.trd import TRDPowerBlockValidator
from app.constraints.snt import SNTDependencyValidator
from app.constraints.rri import RRIYardValidator

logger = logging.getLogger("railopt.constraints")

class RailwayConstraintEngine:
    def __init__(self, validators: Optional[List[BaseConstraintValidator]] = None):
        if validators is not None:
            self.validators = validators
        else:
            self.validators = [
                DataQualityValidator(),
                LocationDepartmentValidator(),
                BlockDurationValidator(),
                SafetyConstraintValidator(),
                TrainConflictValidator(),
                ResourceConstraintValidator(),
                TRDPowerBlockValidator(),
                SNTDependencyValidator(),
                RRIYardValidator(),
            ]

    def register_validator(self, validator: BaseConstraintValidator):
        self.validators.append(validator)

    def check_candidate(
        self,
        task: MaintenanceTask,
        block_window: BlockWindow,
        db: Session,
        context: Optional[Dict[str, Any]] = None
    ) -> FeasibilityResult:
        start_time = time.time()
        
        task_id_str = task.task_id if task else "UNKNOWN"
        window_id_str = block_window.window_code if block_window else "UNKNOWN"

        logger.info(f"[Constraint Engine] Evaluating candidate task '{task_id_str}' against block window '{window_id_str}'")

        all_results: List[ConstraintResult] = []

        for validator in self.validators:
            try:
                res = validator.validate(task, block_window, db, context)
                all_results.extend(res)
            except Exception as e:
                logger.error(f"[Constraint Engine] Validator '{validator.name}' error: {e}", exc_info=True)
                all_results.append(ConstraintResult(
                    constraint_code=f"{validator.name.upper()}_ERROR",
                    constraint_type="DATA_QUALITY",
                    severity=ConstraintSeverityEnum.ERROR,
                    passed=False,
                    message=f"Validator internal error: {e}"
                ))

        violations: List[ConstraintResult] = []
        warnings: List[ConstraintResult] = []
        passed_constraints: List[ConstraintResult] = []

        for r in all_results:
            if not r.passed:
                if r.severity == ConstraintSeverityEnum.ERROR:
                    violations.append(r)
                elif r.severity == ConstraintSeverityEnum.WARNING:
                    warnings.append(r)
            else:
                passed_constraints.append(r)

        # Determine overall feasibility status
        if violations:
            feasible = False
            status = FeasibilityStatusEnum.INFEASIBLE
            explanation = f"Candidate rejected because {len(violations)} hard operational/safety constraint(s) failed."
        elif warnings:
            feasible = True
            status = FeasibilityStatusEnum.FEASIBLE_WITH_WARNINGS
            explanation = f"Candidate is feasible with {len(warnings)} operational warning(s)."
        else:
            feasible = True
            status = FeasibilityStatusEnum.FEASIBLE
            explanation = "All hard and soft operational constraints satisfied."

        # Calculate feasibility score (100 - 25 for each violation - 5 for each warning)
        score = max(0.0, 100.0 - (len(violations) * 25.0) - (len(warnings) * 5.0))

        eval_duration_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"[Constraint Engine] Evaluation complete in {eval_duration_ms}ms. "
            f"Status: {status.value} (Feasible: {feasible}, Violations: {len(violations)}, Warnings: {len(warnings)})"
        )

        return FeasibilityResult(
            feasible=feasible,
            status=status,
            task_id=task_id_str,
            block_window_id=window_id_str,
            candidate_start=block_window.start_time if block_window else None,
            candidate_end=block_window.end_time if block_window else None,
            violations=violations,
            warnings=warnings,
            passed_constraints=passed_constraints,
            total_constraints_checked=len(all_results),
            feasibility_score=score,
            explanation=explanation
        )

# Global singleton engine instance
constraint_engine = RailwayConstraintEngine()
