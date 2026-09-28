def get_smms_data():
    return [
        {
            "source": "SMMS",
            "asset_id": "SIG-KNP-07",
            "section": "KNP-07",
            "asset_type": "SIGNAL",
            "defect_id": "DEF-S-2041",
            "defect_type": "SIGNAL_INSPECTION",
            "criticality": "HIGH",
            "condition": "DEGRADED",
            "urgency": "HIGH",
            "estimated_duration_minutes": 60,
            "block_required": True
        },
        {
            "source": "SMMS",
            "asset_id": "SIG-KNP-04",
            "section": "KNP-04",
            "asset_type": "SIGNAL",
            "defect_id": "DEF-S-2042",
            "defect_type": "POINT_MACHINE",
            "criticality": "MEDIUM",
            "condition": "NEEDS_MAINTENANCE",
            "urgency": "MEDIUM",
            "estimated_duration_minutes": 90,
            "block_required": False
        }
    ]
