from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

from app.ml.predictor import predict_priority
from app.ai.priority_engine import calculate_priority

router = APIRouter(prefix="/api/ml")

class TaskRequest(BaseModel):
    task: Dict[str, Any]

@router.post("/predict-priority")
def predict_priority_api(request: TaskRequest):
    # We call calculate_priority to get the full hybrid comparison
    result = calculate_priority(request.task)
    
    # Structure response to clearly show ML vs Rule Engine
    return {
        "success": True,
        "data": {
            "task_id": result["task_id"],
            "final_priority": result["priority"],
            "reason": result["reason"],
            "ml_enabled": result["ml_priority"] is not None,
            "rule_engine_priority": result["rule_engine_priority"],
            "ml_priority": result["ml_priority"],
            "ml_confidence": result["ml_confidence"],
            "agreement": result["agreement"]
        }
    }
