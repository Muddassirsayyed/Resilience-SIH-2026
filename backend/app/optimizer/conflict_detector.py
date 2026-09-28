def time_to_minutes(time_str):
    if not time_str:
        return 0
    parts = time_str.split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    return 0

def detect_conflicts(recommendations, trains):
    conflicts = []
    conflict_id_counter = 101
    
    for rec in recommendations:
        block_start = time_to_minutes(rec["recommended_start"])
        block_end = time_to_minutes(rec["recommended_end"])
        
        # Handle overnight blocks like 22:00 to 03:00
        is_overnight = block_end < block_start
        
        for train in trains:
            if train.get("corridor") == rec["corridor"] or train.get("section") == rec["corridor"]:
                train_time = time_to_minutes(train.get("scheduled_time", "00:00"))
                
                conflict_found = False
                if is_overnight:
                    # e.g., 22:00 to 03:00 (1320 to 180). Train at 22:35 (1355) or 01:20 (80)
                    if train_time >= block_start or train_time <= block_end:
                        conflict_found = True
                else:
                    if block_start <= train_time <= block_end:
                        conflict_found = True
                        
                if conflict_found:
                    conflict = {
                        "conflict_id": f"CR-{conflict_id_counter}",
                        "train_number": train.get("train_number"),
                        "section": rec["corridor"],
                        "train_time": train.get("scheduled_time"),
                        "block_start": rec["recommended_start"],
                        "block_end": rec["recommended_end"],
                        "severity": "HIGH",
                        "reason": f"Train movement overlaps with proposed maintenance block window."
                    }
                    conflicts.append(conflict)
                    rec["conflicts_list"].append(conflict)
                    rec["train_conflicts"] += 1
                    conflict_id_counter += 1
                    
    return conflicts
