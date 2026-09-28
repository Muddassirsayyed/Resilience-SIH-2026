import logging

logger = logging.getLogger(__name__)

def validate_maintenance_record(record):
    required_fields = ["source", "asset_id", "asset_type", "section", "defect_id", "defect_type", "criticality", "estimated_duration_minutes", "block_required"]
    for field in required_fields:
        if field not in record:
            return False, f"Missing required field: {field}"
    
    if record["estimated_duration_minutes"] <= 0:
        return False, "estimated_duration_minutes must be greater than 0"
        
    valid_sources = ["TMS", "SMMS", "TDMS"]
    if record["source"] not in valid_sources:
        return False, f"Invalid source: {record['source']}"
        
    return True, None

def validate_train_record(record):
    required_fields = ["source", "train_number", "section", "direction", "status"]
    for field in required_fields:
        if field not in record:
            return False, f"Missing required field: {field}"
            
    if record["source"] != "COA":
        return False, f"Invalid source: {record['source']}"
        
    return True, None

def validate_block_window_record(record):
    required_fields = ["source", "corridor", "start_time", "end_time", "duration_minutes", "maintenance_allowed"]
    for field in required_fields:
        if field not in record:
            return False, f"Missing required field: {field}"
            
    if record["source"] != "COA":
        return False, f"Invalid source: {record['source']}"
        
    if record["duration_minutes"] <= 0:
        return False, "duration_minutes must be greater than 0"
        
    return True, None
