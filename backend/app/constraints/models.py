from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class ConstraintSeverityEnum(str, Enum):
    ERROR = "ERROR"       # Hard constraint violation -> Candidate INFEASIBLE
    WARNING = "WARNING"   # Soft constraint violation -> Candidate FEASIBLE_WITH_WARNINGS
    INFO = "INFO"         # Informational notice

class ConstraintTypeEnum(str, Enum):
    SAFETY = "SAFETY"
    TRAIN_CONFLICT = "TRAIN_CONFLICT"
    RESOURCE = "RESOURCE"
    TRD_POWER = "TRD_POWER"
    SNT_DEPENDENCY = "SNT_DEPENDENCY"
    RRI_YARD = "RRI_YARD"
    LOCATION = "LOCATION"
    BLOCK_DURATION = "BLOCK_DURATION"
    DEPARTMENT = "DEPARTMENT"
    DATA_QUALITY = "DATA_QUALITY"

class FeasibilityStatusEnum(str, Enum):
    FEASIBLE = "FEASIBLE"
    FEASIBLE_WITH_WARNINGS = "FEASIBLE_WITH_WARNINGS"
    INFEASIBLE = "INFEASIBLE"

class ConstraintResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    constraint_code: str
    constraint_type: ConstraintTypeEnum
    severity: ConstraintSeverityEnum
    passed: bool
    message: str
    details: Optional[Dict[str, Any]] = None
    affected_entity: Optional[str] = None
    suggested_action: Optional[str] = None

class FeasibilityResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feasible: bool
    status: FeasibilityStatusEnum
    task_id: str
    block_window_id: str
    candidate_start: Optional[str] = None
    candidate_end: Optional[str] = None
    violations: List[ConstraintResult] = []
    warnings: List[ConstraintResult] = []
    passed_constraints: List[ConstraintResult] = []
    total_constraints_checked: int = 0
    feasibility_score: float = 100.0
    explanation: str = ""
