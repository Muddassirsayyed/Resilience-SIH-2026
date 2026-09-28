from app.ml.predictor import predict_priority

def calculate_priority(task):
    score = 50  # Base score
    reason_parts = []
    
    if task.get("criticality") == "CRITICAL":
        score += 30
        reason_parts.append("Critical defect")
    elif task.get("criticality") == "HIGH":
        score += 20
        reason_parts.append("High priority defect")
        
    if task.get("overdue"):
        score += 15
        reason_parts.append("overdue")
        
    if task.get("urgency") == "HIGH":
        score += 5
        reason_parts.append("high urgency")

    # Determine final recommendation priority level based on rule score
    if score >= 80:
        rule_priority = "CRITICAL"
    elif score >= 65:
        rule_priority = "HIGH"
    elif score >= 55:
        rule_priority = "MEDIUM"
    else:
        rule_priority = "LOW"
        
    reason = " + ".join(reason_parts).capitalize() + " affecting operations."
    if not reason_parts:
        reason = "Routine maintenance task."
        
    # --- ML INTEGRATION (Advisory Hybrid Layer) ---
    ml_result = predict_priority(task)
    
    final_priority = rule_priority
    ml_confidence = None
    agreement = True
    
    if ml_result.get("ml_enabled"):
        ml_priority = ml_result["priority_class"]
        ml_confidence = ml_result["confidence"]
        agreement = (ml_priority == rule_priority)
        
        # Advisory Override Logic: 
        # ML can boost priority, but cannot downgrade a rule-based CRITICAL task (Safety constraint)
        if rule_priority == "CRITICAL" and ml_priority != "CRITICAL":
            final_priority = "CRITICAL"
        else:
            final_priority = ml_priority
            
        reason = ml_result["reason"]
        
    recommendation = f"AI recommends prioritizing this {final_priority.lower()} task in the next available maintenance block."
    
    return {
        "task_id": task["task_id"],
        "priority": final_priority,  # Final decision (Hybrid)
        "score": min(score, 100),
        "reason": reason,
        "recommendation": recommendation,
        "rule_engine_priority": rule_priority,
        "ml_priority": ml_result.get("priority_class") if ml_result.get("ml_enabled") else None,
        "ml_confidence": ml_confidence,
        "agreement": agreement,
        "task_data": task
    }

def prioritize_tasks(tasks):
    prioritized = []
    for t in tasks:
        prioritized.append(calculate_priority(t))
    # Sort descending by score
    prioritized.sort(key=lambda x: x["score"], reverse=True)
    return prioritized
