from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow
from app.constraints.models import ConstraintResult

class BaseConstraintValidator(ABC):
    """Abstract base class for all railway constraint validators."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the validator."""
        pass

    @abstractmethod
    def validate(
        self,
        task: MaintenanceTask,
        block_window: BlockWindow,
        db: Session,
        context: Optional[Dict[str, Any]] = None
    ) -> List[ConstraintResult]:
        """Validate task against candidate block window and return constraint results."""
        pass
