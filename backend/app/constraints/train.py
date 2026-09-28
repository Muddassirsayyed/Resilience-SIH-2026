from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow, TrainMovement, Corridor
from app.constraints.base import BaseConstraintValidator
from app.constraints.models import (
    ConstraintResult, ConstraintTypeEnum, ConstraintSeverityEnum
)

def time_str_to_minutes(time_str: str) -> int:
    """Convert 'HH:MM' string to minutes from midnight."""
    if not time_str:
        return 0
    try:
        parts = time_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def time_overlaps(start1: int, end1: int, start2: int, end2: int) -> bool:
    """Check overlap between two time windows (in minutes from midnight)."""
    # Handle overnight window 1 (e.g. 22:00 to 03:00 = 1320 to 180)
    is_overnight1 = end1 < start1
    is_overnight2 = end2 < start2

    if is_overnight1:
        # Window 1 spans across midnight: [start1..1440] and [0..end1]
        return time_overlaps(start1, 1440, start2, end2) or time_overlaps(0, end1, start2, end2)
    if is_overnight2:
        return time_overlaps(start1, end1, start2, 1440) or time_overlaps(start1, end1, 0, end2)

    return max(start1, start2) < min(end1, end2)

class TrainConflictValidator(BaseConstraintValidator):
    @property
    def name(self) -> str:
        return "TrainConflictValidator"

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

        candidate_start_min = time_str_to_minutes(block_window.start_time)
        candidate_end_min = time_str_to_minutes(block_window.end_time)

        # Get corridor ID
        corridor_id = block_window.corridor_id

        # Query train movements on the same corridor or block window
        movements = db.query(TrainMovement).filter(
            (TrainMovement.corridor_id == corridor_id) |
            (TrainMovement.block_window_id == block_window.id)
        ).all()

        conflicts = []
        for m in movements:
            train_time_min = time_str_to_minutes(m.scheduled_arrival or m.scheduled_departure)
            # Assume train occupancy window of 15 mins around scheduled time
            train_start_min = train_time_min - 5
            train_end_min = train_time_min + 10

            if time_overlaps(candidate_start_min, candidate_end_min, train_start_min, train_end_min):
                conflicts.append(m)

        if conflicts:
            for c in conflicts:
                train_no = c.train.train_number if c.train else f"TRN-{c.train_id}"
                train_type = c.train.train_type.value if (c.train and hasattr(c.train.train_type, 'value')) else "EXPRESS"
                
                # Priority 1 & 2 trains (Rajdhani, Mail/Express) are protected hard constraints
                is_protected = c.train.priority <= 3 if (c.train and c.train.priority) else True
                severity = ConstraintSeverityEnum.ERROR if is_protected else ConstraintSeverityEnum.WARNING

                results.append(ConstraintResult(
                    constraint_code="TRAIN_MOVEMENT_OVERLAP",
                    constraint_type=ConstraintTypeEnum.TRAIN_CONFLICT,
                    severity=severity,
                    passed=False,
                    message=f"Train movement conflict with Train {train_no} ({train_type}) at {c.scheduled_arrival or c.scheduled_departure}.",
                    details={
                        "train_number": train_no,
                        "train_type": train_type,
                        "scheduled_time": c.scheduled_arrival or c.scheduled_departure,
                        "direction": c.direction,
                        "line_number": c.line_number
                    },
                    affected_entity=f"Train {train_no}",
                    suggested_action="Adjust block window time or regulate/reroute conflicting train."
                ))
        else:
            results.append(ConstraintResult(
                constraint_code="TRAIN_CONFLICT_NONE",
                constraint_type=ConstraintTypeEnum.TRAIN_CONFLICT,
                severity=ConstraintSeverityEnum.INFO,
                passed=True,
                message="No protected train movement conflicts detected in window."
            ))

        return results
