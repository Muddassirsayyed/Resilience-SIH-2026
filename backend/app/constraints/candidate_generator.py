from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import MaintenanceTask, BlockWindow
from pydantic import BaseModel, ConfigDict

class CandidateWindow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    window_code: str
    corridor_code: str
    start_time: str
    end_time: str
    duration_minutes: int
    task_id: str

class CandidateWindowGenerator:
    def generate_candidate_windows(
        self,
        task: MaintenanceTask,
        db: Session,
        corridor_filter: Optional[str] = None
    ) -> List[CandidateWindow]:
        if not task:
            return []

        # Find matching block windows for corridor
        query = db.query(BlockWindow).filter(BlockWindow.maintenance_allowed == True)
        
        if corridor_filter:
            query = query.join(BlockWindow.corridor).filter(BlockWindow.corridor.has(code=corridor_filter))
        elif task.asset and task.asset.corridor:
            query = query.filter(BlockWindow.corridor_id == task.asset.corridor_id)

        available_windows = query.all()

        candidate_windows = []
        for w in available_windows:
            c_code = w.corridor.code if w.corridor else "UNKNOWN"
            # Only suggest window if duration >= task duration
            if w.duration_minutes >= (task.estimated_duration_minutes or 60):
                candidate_windows.append(CandidateWindow(
                    window_code=w.window_code,
                    corridor_code=c_code,
                    start_time=w.start_time,
                    end_time=w.end_time,
                    duration_minutes=w.duration_minutes,
                    task_id=task.task_id
                ))

        return candidate_windows

candidate_window_generator = CandidateWindowGenerator()
