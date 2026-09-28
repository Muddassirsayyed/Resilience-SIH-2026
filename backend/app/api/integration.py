from fastapi import APIRouter
import logging
from typing import Dict, Any

from app.integration.tms import get_tms_data
from app.integration.smms import get_smms_data
from app.integration.tdms import get_tdms_data
from app.integration.coa import get_coa_trains, get_coa_block_windows
from app.integration.validator import validate_maintenance_record, validate_train_record, validate_block_window_record
from app.integration.normalizer import normalize_maintenance, normalize_train, normalize_block_window

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integration")

def process_source(data, validator_fn, normalizer_fn, source_name):
    valid_records = []
    logger.info(f"[{source_name}] records loaded: {len(data)}")
    for record in data:
        is_valid, error = validator_fn(record)
        if is_valid:
            valid_records.append(normalizer_fn(record))
        else:
            logger.error(f"[{source_name}] Validation failed for record: {error}")
    
    logger.info(f"[{source_name}] Validation complete: {len(valid_records)} valid records.")
    logger.info(f"[{source_name}] Normalization complete.")
    return valid_records

@router.get("/status")
def get_integration_status():
    tms_data = get_tms_data()
    smms_data = get_smms_data()
    tdms_data = get_tdms_data()
    coa_data = get_coa_trains() + get_coa_block_windows()

    return {
        "success": True,
        "message": "Integration status retrieved. DEMO / SIMULATED DATA",
        "sources": [
            {
                "name": "TMS",
                "status": "CONNECTED",
                "last_sync": "Just now",
                "records": len(tms_data)
            },
            {
                "name": "SMMS",
                "status": "CONNECTED",
                "last_sync": "Just now",
                "records": len(smms_data)
            },
            {
                "name": "TDMS",
                "status": "CONNECTED",
                "last_sync": "Just now",
                "records": len(tdms_data)
            },
            {
                "name": "COA",
                "status": "CONNECTED",
                "last_sync": "Just now",
                "records": len(coa_data)
            }
        ]
    }

@router.get("/tms")
def get_tms():
    data = get_tms_data()
    return {"success": True, "data": process_source(data, validate_maintenance_record, normalize_maintenance, "TMS")}

@router.get("/smms")
def get_smms():
    data = get_smms_data()
    return {"success": True, "data": process_source(data, validate_maintenance_record, normalize_maintenance, "SMMS")}

@router.get("/tdms")
def get_tdms():
    data = get_tdms_data()
    return {"success": True, "data": process_source(data, validate_maintenance_record, normalize_maintenance, "TDMS")}

@router.get("/coa")
def get_coa():
    trains = get_coa_trains()
    windows = get_coa_block_windows()
    
    valid_trains = process_source(trains, validate_train_record, normalize_train, "COA-Trains")
    valid_windows = process_source(windows, validate_block_window_record, normalize_block_window, "COA-Windows")
    
    return {"success": True, "data": {"trains": valid_trains, "block_windows": valid_windows}}

@router.get("/maintenance")
def get_integration_maintenance():
    maint_data = []
    maint_data.extend(process_source(get_tms_data(), validate_maintenance_record, normalize_maintenance, "TMS"))
    maint_data.extend(process_source(get_smms_data(), validate_maintenance_record, normalize_maintenance, "SMMS"))
    maint_data.extend(process_source(get_tdms_data(), validate_maintenance_record, normalize_maintenance, "TDMS"))
    return {"success": True, "data": maint_data}

@router.get("/trains")
def get_integration_trains():
    return {"success": True, "data": process_source(get_coa_trains(), validate_train_record, normalize_train, "COA-Trains")}

@router.get("/block-windows")
def get_integration_block_windows():
    return {"success": True, "data": process_source(get_coa_block_windows(), validate_block_window_record, normalize_block_window, "COA-Windows")}

@router.get("/all")
def get_all():
    maint_data = []
    maint_data.extend(process_source(get_tms_data(), validate_maintenance_record, normalize_maintenance, "TMS"))
    maint_data.extend(process_source(get_smms_data(), validate_maintenance_record, normalize_maintenance, "SMMS"))
    maint_data.extend(process_source(get_tdms_data(), validate_maintenance_record, normalize_maintenance, "TDMS"))
    
    trains = process_source(get_coa_trains(), validate_train_record, normalize_train, "COA-Trains")
    windows = process_source(get_coa_block_windows(), validate_block_window_record, normalize_block_window, "COA-Windows")
    
    return {
        "success": True,
        "data": {
            "maintenance_tasks": maint_data,
            "trains": trains,
            "block_windows": windows,
            "sources": {
                "TMS": "CONNECTED",
                "SMMS": "CONNECTED",
                "TDMS": "CONNECTED",
                "COA": "CONNECTED"
            }
        }
    }
