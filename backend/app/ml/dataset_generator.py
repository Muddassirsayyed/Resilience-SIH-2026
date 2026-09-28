import pandas as pd
import numpy as np
import random
import os

def generate_synthetic_maintenance_data(num_records=5000):
    np.random.seed(42)
    random.seed(42)

    departments = ["Engineering", "S&T", "Traction"]
    criticalities = ["ROUTINE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
    urgencies = ["NORMAL", "MEDIUM", "HIGH", "IMMEDIATE"]
    asset_conditions = ["GOOD", "FAIR", "DEGRADED", "POOR", "FAILED"]

    data = []
    
    for i in range(num_records):
        dept = random.choice(departments)
        
        # Add some natural correlation: Failed assets are more likely to be critical/immediate
        cond = random.choice(asset_conditions)
        
        if cond in ["FAILED", "POOR"]:
            crit = np.random.choice(["HIGH", "CRITICAL"], p=[0.4, 0.6])
            urg = np.random.choice(["HIGH", "IMMEDIATE"], p=[0.5, 0.5])
        elif cond == "DEGRADED":
            crit = np.random.choice(["MEDIUM", "HIGH"], p=[0.6, 0.4])
            urg = np.random.choice(["MEDIUM", "HIGH"], p=[0.7, 0.3])
        else:
            crit = np.random.choice(["ROUTINE", "LOW", "MEDIUM"], p=[0.5, 0.3, 0.2])
            urg = np.random.choice(["NORMAL", "MEDIUM"], p=[0.8, 0.2])
            
        overdue_days = max(0, int(np.random.normal(0, 15)))
        overdue = overdue_days > 0
        failure_history = np.random.poisson(1.5)
        duration_hrs = round(random.uniform(0.5, 8.0), 1)
        safety_critical = 1 if crit in ["HIGH", "CRITICAL"] or (dept == "S&T" and cond in ["DEGRADED", "POOR", "FAILED"]) else 0
        passenger_impact = np.random.choice([0, 1], p=[0.3, 0.7])
        
        # Calculate transparent rule-based score for labeling
        score = 20  # base
        
        if crit == "CRITICAL": score += 30
        elif crit == "HIGH": score += 20
        elif crit == "MEDIUM": score += 10
        
        if urg == "IMMEDIATE": score += 25
        elif urg == "HIGH": score += 15
        elif urg == "MEDIUM": score += 5
        
        if overdue:
            score += min(overdue_days * 1.5, 20)
            
        if safety_critical:
            score += 15
            
        if cond == "FAILED": score += 15
        elif cond == "POOR": score += 10
        
        score += min(failure_history * 2, 10)
        
        # Add some noise to the score to make ML learn patterns rather than exact formula
        score += np.random.normal(0, 5)
        score = max(0, min(100, score))
        
        # Labeling
        if score >= 80:
            label = "CRITICAL"
        elif score >= 65:
            label = "HIGH"
        elif score >= 45:
            label = "MEDIUM"
        else:
            label = "LOW"
            
        data.append({
            "task_id": f"TASK-{1000+i}",
            "department": dept,
            "criticality": crit,
            "urgency": urg,
            "asset_condition": cond,
            "overdue": overdue,
            "overdue_days": overdue_days,
            "failure_history": failure_history,
            "estimated_duration_hours": duration_hrs,
            "safety_critical": safety_critical,
            "passenger_impact": passenger_impact,
            "priority_score": score,
            "maintenance_priority_class": label
        })
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(__file__) + "/data", exist_ok=True)
    file_path = os.path.dirname(__file__) + "/data/maintenance_dataset.csv"
    df.to_csv(file_path, index=False)
    print(f"Generated {num_records} records to {file_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_maintenance_data()
