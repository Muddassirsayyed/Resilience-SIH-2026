from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models import (
    MaintenanceTask, BlockWindow, BlockRequest, Corridor, Asset, Train, Resource, Department
)
from app.schemas.schemas import (
    MaintenanceTaskRead, BlockWindowRead, BlockRequestRead, 
    CorridorRead, AssetRead, TrainRead, ResourceRead
)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "RAILOPT Automatic Block Planning API",
        "environment": "development",
        "database": "CONNECTED"
    }

@router.get("/maintenance-tasks")
def get_maintenance_tasks(db: Session = Depends(get_db)):
    tasks = db.query(MaintenanceTask).all()
    # Format to match API contract expected by frontend/integration layer
    data = []
    for t in tasks:
        dept_code = t.department.code if t.department else "ENGG"
        data.append({
            "id": t.id,
            "task_id": t.task_id,
            "taskName": t.task_type,
            "asset_id": t.asset.asset_code if t.asset else f"AST-{t.id}",
            "sectionId": t.location or "KNP-04",
            "department": dept_code,
            "criticality": t.criticality.value if hasattr(t.criticality, 'value') else str(t.criticality),
            "urgency": t.urgency,
            "overdue": t.overdue,
            "estimated_duration_minutes": t.estimated_duration_minutes,
            "required_crew_count": t.required_crew_count,
            "required_machine_type": t.required_machine_type,
            "status": t.status.value if hasattr(t.status, 'value') else str(t.status),
            "safety_critical": t.safety_critical
        })
    return {"success": True, "data": data, "message": "Tasks retrieved successfully"}

@router.get("/maintenance-tasks/{id}")
def get_maintenance_task(id: int, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "success": True,
        "data": {
            "id": task.id,
            "task_id": task.task_id,
            "task_type": task.task_type,
            "criticality": task.criticality.value if hasattr(task.criticality, 'value') else str(task.criticality),
            "status": task.status.value if hasattr(task.status, 'value') else str(task.status)
        },
        "message": "Task retrieved successfully"
    }

@router.get("/block-windows")
def get_block_windows(db: Session = Depends(get_db)):
    windows = db.query(BlockWindow).all()
    data = []
    for w in windows:
        data.append({
            "id": w.id,
            "window_code": w.window_code,
            "corridor": w.corridor.code if w.corridor else "KNP-04",
            "start_time": w.start_time,
            "end_time": w.end_time,
            "duration_minutes": w.duration_minutes,
            "maintenance_allowed": w.maintenance_allowed,
            "status": w.status.value if hasattr(w.status, 'value') else str(w.status)
        })
    return {"success": True, "data": data, "message": "Block windows retrieved successfully"}

@router.get("/block-requests")
def get_block_requests(db: Session = Depends(get_db)):
    requests = db.query(BlockRequest).all()
    data = []
    for r in requests:
        data.append({
            "id": r.id,
            "request_id": r.request_id,
            "task_id": r.task_id,
            "requested_duration_minutes": r.requested_duration_minutes,
            "block_type": r.block_type,
            "power_block_required": r.power_block_required,
            "signal_disconnection_required": r.signal_disconnection_required,
            "status": r.status.value if hasattr(r.status, 'value') else str(r.status),
            "priority": r.priority
        })
    return {"success": True, "data": data, "message": "Block requests retrieved successfully"}

@router.get("/block-plans")
def get_block_plans(db: Session = Depends(get_db)):
    # Simple placeholder returning allocated block windows from DB
    windows = db.query(BlockWindow).all()
    data = []
    for w in windows:
        data.append({
            "id": w.id,
            "windowCode": w.window_code,
            "corridor": w.corridor.code if w.corridor else "KNP-04",
            "time": f"{w.start_time}-{w.end_time}",
            "status": "APPROVED"
        })
    return {"success": True, "data": data, "message": "Block plans retrieved successfully"}

@router.get("/corridors")
def get_corridors(db: Session = Depends(get_db)):
    corridors = db.query(Corridor).all()
    data = []
    for c in corridors:
        data.append({
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "from_station": c.from_station,
            "to_station": c.to_station,
            "distance_km": c.distance_km,
            "max_speed_kmph": c.max_speed_kmph
        })
    return {"success": True, "data": data, "message": "Corridors retrieved successfully"}

@router.get("/assets")
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    data = []
    for a in assets:
        data.append({
            "id": a.id,
            "asset_code": a.asset_code,
            "asset_type": a.asset_type,
            "location": a.location,
            "condition": a.condition,
            "line_number": a.line_number
        })
    return {"success": True, "data": data, "message": "Assets retrieved successfully"}

@router.get("/trains")
def get_trains(db: Session = Depends(get_db)):
    trains = db.query(Train).all()
    data = []
    for tr in trains:
        data.append({
            "id": tr.id,
            "train_number": tr.train_number,
            "name": tr.name,
            "train_type": tr.train_type.value if hasattr(tr.train_type, 'value') else str(tr.train_type),
            "priority": tr.priority,
            "origin": tr.origin,
            "destination": tr.destination
        })
    return {"success": True, "data": data, "message": "Trains retrieved successfully"}

@router.get("/resources")
def get_resources(db: Session = Depends(get_db)):
    resources = db.query(Resource).all()
    data = []
    for r in resources:
        data.append({
            "id": r.id,
            "resource_code": r.resource_code,
            "name": r.name,
            "type": r.type.value if hasattr(r.type, 'value') else str(r.type),
            "status": r.status.value if hasattr(r.status, 'value') else str(r.status),
            "current_location": r.current_location,
            "capacity": r.capacity
        })
    return {"success": True, "data": data, "message": "Resources retrieved successfully"}

@router.get("/conflicts")
def get_conflicts():
    return {"success": True, "data": [], "message": "Conflicts retrieved successfully"}
