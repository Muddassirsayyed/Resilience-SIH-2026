import pandas as pd
import numpy as np
import os
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score

def train_model():
    data_path = os.path.join(os.path.dirname(__file__), "data", "maintenance_dataset.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Please run dataset_generator.py first.")
        return
        
    df = pd.read_csv(data_path)
    
    # Features and Target
    # Do not include task_id, priority_score (leakage)
    features = [
        "department", "criticality", "urgency", "asset_condition", 
        "overdue", "overdue_days", "failure_history", 
        "estimated_duration_hours", "safety_critical", "passenger_impact"
    ]
    target = "maintenance_priority_class"
    
    X = df[features].copy()
    y = df[target]
    
    # Preprocessing
    numeric_features = ["overdue_days", "failure_history", "estimated_duration_hours"]
    categorical_features = ["department", "criticality", "urgency", "asset_condition"]
    boolean_features = ["overdue", "safety_critical", "passenger_impact"]
    
    # Ensure boolean are treated properly
    for col in boolean_features:
        X[col] = X[col].astype(int)
        
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features + boolean_features),
            ('cat', categorical_transformer, categorical_features)
        ])
        
    # Pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))
    ])
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    
    print(f"Accuracy: {acc:.4f}")
    print(f"Macro F1: {macro_f1:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save Model
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "priority_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")
    
    # Save Metadata
    metadata = {
        "model_name": "maintenance_priority_classifier",
        "version": "v1.0",
        "dataset_size": len(df),
        "features": features,
        "accuracy": acc,
        "macro_f1": macro_f1,
        "trained_on": "synthetic_simulator_data",
        "notice": "Current ML results are based on simulator-generated synthetic data. Production deployment requires historical railway data."
    }
    
    with open(os.path.join(model_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)
        
if __name__ == "__main__":
    train_model()
