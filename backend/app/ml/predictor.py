import os
import joblib
import pandas as pd
import json

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "priority_model.joblib")
METADATA_PATH = os.path.join(os.path.dirname(__file__), "model", "metadata.json")

_pipeline = None
_metadata = None

def load_model():
    global _pipeline, _metadata
    if _pipeline is None and os.path.exists(MODEL_PATH):
        _pipeline = joblib.load(MODEL_PATH)
    if _metadata is None and os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r") as f:
            _metadata = json.load(f)
    return _pipeline is not None

def predict_priority(task: dict):
    if not load_model():
        return {"ml_enabled": False, "error": "Model not loaded"}
        
    # Map integration layer format to model features
    df = pd.DataFrame([{
        "department": task.get("department", "Engineering"),
        "criticality": task.get("criticality", "MEDIUM"),
        "urgency": task.get("urgency", "NORMAL"),
        "asset_condition": task.get("condition", "FAIR"),
        "overdue": 1 if task.get("overdue", False) else 0,
        "overdue_days": int(task.get("overdue_days", 5 if task.get("overdue") else 0)),
        "failure_history": int(task.get("failure_history", 0)),
        "estimated_duration_hours": float(task.get("estimated_duration_minutes", 120)) / 60,
        "safety_critical": 1 if task.get("safety_critical", False) or task.get("criticality") in ["HIGH", "CRITICAL"] else 0,
        "passenger_impact": int(task.get("passenger_impact", 1))
    }])
    
    try:
        pred_class = _pipeline.predict(df)[0]
        probas = _pipeline.predict_proba(df)[0]
        classes = _pipeline.classes_
        confidence = float(probas[list(classes).index(pred_class)])
        
        # Human readable reason
        reason_parts = []
        if df.iloc[0]["safety_critical"] == 1: reason_parts.append("safety-critical")
        if df.iloc[0]["overdue"] == 1: reason_parts.append("overdue")
        if df.iloc[0]["failure_history"] > 1: reason_parts.append("has elevated failure history")
        
        reason = "High priority because the task is " + ", ".join(reason_parts) if reason_parts else "Routine maintenance task."
        if not reason_parts:
            reason = "Standard maintenance parameters."
            
        return {
            "ml_enabled": True,
            "priority_class": pred_class,
            "confidence": round(confidence, 2),
            "reason": reason,
            "model_version": _metadata.get("version", "v1.0")
        }
    except Exception as e:
        return {"ml_enabled": False, "error": str(e)}
