def optimize_blocks(prioritized_tasks, block_windows):
    recommendations = []
    
    # We group by corridor
    corridor_tasks = {}
    for pt in prioritized_tasks:
        c = pt["task_data"].get("section")
        if c not in corridor_tasks:
            corridor_tasks[c] = []
        corridor_tasks[c].append(pt)
        
    for window in block_windows:
        corridor = window.get("corridor")
        available_duration = window.get("duration_minutes", 0)
        
        # Check if we have tasks for this corridor
        if corridor in corridor_tasks and corridor_tasks[corridor]:
            tasks_for_corridor = corridor_tasks[corridor]
            
            # Simple combination: pick tasks that fit in parallel (assume parallel work is allowed)
            # or just group them into the same block to reduce repeated access.
            combined_tasks = []
            departments = set()
            max_duration = 0
            
            for pt in list(tasks_for_corridor):
                t_dur = pt["task_data"].get("estimated_duration_minutes", 0)
                if t_dur <= available_duration:
                    combined_tasks.append(pt["task_data"]["task_id"])
                    departments.add(pt["task_data"]["department"])
                    if t_dur > max_duration:
                        max_duration = t_dur
                    tasks_for_corridor.remove(pt)
            
            if combined_tasks:
                reason = f"{len(combined_tasks)} compatible maintenance activities can be completed during the same corridor possession, reducing repeated access and improving asset availability."
                recommendations.append({
                    "status": "CONTROLLER_REVIEW",
                    "corridor": corridor,
                    "task_ids": combined_tasks,
                    "departments": list(departments),
                    "recommended_start": window.get("start_time"),
                    "recommended_end": window.get("end_time"),
                    "block_duration": available_duration,
                    "reason": reason,
                    "controller_action_required": True,
                    "train_conflicts": 0, # Will be updated by conflict detector
                    "conflicts_list": []
                })
                
    return recommendations
