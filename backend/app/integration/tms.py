import logging

def get_tms_data():
    return [
        {
            "source": "TMS",
            "asset_id": "TRK-KNP-04",
            "section": "KNP-04",
            "asset_type": "TRACK",
            "defect_id": "DEF-T-1042",
            "defect_type": "TRACK_GEOMETRY",
            "criticality": "CRITICAL",
            "condition": "DEGRADED",
            "overdue": True,
            "estimated_duration_minutes": 120,
            "block_required": True
        },
        {
            "source": "TMS",
            "asset_id": "TRK-KNP-02",
            "section": "KNP-02",
            "asset_type": "TRACK",
            "defect_id": "DEF-T-1043",
            "defect_type": "RAIL_FRACTURE",
            "criticality": "HIGH",
            "condition": "REQUIRES_ATTENTION",
            "overdue": False,
            "estimated_duration_minutes": 60,
            "block_required": True
        }
    ]
