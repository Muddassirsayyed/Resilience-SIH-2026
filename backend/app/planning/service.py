from app.integration.tms import get_tms_data
from app.integration.smms import get_smms_data
from app.integration.tdms import get_tdms_data
from app.integration.coa import get_coa_trains, get_coa_block_windows
from app.integration.validator import validate_maintenance_record, validate_train_record, validate_block_window_record
from app.integration.normalizer import normalize_maintenance, normalize_train, normalize_block_window

from app.ai.priority_engine import prioritize_tasks
from app.optimizer.block_optimizer import optimize_blocks
from app.optimizer.conflict_detector import detect_conflicts

def process_source(data, validator_fn, normalizer_fn):
    valid_records = []
    for record in data:
        is_valid, _ = validator_fn(record)
        if is_valid:
            valid_records.append(normalizer_fn(record))
    return valid_records

def generate_planning_result(corridor_filter=None):
    # 1-4. Fetch data
    tms_raw = get_tms_data()
    smms_raw = get_smms_data()
    tdms_raw = get_tdms_data()
    coa_trains_raw = get_coa_trains()
    coa_windows_raw = get_coa_block_windows()
    
    # 5-6. Normalize & Validate
    maint_tasks = []
    maint_tasks.extend(process_source(tms_raw, validate_maintenance_record, normalize_maintenance))
    maint_tasks.extend(process_source(smms_raw, validate_maintenance_record, normalize_maintenance))
    maint_tasks.extend(process_source(tdms_raw, validate_maintenance_record, normalize_maintenance))
    
    trains = process_source(coa_trains_raw, validate_train_record, normalize_train)
    windows = process_source(coa_windows_raw, validate_block_window_record, normalize_block_window)
    
    if corridor_filter:
        maint_tasks = [t for t in maint_tasks if t.get("section") == corridor_filter]
        trains = [t for t in trains if t.get("corridor") == corridor_filter]
        windows = [w for w in windows if w.get("corridor") == corridor_filter]

    # 10. Priority Engine
    prioritized_tasks = prioritize_tasks(maint_tasks)
    
    # 11. Block Optimizer
    recommendations = optimize_blocks(prioritized_tasks, windows)
    
    # 12. Conflict Detection
    all_conflicts = detect_conflicts(recommendations, trains)
    
    # 13. Unified Result
    tasks_analyzed = len(prioritized_tasks)
    critical_count = sum(1 for t in prioritized_tasks if t["priority"] == "CRITICAL")
    high_count = sum(1 for t in prioritized_tasks if t["priority"] == "HIGH")
    medium_count = sum(1 for t in prioritized_tasks if t["priority"] == "MEDIUM")
    low_count = sum(1 for t in prioritized_tasks if t["priority"] == "LOW")
    
    overdue_count = sum(1 for t in maint_tasks if t.get("overdue"))
    
    combined_tasks_count = sum(len(r["task_ids"]) for r in recommendations)
    
    summary = {
        "tasks_analyzed": tasks_analyzed,
        "critical": critical_count,
        "high": high_count,
        "medium": medium_count,
        "low": low_count,
        "recommended_blocks": len(recommendations),
        "combined_tasks": combined_tasks_count,
        "train_conflicts": len(all_conflicts),
        "overdue_tasks": overdue_count
    }
    
    # Generate explicit explanations
    recommendation_explanations = []
    for rec in recommendations:
        what_tasks = ", ".join(rec["task_ids"])
        where = rec["corridor"]
        why_parts = []
        for t_id in rec["task_ids"]:
            pt = next((p for p in prioritized_tasks if p["task_id"] == t_id), None)
            if pt:
                why_parts.append(f"{t_id}: {pt['reason']}")
        why = " | ".join(why_parts)
        when = f"{rec['recommended_start']}–{rec['recommended_end']}"
        impact = f"{rec['train_conflicts']} scheduled train movement(s) conflict with this window." if rec['train_conflicts'] > 0 else "No train conflicts."
        
        explanation = {
            "status": rec["status"],
            "corridor": rec["corridor"],
            "recommended_start": rec["recommended_start"],
            "recommended_end": rec["recommended_end"],
            "task_ids": rec["task_ids"],
            "reason": rec["reason"],
            "train_conflicts": rec["train_conflicts"],
            "conflicts_list": rec["conflicts_list"],
            "controller_action_required": rec["controller_action_required"],
            "explanation": {
                "WHAT": what_tasks,
                "WHERE": where,
                "WHY": why,
                "WHEN": when,
                "IMPACT": impact,
                "RECOMMENDATION": "Controller review required. ML analysis complete."
            }
        }
        recommendation_explanations.append(explanation)
        
    return {
        "planning_date": "Today",
        "tasks_analyzed": tasks_analyzed,
        "critical_tasks": critical_count,
        "recommended_blocks": len(recommendations),
        "train_conflicts": len(all_conflicts),
        "recommendations": recommendation_explanations,
        "conflicts": all_conflicts,
        "summary": summary
    }
