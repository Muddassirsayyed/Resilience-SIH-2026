from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import datetime

from app.planning.service import generate_planning_result

router = APIRouter(prefix="/api/planning")

class PlanningRequest(BaseModel):
    planning_date: Optional[str] = None
    corridor: Optional[str] = None

@router.post("/generate")
def generate_planning(request: PlanningRequest):
    result = generate_planning_result(corridor_filter=request.corridor)
    if request.planning_date:
        result["planning_date"] = request.planning_date
    else:
        result["planning_date"] = datetime.datetime.now().strftime("%Y-%m-%d")
        
    return {
        "success": True,
        "data": result
    }
