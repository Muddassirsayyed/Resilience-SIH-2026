from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.db.session import get_db
from app.models import MaintenanceTask, BlockWindow
from app.constraints import constraint_engine, compatibility_evaluator, candidate_window_generator
from app.constraints.models import FeasibilityResult

router = APIRouter(prefix="/api/constraints", tags=["constraints"])

class CheckConstraintRequest(BaseModel):
    task_id: str
    block_window_id: str
    candidate_start: Optional[str] = None
    candidate_end: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class CompatibilityCheckRequest(BaseModel):
    task_ids: List[str]
    block_window_id: str
    context: Optional[Dict[str, Any]] = None

@router.post("/check", response_model=FeasibilityResult)
def check_candidate_feasibility(request: CheckConstraintRequest, db: Session = Depends(get_db)):
    # Query task by task_id string or integer DB id
    task = None
    if request.task_id.isdigit():
        task = db.query(MaintenanceTask).filter(MaintenanceTask.id == int(request.task_id)).first()
    if not task:
        task = db.query(MaintenanceTask).filter(MaintenanceTask.task_id == request.task_id).first()

    # Query block window by window_code or integer DB id
    window = None
    if request.block_window_id.isdigit():
        window = db.query(BlockWindow).filter(BlockWindow.id == int(request.block_window_id)).first()
    if not window:
        window = db.query(BlockWindow).filter(BlockWindow.window_code == request.block_window_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Maintenance task '{request.task_id}' not found.")
    if not window:
        raise HTTPException(status_code=404, detail=f"Block window '{request.block_window_id}' not found.")

    result = constraint_engine.check_candidate(task, window, db, request.context)
    return result

@router.post("/compatibility")
def check_tasks_compatibility(request: CompatibilityCheckRequest, db: Session = Depends(get_db)):
    tasks = db.query(MaintenanceTask).filter(MaintenanceTask.task_id.in_(request.task_ids)).all()
    window = db.query(BlockWindow).filter(BlockWindow.window_code == request.block_window_id).first()

    if not window:
        raise HTTPException(status_code=404, detail=f"Block window '{request.block_window_id}' not found.")

    result = compatibility_evaluator.evaluate_tasks_compatibility(tasks, window, db, request.context)
    return result

@router.get("/candidate-windows/{task_id}")
def generate_candidate_windows(task_id: str, corridor: Optional[str] = None, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Maintenance task '{task_id}' not found.")

    windows = candidate_window_generator.generate_candidate_windows(task, db, corridor_filter=corridor)
    return {"success": True, "data": windows}
