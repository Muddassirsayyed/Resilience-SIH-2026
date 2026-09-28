def get_tdms_data():
    return [
        {
            "source": "TDMS",
            "asset_id": "OHE-KNP-03",
            "section": "KNP-03",
            "asset_type": "OHE",
            "defect_id": "DEF-O-3011",
            "defect_type": "OHE_MAINTENANCE",
            "criticality": "HIGH",
            "condition": "MAINTENANCE_DUE",
            "estimated_duration_minutes": 120,
            "block_required": True
        },
        {
            "source": "TDMS",
            "asset_id": "OHE-KNP-04",
            "section": "KNP-04",
            "asset_type": "OHE",
            "defect_id": "DEF-O-3012",
            "defect_type": "OHE_INSPECTION",
            "criticality": "CRITICAL",
            "condition": "MAINTENANCE_DUE",
            "estimated_duration_minutes": 180,
            "block_required": True
        }
    ]
