def normalize_maintenance(record):
    dept_map = {
        "TMS": "Engineering",
        "SMMS": "S&T",
        "TDMS": "Traction"
    }
    
    return {
        "source": record["source"],
        "task_id": record["defect_id"],
        "asset_id": record["asset_id"],
        "asset_type": record["asset_type"],
        "section": record["section"],
        "department": dept_map.get(record["source"], "Unknown"),
        "defect_type": record["defect_type"],
        "criticality": record["criticality"],
        "urgency": record.get("urgency", "NORMAL"),
        "overdue": record.get("overdue", False),
        "estimated_duration_minutes": record["estimated_duration_minutes"],
        "block_required": record["block_required"],
        "status": "OPEN"
    }

def normalize_train(record):
    return {
        "source": record["source"],
        "train_number": record["train_number"],
        "section": record["section"],
        "corridor": record["section"],  # Map section to corridor for simple demo
        "direction": record["direction"],
        "scheduled_time": record.get("scheduled_arrival", ""),
        "status": record["status"]
    }

def normalize_block_window(record):
    return {
        "source": record["source"],
        "corridor": record["corridor"],
        "start_time": record["start_time"],
        "end_time": record["end_time"],
        "duration_minutes": record["duration_minutes"],
        "maintenance_allowed": record["maintenance_allowed"]
    }
