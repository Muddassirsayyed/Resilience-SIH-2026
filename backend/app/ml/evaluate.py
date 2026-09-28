import pandas as pd
import os
from sklearn.metrics import classification_report
from app.ml.predictor import predict_priority
from app.ai.priority_engine import calculate_priority

def evaluate_and_compare():
    data_path = os.path.join(os.path.dirname(__file__), "data", "maintenance_dataset.csv")
    if not os.path.exists(data_path):
        print("Dataset not found.")
        return
        
    df = pd.read_csv(data_path)
    # Take a sample for comparison
    sample = df.sample(50, random_state=42)
    
    agreements = 0
    disagreements = []
    
    print("\n--- ML vs Rule Engine Comparison ---\n")
    
    for _, row in sample.iterrows():
        # Reconstruct integration task dict
        task = {
            "task_id": row["task_id"],
            "department": row["department"],
            "criticality": row["criticality"],
            "urgency": row["urgency"],
            "condition": row["asset_condition"],
            "overdue": bool(row["overdue"]),
            "overdue_days": row["overdue_days"],
            "failure_history": row["failure_history"],
            "estimated_duration_minutes": row["estimated_duration_hours"] * 60,
            "safety_critical": bool(row["safety_critical"]),
            "passenger_impact": row["passenger_impact"]
        }
        
        result = calculate_priority(task)
        
        is_agree = result.get("agreement", False)
        if is_agree:
            agreements += 1
        else:
            disagreements.append({
                "task_id": task["task_id"],
                "rule_engine_priority": result.get("rule_engine_priority"),
                "ml_priority": result.get("ml_priority"),
                "ml_confidence": result.get("ml_confidence"),
                "final_decision": result.get("priority")
            })
            
    print(f"Total Sample Size: {len(sample)}")
    print(f"Agreements: {agreements}")
    print(f"Disagreements: {len(disagreements)}")
    print(f"Agreement Percentage: {(agreements / len(sample)) * 100:.1f}%\n")
    
    if disagreements:
        print("--- Disagreement Examples ---")
        for i, d in enumerate(disagreements[:5]):
            print(f"Task: {d['task_id']}")
            print(f"  Rule Engine : {d['rule_engine_priority']}")
            print(f"  ML Model    : {d['ml_priority']} (Confidence: {d['ml_confidence']:.2f})")
            print(f"  Final Output: {d['final_decision']}")
            print("-" * 30)

if __name__ == "__main__":
    evaluate_and_compare()
