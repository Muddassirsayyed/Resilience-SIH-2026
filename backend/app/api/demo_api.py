"""
RAILOPT Demo API — All endpoints with in-memory state and realistic Indian Railways demo data.
No database required. State resets on server restart.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import datetime, copy, random, uuid

router = APIRouter(prefix="/api")

# ============================================================
# DEMO SEED DATA
# ============================================================

_tasks = [
    {"id": 1, "task_id": "MT-2024-001", "asset_id": "TRK-CR-BH-001", "asset_type": "Track", "department": "ENGG",
     "location": "Bhusawal–Malegaon (KM 347+200)", "zone": "CR", "division": "Bhusawal",
     "criticality": "HIGH", "safety_critical": True, "overdue": True, "estimated_duration": 240,
     "crew_required": 12, "machine_required": "Tamping Machine", "status": "PENDING",
     "risk_score": 87, "notes": "Rail fracture reported. Immediate attention required.", "preferred_date": "2024-09-17"},

    {"id": 2, "task_id": "MT-2024-002", "asset_id": "OHE-WR-VL-009", "asset_type": "OHE Wire",
     "department": "TRACTION", "location": "Vadodara–Anand (KM 112+450)", "zone": "WR", "division": "Vadodara",
     "criticality": "HIGH", "safety_critical": True, "overdue": False, "estimated_duration": 180,
     "crew_required": 8, "machine_required": "Tower Wagon", "status": "SCHEDULED",
     "risk_score": 79, "notes": "OHE wire sagging detected during patrol. Replace section.", "preferred_date": "2024-09-17"},

    {"id": 3, "task_id": "MT-2024-003", "asset_id": "SIG-NR-MB-022", "asset_type": "Signal",
     "department": "SIG", "location": "Moradabad–Rampur (KM 78+800)", "zone": "NR", "division": "Moradabad",
     "criticality": "MEDIUM", "safety_critical": True, "overdue": False, "estimated_duration": 120,
     "crew_required": 4, "machine_required": "Signal Test Equipment", "status": "PENDING",
     "risk_score": 65, "notes": "Interlocking relay failure. Signal showing wrong aspect.", "preferred_date": "2024-09-18"},

    {"id": 4, "task_id": "MT-2024-004", "asset_id": "BRG-SR-CBE-007", "asset_type": "Bridge",
     "department": "ENGG", "location": "Coimbatore–Erode (KM 203+100)", "zone": "SR", "division": "Salem",
     "criticality": "HIGH", "safety_critical": True, "overdue": True, "estimated_duration": 360,
     "crew_required": 16, "machine_required": "Crane", "status": "PENDING",
     "risk_score": 91, "notes": "Bridge girder crack detected during inspection. Safety-critical repair.", "preferred_date": "2024-09-17"},

    {"id": 5, "task_id": "MT-2024-005", "asset_id": "TRK-ER-HWH-034", "asset_type": "Track",
     "department": "ENGG", "location": "Howrah–Burdwan (KM 89+750)", "zone": "ER", "division": "Howrah",
     "criticality": "MEDIUM", "safety_critical": False, "overdue": False, "estimated_duration": 150,
     "crew_required": 6, "machine_required": "Track Geometry Car", "status": "IN_PROGRESS",
     "risk_score": 52, "notes": "Rail profile wear beyond permissible limits. Grinding required.", "preferred_date": "2024-09-18"},

    {"id": 6, "task_id": "MT-2024-006", "asset_id": "TRD-SCR-SC-011", "asset_type": "Traction Substation",
     "department": "TRACTION", "location": "Secunderabad–Kazipet (KM 145+300)", "zone": "SCR", "division": "Hyderabad",
     "criticality": "HIGH", "safety_critical": True, "overdue": False, "estimated_duration": 210,
     "crew_required": 6, "machine_required": "Insulation Tester", "status": "PENDING",
     "risk_score": 73, "notes": "Transformer oil leakage at traction substation.", "preferred_date": "2024-09-19"},

    {"id": 7, "task_id": "MT-2024-007", "asset_id": "SIG-SWR-BNG-055", "asset_type": "Point Machine",
     "department": "SIG", "location": "Bangalore–Tumkur (KM 22+600)", "zone": "SWR", "division": "Bangalore",
     "criticality": "MEDIUM", "safety_critical": False, "overdue": True, "estimated_duration": 90,
     "crew_required": 3, "machine_required": "Point Lubrication Kit", "status": "PENDING",
     "risk_score": 58, "notes": "Point machine sluggish operation. Lubrication and adjustment needed.", "preferred_date": "2024-09-17"},

    {"id": 8, "task_id": "MT-2024-008", "asset_id": "TRK-NCR-CNB-018", "asset_type": "Track",
     "department": "ENGG", "location": "Kanpur–Fatehpur (KM 67+400)", "zone": "NCR", "division": "Prayagraj",
     "criticality": "LOW", "safety_critical": False, "overdue": False, "estimated_duration": 120,
     "crew_required": 8, "machine_required": "Tamping Machine", "status": "SCHEDULED",
     "risk_score": 38, "notes": "Routine tamping as per schedule.", "preferred_date": "2024-09-20"},

    {"id": 9, "task_id": "MT-2024-009", "asset_id": "OHE-NWR-JP-003", "asset_type": "OHE Mast",
     "department": "TRACTION", "location": "Jaipur–Ajmer (KM 134+200)", "zone": "NWR", "division": "Jaipur",
     "criticality": "MEDIUM", "safety_critical": True, "overdue": False, "estimated_duration": 150,
     "crew_required": 5, "machine_required": "Tower Wagon", "status": "PENDING",
     "risk_score": 66, "notes": "OHE mast tilting. Needs straightening and foundation check.", "preferred_date": "2024-09-18"},

    {"id": 10, "task_id": "MT-2024-010", "asset_id": "BRG-NFR-GHY-002", "asset_type": "Bridge",
     "department": "ENGG", "location": "Guwahati–New Bongaigaon (KM 45+100)", "zone": "NFR", "division": "Katihar",
     "criticality": "HIGH", "safety_critical": True, "overdue": True, "estimated_duration": 480,
     "crew_required": 20, "machine_required": "Crane + Welding Unit", "status": "PENDING",
     "risk_score": 94, "notes": "Flood-damaged bridge pier. Temporary restriction imposed.", "preferred_date": "2024-09-17"},

    {"id": 11, "task_id": "MT-2024-011", "asset_id": "TRK-WCR-JBP-009", "asset_type": "Track",
     "department": "ENGG", "location": "Jabalpur–Katni (KM 88+550)", "zone": "WCR", "division": "Jabalpur",
     "criticality": "MEDIUM", "safety_critical": False, "overdue": False, "estimated_duration": 180,
     "crew_required": 10, "machine_required": "Ballast Cleaning Machine", "status": "COMPLETED",
     "risk_score": 41, "notes": "Ballast renewal complete.", "preferred_date": "2024-09-15"},

    {"id": 12, "task_id": "MT-2024-012", "asset_id": "SIG-SECR-BSP-017", "asset_type": "Level Crossing Gate",
     "department": "SIG", "location": "Bilaspur–Raipur (KM 56+800)", "zone": "SECR", "division": "Bilaspur",
     "criticality": "HIGH", "safety_critical": True, "overdue": False, "estimated_duration": 120,
     "crew_required": 4, "machine_required": "LC Gate Equipment", "status": "PENDING",
     "risk_score": 76, "notes": "LC gate motor failure. Manual operation in progress.", "preferred_date": "2024-09-17"},

    {"id": 13, "task_id": "MT-2024-013", "asset_id": "TRK-ECR-DNR-024", "asset_type": "Track",
     "department": "ENGG", "location": "Danapur–Ara (KM 23+300)", "zone": "ECR", "division": "Danapur",
     "criticality": "LOW", "safety_critical": False, "overdue": False, "estimated_duration": 90,
     "crew_required": 6, "machine_required": "Manual Tools", "status": "PENDING",
     "risk_score": 29, "notes": "Routine weld joint inspection.", "preferred_date": "2024-09-21"},

    {"id": 14, "task_id": "MT-2024-014", "asset_id": "TRK-NER-LJN-031", "asset_type": "Track",
     "department": "ENGG", "location": "Lucknow–Gorakhpur (KM 212+400)", "zone": "NER", "division": "Lucknow",
     "criticality": "MEDIUM", "safety_critical": True, "overdue": True, "estimated_duration": 200,
     "crew_required": 9, "machine_required": "Ultrasonic Rail Testing Car", "status": "PENDING",
     "risk_score": 69, "notes": "Ultrasonic test overdue. Internal crack suspected.", "preferred_date": "2024-09-17"},

    {"id": 15, "task_id": "MT-2024-015", "asset_id": "TRK-SER-KGP-008", "asset_type": "Track",
     "department": "ENGG", "location": "Kharagpur–Balasore (KM 145+700)", "zone": "SER", "division": "Kharagpur",
     "criticality": "HIGH", "safety_critical": True, "overdue": False, "estimated_duration": 300,
     "crew_required": 14, "machine_required": "Rail Laying Machine", "status": "SCHEDULED",
     "risk_score": 81, "notes": "Rail replacement at fish-plated joint. Speed restriction imposed.", "preferred_date": "2024-09-18"},
]

_blocks = [
    {"id": "BLK-001", "window_code": "CR-BH-N1", "corridor": "Bhusawal–Malegaon", "track": "UP Line",
     "start_time": "22:00", "end_time": "03:00", "duration_minutes": 300, "department": "ENGG",
     "task_ids": ["MT-2024-001"], "power_block_required": False, "status": "APPROVED",
     "zone": "CR", "division": "Bhusawal", "crew": 12, "machine": "Tamping Machine",
     "approved_by": "DOM/Bhusawal", "approved_at": "2024-09-16T15:30:00"},

    {"id": "BLK-002", "window_code": "WR-VL-D1", "corridor": "Vadodara–Anand", "track": "DN Line",
     "start_time": "01:00", "end_time": "04:00", "duration_minutes": 180, "department": "TRACTION",
     "task_ids": ["MT-2024-002"], "power_block_required": True, "status": "PENDING",
     "zone": "WR", "division": "Vadodara", "crew": 8, "machine": "Tower Wagon",
     "approved_by": None, "approved_at": None},

    {"id": "BLK-003", "window_code": "SR-SL-N1", "corridor": "Coimbatore–Erode", "track": "UP Line",
     "start_time": "23:00", "end_time": "05:00", "duration_minutes": 360, "department": "ENGG",
     "task_ids": ["MT-2024-004"], "power_block_required": False, "status": "SUBMITTED",
     "zone": "SR", "division": "Salem", "crew": 16, "machine": "Crane",
     "approved_by": None, "approved_at": None},

    {"id": "BLK-004", "window_code": "NFR-KT-N1", "corridor": "Guwahati–Bongaigaon", "track": "UP+DN",
     "start_time": "00:00", "end_time": "08:00", "duration_minutes": 480, "department": "ENGG",
     "task_ids": ["MT-2024-010"], "power_block_required": False, "status": "UNDER_REVIEW",
     "zone": "NFR", "division": "Katihar", "crew": 20, "machine": "Crane + Welding Unit",
     "approved_by": None, "approved_at": None},

    {"id": "BLK-005", "window_code": "SER-KGP-D1", "corridor": "Kharagpur–Balasore", "track": "DN Line",
     "start_time": "02:00", "end_time": "07:00", "duration_minutes": 300, "department": "ENGG",
     "task_ids": ["MT-2024-015"], "power_block_required": False, "status": "APPROVED",
     "zone": "SER", "division": "Kharagpur", "crew": 14, "machine": "Rail Laying Machine",
     "approved_by": "DOM/Kharagpur", "approved_at": "2024-09-16T18:00:00"},
]

_trains = [
    {"id": 1, "train_number": "12951", "name": "Mumbai Rajdhani Express", "train_type": "RAJDHANI",
     "origin": "Mumbai Central", "destination": "New Delhi", "scheduled_pass_time": "03:45", "priority": "HIGH", "zone": "WR"},
    {"id": 2, "train_number": "12952", "name": "New Delhi Rajdhani Express", "train_type": "RAJDHANI",
     "origin": "New Delhi", "destination": "Mumbai Central", "scheduled_pass_time": "22:30", "priority": "HIGH", "zone": "WR"},
    {"id": 3, "train_number": "12009", "name": "Shatabdi Express", "train_type": "SHATABDI",
     "origin": "Mumbai Central", "destination": "Ahmedabad", "scheduled_pass_time": "06:25", "priority": "HIGH", "zone": "WR"},
    {"id": 4, "train_number": "11301", "name": "Udyan Express", "train_type": "SUPERFAST",
     "origin": "Mumbai CST", "destination": "Bangalore City", "scheduled_pass_time": "23:15", "priority": "MEDIUM", "zone": "CR"},
    {"id": 5, "train_number": "12025", "name": "Pune Shatabdi", "train_type": "SHATABDI",
     "origin": "Pune", "destination": "New Delhi", "scheduled_pass_time": "07:10", "priority": "HIGH", "zone": "CR"},
    {"id": 6, "train_number": "12649", "name": "Karnataka Sampark Kranti", "train_type": "SUPERFAST",
     "origin": "Yesvantpur", "destination": "Hazrat Nizamuddin", "scheduled_pass_time": "01:30", "priority": "MEDIUM", "zone": "SWR"},
    {"id": 7, "train_number": "12875", "name": "Neelachal Express", "train_type": "SUPERFAST",
     "origin": "Puri", "destination": "New Delhi", "scheduled_pass_time": "02:45", "priority": "MEDIUM", "zone": "SER"},
    {"id": 8, "train_number": "15929", "name": "Dibrugarh Rajdhani", "train_type": "RAJDHANI",
     "origin": "Dibrugarh", "destination": "New Delhi", "scheduled_pass_time": "04:15", "priority": "HIGH", "zone": "NFR"},
    {"id": 9, "train_number": "22691", "name": "Rajdhani Express", "train_type": "RAJDHANI",
     "origin": "Bangalore City", "destination": "New Delhi", "scheduled_pass_time": "20:00", "priority": "HIGH", "zone": "SWR"},
    {"id": 10, "train_number": "12841", "name": "Coromandel Express", "train_type": "SUPERFAST",
     "origin": "Mumbai CST", "destination": "Chennai Central", "scheduled_pass_time": "00:10", "priority": "MEDIUM", "zone": "CR"},
    {"id": 11, "train_number": "12393", "name": "Sampoorna Kranti Express", "train_type": "SUPERFAST",
     "origin": "Rajendra Nagar", "destination": "New Delhi", "scheduled_pass_time": "03:20", "priority": "MEDIUM", "zone": "ECR"},
    {"id": 12, "train_number": "12621", "name": "Tamil Nadu Express", "train_type": "SUPERFAST",
     "origin": "New Delhi", "destination": "Chennai Central", "scheduled_pass_time": "22:30", "priority": "HIGH", "zone": "SR"},
    {"id": 13, "train_number": "58001", "name": "HWH-PURI Passenger", "train_type": "PASSENGER",
     "origin": "Howrah", "destination": "Puri", "scheduled_pass_time": "06:30", "priority": "LOW", "zone": "SER"},
    {"id": 14, "train_number": "12721", "name": "Dakshin Express", "train_type": "SUPERFAST",
     "origin": "Hyderabad", "destination": "New Delhi", "scheduled_pass_time": "21:45", "priority": "MEDIUM", "zone": "SCR"},
    {"id": 15, "train_number": "13019", "name": "Bagh Express", "train_type": "EXPRESS",
     "origin": "Howrah", "destination": "Pathankot", "scheduled_pass_time": "04:50", "priority": "LOW", "zone": "ER"},
]

_approvals = [
    {"id": "APR-001", "block_id": "BLK-001", "task_id": "MT-2024-001", "status": "APPROVED",
     "submitted_by": "SSE/BH", "reviewed_by": "DOM/Bhusawal", "submitted_at": "2024-09-16T10:00:00",
     "reviewed_at": "2024-09-16T15:30:00", "comments": "Approved. Ensure flagmen deployed at both ends."},
    {"id": "APR-002", "block_id": "BLK-002", "task_id": "MT-2024-002", "status": "UNDER_REVIEW",
     "submitted_by": "SSE/Vadodara", "reviewed_by": None, "submitted_at": "2024-09-16T14:00:00",
     "reviewed_at": None, "comments": "Power block coordination required with TPC."},
    {"id": "APR-003", "block_id": "BLK-003", "task_id": "MT-2024-004", "status": "SUBMITTED",
     "submitted_by": "SSE/Salem", "reviewed_by": None, "submitted_at": "2024-09-16T16:30:00",
     "reviewed_at": None, "comments": ""},
    {"id": "APR-004", "block_id": "BLK-004", "task_id": "MT-2024-010", "status": "UNDER_REVIEW",
     "submitted_by": "DEN/NFR", "reviewed_by": "DOM/Katihar", "submitted_at": "2024-09-15T08:00:00",
     "reviewed_at": None, "comments": "Bridge safety inspection report required before approval."},
    {"id": "APR-005", "block_id": "BLK-005", "task_id": "MT-2024-015", "status": "APPROVED",
     "submitted_by": "SSE/KGP", "reviewed_by": "DOM/Kharagpur", "submitted_at": "2024-09-16T09:00:00",
     "reviewed_at": "2024-09-16T18:00:00", "comments": "Approved. Speed restriction to continue until rail replacement complete."},
    {"id": "APR-006", "block_id": None, "task_id": "MT-2024-007", "status": "DRAFT",
     "submitted_by": "SSE/Bangalore", "reviewed_by": None, "submitted_at": None,
     "reviewed_at": None, "comments": "Draft pending crew confirmation."},
]

_audit_log = [
    {"id": "LOG-001", "timestamp": "2024-09-16T18:00:00", "user": "DOM/Bhusawal", "role": "DIVISIONAL OPERATIONS MANAGER",
     "action": "APPROVAL_APPROVED", "object_type": "Approval", "object_id": "APR-001",
     "old_value": "SUBMITTED", "new_value": "APPROVED"},
    {"id": "LOG-002", "timestamp": "2024-09-16T16:30:00", "user": "SSE/Salem", "role": "SR. SECTION ENGINEER",
     "action": "APPROVAL_SUBMITTED", "object_type": "Approval", "object_id": "APR-003",
     "old_value": "DRAFT", "new_value": "SUBMITTED"},
    {"id": "LOG-003", "timestamp": "2024-09-16T15:00:00", "user": "System", "role": "AI Engine",
     "action": "OPTIMIZATION_RUN", "object_type": "BlockPlan", "object_id": "PLAN-20240916",
     "old_value": None, "new_value": "3 plans generated"},
    {"id": "LOG-004", "timestamp": "2024-09-16T14:00:00", "user": "SSE/Vadodara", "role": "SR. SECTION ENGINEER",
     "action": "BLOCK_CREATED", "object_type": "BlockWindow", "object_id": "BLK-002",
     "old_value": None, "new_value": "WR-VL-D1 01:00-04:00"},
    {"id": "LOG-005", "timestamp": "2024-09-16T12:30:00", "user": "System", "role": "AI Engine",
     "action": "PRIORITY_CALCULATED", "object_type": "MaintenanceTask", "object_id": "MT-2024-010",
     "old_value": "MEDIUM", "new_value": "HIGH (risk_score: 94)"},
    {"id": "LOG-006", "timestamp": "2024-09-16T11:00:00", "user": "DEN/NFR", "role": "DIVISIONAL ENGINEER",
     "action": "TASK_CREATED", "object_type": "MaintenanceTask", "object_id": "MT-2024-010",
     "old_value": None, "new_value": "Bridge inspection — flood damage"},
    {"id": "LOG-007", "timestamp": "2024-09-16T10:00:00", "user": "SSE/BH", "role": "SR. SECTION ENGINEER",
     "action": "APPROVAL_SUBMITTED", "object_type": "Approval", "object_id": "APR-001",
     "old_value": "DRAFT", "new_value": "SUBMITTED"},
    {"id": "LOG-008", "timestamp": "2024-09-15T22:30:00", "user": "System", "role": "Event Monitor",
     "action": "EVENT_DETECTED", "object_type": "Event", "object_id": "EVT-001",
     "old_value": None, "new_value": "Train 12951 delayed 45 min at Vadodara"},
    {"id": "LOG-009", "timestamp": "2024-09-15T20:00:00", "user": "SSE/KGP", "role": "SR. SECTION ENGINEER",
     "action": "TASK_UPDATED", "object_type": "MaintenanceTask", "object_id": "MT-2024-015",
     "old_value": "PENDING", "new_value": "SCHEDULED"},
    {"id": "LOG-010", "timestamp": "2024-09-15T18:00:00", "user": "Admin", "role": "SYSTEM ADMIN",
     "action": "SYSTEM_STARTUP", "object_type": "System", "object_id": "RAILOPT",
     "old_value": None, "new_value": "Demo mode initialized"},
]

_recommendations = [
    {"id": "REC-001", "task_id": "MT-2024-001", "recommendation": "Prioritize track fracture repair at BH KM 347+200",
     "suggested_window": "22:00–03:00 (Tonight)", "corridor": "Bhusawal–Malegaon",
     "reason": "Safety-critical + overdue. Low train traffic after 22:00. Tamping machine available.",
     "priority": "HIGH", "status": "PENDING", "confidence": 94},
    {"id": "REC-002", "task_id": "MT-2024-010", "recommendation": "Emergency bridge repair must be scheduled immediately",
     "suggested_window": "00:00–08:00 (Tonight)", "corridor": "Guwahati–Bongaigaon",
     "reason": "Flood-damaged pier is safety-critical. Speed restriction already imposed. Further delay increases derailment risk.",
     "priority": "HIGH", "status": "PENDING", "confidence": 97},
    {"id": "REC-003", "task_id": "MT-2024-004", "recommendation": "Schedule bridge girder repair at Coimbatore",
     "suggested_window": "23:00–05:00 (Tonight)", "corridor": "Coimbatore–Erode",
     "reason": "Overdue safety-critical repair. Night window optimal — 2 express trains routed via alternate line.",
     "priority": "HIGH", "status": "PENDING", "confidence": 89},
    {"id": "REC-004", "task_id": "MT-2024-014", "recommendation": "Ultrasonic rail testing overdue at NER",
     "suggested_window": "01:00–04:30 (Tomorrow)", "corridor": "Lucknow–Gorakhpur",
     "reason": "Ultrasonic test 3 weeks overdue. Internal crack risk elevated. Low traffic window identified.",
     "priority": "MEDIUM", "status": "PENDING", "confidence": 78},
    {"id": "REC-005", "task_id": "MT-2024-012", "recommendation": "LC gate motor repair at Bilaspur",
     "suggested_window": "14:00–16:00 (Today)", "corridor": "Bilaspur–Raipur",
     "reason": "Manual operation ongoing — safety risk. Daytime block preferred for LC gate work. Crew available.",
     "priority": "HIGH", "status": "ACCEPTED", "confidence": 85},
    {"id": "REC-006", "task_id": "MT-2024-009", "recommendation": "OHE mast rectification at NWR",
     "suggested_window": "02:00–05:00 (Tomorrow)", "corridor": "Jaipur–Ajmer",
     "reason": "Tilting mast risk factor increasing. Tower wagon available. Night block with power block coordination.",
     "priority": "MEDIUM", "status": "PENDING", "confidence": 71},
]

_events = [
    {"id": "EVT-001", "event_type": "TRAIN_DELAY", "timestamp": "2024-09-15T22:30:00",
     "description": "Train 12951 Mumbai Rajdhani delayed 45 min due to signal failure at Vadodara",
     "severity": "MEDIUM", "affected_blocks": ["BLK-002"], "affected_trains": ["12951"],
     "status": "ACKNOWLEDGED", "recommendation": "Adjust block BLK-002 window by 45 minutes"},
    {"id": "EVT-002", "event_type": "EMERGENCY_DEFECT", "timestamp": "2024-09-16T08:15:00",
     "description": "Emergency rail fracture at Guwahati reported by loco pilot",
     "severity": "HIGH", "affected_blocks": ["BLK-004"], "affected_trains": ["15929"],
     "status": "ACTIVE", "recommendation": "Immediate block sanctioned. Reroute 15929 via alternate."},
]

_gis_assets = [
    {"asset_id": "TRK-CR-BH-001", "asset_type": "Track", "location": "Bhusawal–Malegaon", "zone": "CR",
     "condition": "POOR", "risk_score": 87, "last_maintenance": "2024-06-15", "next_maintenance": "2024-09-17",
     "status": "RESTRICTED", "lat": 21.0421, "lng": 75.7722},
    {"asset_id": "OHE-WR-VL-009", "asset_type": "OHE Wire", "location": "Vadodara–Anand", "zone": "WR",
     "condition": "FAIR", "risk_score": 79, "last_maintenance": "2024-07-20", "next_maintenance": "2024-09-17",
     "status": "MONITORING", "lat": 22.3072, "lng": 73.1812},
    {"asset_id": "BRG-SR-CBE-007", "asset_type": "Bridge", "location": "Coimbatore–Erode", "zone": "SR",
     "condition": "CRITICAL", "risk_score": 91, "last_maintenance": "2024-05-10", "next_maintenance": "2024-09-17",
     "status": "RESTRICTED", "lat": 11.0168, "lng": 76.9558},
    {"asset_id": "BRG-NFR-GHY-002", "asset_type": "Bridge", "location": "Guwahati–Bongaigaon", "zone": "NFR",
     "condition": "CRITICAL", "risk_score": 94, "last_maintenance": "2024-04-15", "next_maintenance": "2024-09-17",
     "status": "BLOCKED", "lat": 26.1445, "lng": 91.7362},
    {"asset_id": "SIG-NR-MB-022", "asset_type": "Signal", "location": "Moradabad–Rampur", "zone": "NR",
     "condition": "FAIR", "risk_score": 65, "last_maintenance": "2024-08-01", "next_maintenance": "2024-09-18",
     "status": "MONITORING", "lat": 28.8386, "lng": 78.7733},
    {"asset_id": "TRD-SCR-SC-011", "asset_type": "Traction Substation", "location": "Secunderabad–Kazipet", "zone": "SCR",
     "condition": "FAIR", "risk_score": 73, "last_maintenance": "2024-07-30", "next_maintenance": "2024-09-19",
     "status": "MONITORING", "lat": 17.4399, "lng": 78.4983},
    {"asset_id": "TRK-SER-KGP-008", "asset_type": "Track", "location": "Kharagpur–Balasore", "zone": "SER",
     "condition": "POOR", "risk_score": 81, "last_maintenance": "2024-06-20", "next_maintenance": "2024-09-18",
     "status": "RESTRICTED", "lat": 22.3460, "lng": 87.3119},
    {"asset_id": "SIG-SWR-BNG-055", "asset_type": "Point Machine", "location": "Bangalore–Tumkur", "zone": "SWR",
     "condition": "FAIR", "risk_score": 58, "last_maintenance": "2024-08-10", "next_maintenance": "2024-09-17",
     "status": "MONITORING", "lat": 13.0827, "lng": 77.5877},
    {"asset_id": "TRK-ECR-DNR-024", "asset_type": "Track", "location": "Danapur–Ara", "zone": "ECR",
     "condition": "GOOD", "risk_score": 29, "last_maintenance": "2024-09-01", "next_maintenance": "2024-09-21",
     "status": "OPERATIONAL", "lat": 25.6139, "lng": 84.9756},
    {"asset_id": "TRK-NR-DLI-012", "asset_type": "Track", "location": "Delhi–Ghaziabad", "zone": "NR",
     "condition": "GOOD", "risk_score": 22, "last_maintenance": "2024-09-05", "next_maintenance": "2024-10-05",
     "status": "OPERATIONAL", "lat": 28.7041, "lng": 77.1025},
]

# ============================================================
# HELPER
# ============================================================

def _now():
    return datetime.datetime.now().isoformat()

def _add_audit(user, role, action, obj_type, obj_id, old_val=None, new_val=None):
    entry = {
        "id": f"LOG-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": _now(),
        "user": user,
        "role": role,
        "action": action,
        "object_type": obj_type,
        "object_id": str(obj_id),
        "old_value": old_val,
        "new_value": new_val,
    }
    _audit_log.insert(0, entry)
    return entry

# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard/stats")
def get_dashboard_stats():
    pending = sum(1 for t in _tasks if t["status"] == "PENDING")
    high_risk = sum(1 for t in _tasks if t["risk_score"] >= 70)
    approved_blocks = sum(1 for b in _blocks if b["status"] == "APPROVED")
    pending_blocks = sum(1 for b in _blocks if b["status"] in ("PENDING", "SUBMITTED", "UNDER_REVIEW"))
    return {"success": True, "data": {
        "active_tasks": pending,
        "pending_blocks": pending_blocks,
        "approved_blocks": approved_blocks,
        "high_risk_assets": high_risk,
        "trains_affected": 6,
        "block_utilization": 73,
        "emergency_events": sum(1 for e in _events if e["status"] == "ACTIVE"),
        "optimization_status": "READY",
    }}

# ============================================================
# MAINTENANCE TASKS
# ============================================================

class TaskCreate(BaseModel):
    task_id: Optional[str] = None
    asset_id: str
    asset_type: str
    department: str
    location: str
    zone: str
    division: str
    criticality: str
    safety_critical: bool = False
    overdue: bool = False
    estimated_duration: int = 120
    crew_required: int = 4
    machine_required: str = ""
    status: str = "PENDING"
    notes: str = ""
    preferred_date: str = ""

@router.get("/maintenance-tasks")
def get_tasks():
    return {"success": True, "data": _tasks}

@router.post("/maintenance-tasks")
def create_task(body: TaskCreate):
    new_id = max((t["id"] for t in _tasks), default=0) + 1
    task_id = body.task_id or f"MT-2024-{new_id:03d}"
    risk = 0
    if body.safety_critical: risk += 40
    if body.criticality == "HIGH": risk += 30
    elif body.criticality == "MEDIUM": risk += 20
    else: risk += 10
    if body.overdue: risk += 20
    risk = min(risk, 100)
    task = {**body.dict(), "id": new_id, "task_id": task_id, "risk_score": risk}
    _tasks.append(task)
    _add_audit("User", "OPERATOR", "TASK_CREATED", "MaintenanceTask", task_id, None, task_id)
    return {"success": True, "data": task}

@router.put("/maintenance-tasks/{task_id}")
def update_task(task_id: int, body: dict):
    for i, t in enumerate(_tasks):
        if t["id"] == task_id:
            old = t["status"]
            _tasks[i] = {**t, **body, "id": task_id}
            _add_audit("User", "OPERATOR", "TASK_UPDATED", "MaintenanceTask", _tasks[i]["task_id"], old, _tasks[i].get("status"))
            return {"success": True, "data": _tasks[i]}
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/maintenance-tasks/{task_id}")
def delete_task(task_id: int):
    global _tasks
    t = next((t for t in _tasks if t["id"] == task_id), None)
    if not t: raise HTTPException(status_code=404, detail="Task not found")
    _tasks = [x for x in _tasks if x["id"] != task_id]
    _add_audit("User", "OPERATOR", "TASK_DELETED", "MaintenanceTask", t["task_id"], t["task_id"], None)
    return {"success": True, "message": "Task deleted"}

# ============================================================
# BLOCK WINDOWS
# ============================================================

@router.get("/block-windows")
def get_blocks():
    return {"success": True, "data": _blocks}

@router.post("/block-windows")
def create_block(body: dict):
    new_id = f"BLK-{uuid.uuid4().hex[:6].upper()}"
    block = {**body, "id": new_id, "status": body.get("status", "PENDING")}
    _blocks.append(block)
    _add_audit("User", "OPERATOR", "BLOCK_CREATED", "BlockWindow", new_id, None, block.get("window_code"))
    return {"success": True, "data": block}

@router.put("/block-windows/{block_id}")
def update_block(block_id: str, body: dict):
    for i, b in enumerate(_blocks):
        if b["id"] == block_id:
            _blocks[i] = {**b, **body}
            return {"success": True, "data": _blocks[i]}
    raise HTTPException(status_code=404, detail="Block not found")

@router.delete("/block-windows/{block_id}")
def delete_block(block_id: str):
    global _blocks
    b = next((b for b in _blocks if b["id"] == block_id), None)
    if not b: raise HTTPException(status_code=404, detail="Block not found")
    _blocks = [x for x in _blocks if x["id"] != block_id]
    _add_audit("User", "OPERATOR", "BLOCK_DELETED", "BlockWindow", block_id, b.get("window_code"), None)
    return {"success": True, "message": "Block deleted"}

# ============================================================
# TRAINS
# ============================================================

@router.get("/trains")
def get_trains():
    return {"success": True, "data": _trains}

# ============================================================
# ML PRIORITY
# ============================================================

class PriorityRequest(BaseModel):
    task: Dict[str, Any]

@router.post("/ml/predict-priority")
def predict_priority(body: PriorityRequest):
    task = body.task
    score = 0
    reasons = []
    if task.get("safety_critical"):
        score += 40
        reasons.append("Safety-critical asset")
    crit = str(task.get("criticality", "MEDIUM")).upper()
    if crit == "HIGH":
        score += 30
        reasons.append("High criticality classification")
    elif crit == "MEDIUM":
        score += 20
    else:
        score += 10
    if task.get("overdue"):
        score += 20
        reasons.append("Maintenance is overdue")
    asset_risk = int(task.get("risk_score", task.get("asset_risk", 50)))
    score += int(asset_risk * 0.1)
    score = min(score, 100)
    if score >= 70:
        priority = "HIGH"
    elif score >= 40:
        priority = "MEDIUM"
    else:
        priority = "LOW"
    reason = " + ".join(reasons) if reasons else "Routine maintenance priority"
    action = "Schedule immediately" if priority == "HIGH" else ("Schedule within 48 hours" if priority == "MEDIUM" else "Schedule at next convenience")
    _add_audit("System (AI)", "AI Engine", "PRIORITY_CALCULATED", "MaintenanceTask",
               task.get("task_id", "UNKNOWN"), task.get("criticality"), f"{priority} (score:{score})")
    return {"success": True, "data": {
        "task_id": task.get("task_id", "UNKNOWN"),
        "final_priority": priority,
        "risk_score": score,
        "reason": reason,
        "recommended_action": action,
        "rule_engine_priority": priority,
        "ml_priority": None,
        "ml_confidence": None,
        "ml_enabled": False,
        "agreement": True,
    }}

# ============================================================
# CONFLICT CHECK
# ============================================================

class ConflictRequest(BaseModel):
    block: Dict[str, Any]

@router.post("/conflicts/check")
def check_conflicts(body: ConflictRequest):
    blk = body.block
    start = blk.get("start_time", "00:00")
    end = blk.get("end_time", "06:00")
    corridor = blk.get("corridor", "")

    def to_min(t):
        try:
            h, m = t.split(":")
            return int(h) * 60 + int(m)
        except:
            return 0

    s_min = to_min(start)
    e_min = to_min(end)
    if e_min < s_min:
        e_min += 1440  # midnight cross

    conflicts = []
    suggestions = []
    for tr in _trains:
        t_min = to_min(tr.get("scheduled_pass_time", "12:00"))
        if s_min <= t_min <= e_min or (e_min > 1440 and t_min <= e_min - 1440):
            conflicts.append({
                "type": "TRAIN_MOVEMENT",
                "train_number": tr["train_number"],
                "train_name": tr["name"],
                "pass_time": tr["scheduled_pass_time"],
                "priority": tr["priority"],
                "severity": "HIGH" if tr["priority"] == "HIGH" else "MEDIUM",
                "reason": f"Train {tr['train_number']} ({tr['name']}) passes at {tr['scheduled_pass_time']} which falls within the proposed block window {start}–{end}."
            })

    status = "CONFLICT" if any(c["severity"] == "HIGH" for c in conflicts) else ("WARNING" if conflicts else "SAFE")

    if conflicts:
        h1 = (e_min % 1440) // 60
        m1 = (e_min % 1440) % 60
        alt_start = f"{h1:02d}:{m1:02d}"
        alt_end_min = (e_min + 120) % 1440
        alt_end = f"{alt_end_min // 60:02d}:{alt_end_min % 60:02d}"
        suggestions.append({"start_time": alt_start, "end_time": alt_end, "reason": "No train movements in this window"})

    return {"success": True, "data": {"status": status, "conflicts": conflicts, "suggestions": suggestions,
                                       "conflict_count": len(conflicts)}}

# ============================================================
# OPTIMIZATION
# ============================================================

class OptimizationRequest(BaseModel):
    tasks: Optional[List[Dict]] = None
    date: Optional[str] = None
    corridor: Optional[str] = None

@router.post("/optimization/run")
def run_optimization(body: OptimizationRequest):
    tasks = body.tasks or _tasks
    pending = [t for t in tasks if t.get("status") in ("PENDING", "SCHEDULED")]
    high = sorted([t for t in pending if t.get("risk_score", 0) >= 70], key=lambda x: -x.get("risk_score", 0))
    med = [t for t in pending if 40 <= t.get("risk_score", 0) < 70]

    def make_block(t, start_h, duration_h):
        sh = start_h % 24
        eh = (start_h + duration_h) % 24
        return {
            "block_id": f"OPT-{uuid.uuid4().hex[:6].upper()}",
            "track": "UP Line",
            "location": t.get("location", "N/A"),
            "zone": t.get("zone", "CR"),
            "start_time": f"{sh:02d}:00",
            "end_time": f"{eh:02d}:00",
            "tasks": [t.get("task_id", "UNKNOWN")],
            "department": t.get("department", "ENGG"),
            "crew": t.get("crew_required", 6),
            "machine": t.get("machine_required", "Standard"),
            "status": "PROPOSED",
            "power_block_required": t.get("department") == "TRACTION",
        }

    plan_a_blocks = [make_block(t, 22, 4) for t in high[:3]]
    plan_b_blocks = [make_block(t, 23, 5) for t in (high + med)[:5]]
    plan_c_blocks = [make_block(t, 21, 6) for t in (high + med)[:7]]

    _add_audit("System (AI)", "Optimizer", "OPTIMIZATION_RUN", "BlockPlan", body.date or "TODAY",
               None, f"{len(pending)} tasks optimized into 3 plans")

    return {"success": True, "data": {"plans": [
        {"plan_id": "PLAN-A", "name": "Plan A — Conservative",
         "description": "Prioritizes highest-risk safety-critical tasks only. Minimal disruption to train operations.",
         "total_tasks": len(plan_a_blocks), "total_block_hours": len(plan_a_blocks) * 4,
         "conflicts": 1, "risk_level": "LOW", "utilization_pct": 65,
         "affected_trains": 2, "blocks": plan_a_blocks},
        {"plan_id": "PLAN-B", "name": "Plan B — Balanced (Recommended)",
         "description": "Balances maintenance urgency with train operations. Recommended by AI optimizer.",
         "total_tasks": len(plan_b_blocks), "total_block_hours": len(plan_b_blocks) * 5,
         "conflicts": 2, "risk_level": "MEDIUM", "utilization_pct": 82,
         "affected_trains": 4, "blocks": plan_b_blocks},
        {"plan_id": "PLAN-C", "name": "Plan C — Aggressive",
         "description": "Maximizes maintenance throughput. Higher train impact but clears maximum backlog.",
         "total_tasks": len(plan_c_blocks), "total_block_hours": len(plan_c_blocks) * 6,
         "conflicts": 5, "risk_level": "HIGH", "utilization_pct": 94,
         "affected_trains": 7, "blocks": plan_c_blocks},
    ]}}

# ============================================================
# SIMULATION
# ============================================================

class SimulationRequest(BaseModel):
    original_duration: Optional[int] = 240
    new_duration: Optional[int] = 360
    block_start: Optional[str] = "22:00"
    block_end: Optional[str] = "03:00"
    crew_available: Optional[bool] = True
    machine_available: Optional[bool] = True
    train_delay_minutes: Optional[int] = 0

@router.post("/simulation/run")
def run_simulation(body: SimulationRequest):
    base_conflicts = 2
    base_util = 72
    new_conflicts = base_conflicts
    new_util = base_util
    if not body.crew_available:
        new_conflicts += 1
        new_util -= 15
    if not body.machine_available:
        new_conflicts += 2
        new_util -= 20
    if body.new_duration > body.original_duration:
        new_conflicts += 1
        new_util += 10
    if body.train_delay_minutes > 30:
        new_conflicts += 1
    affected_trains_orig = 3
    affected_trains_new = min(affected_trains_orig + (1 if new_conflicts > base_conflicts else 0), 8)
    return {"success": True, "data": {
        "original_plan": {"duration": body.original_duration, "start": body.block_start,
                          "end": body.block_end, "conflicts": base_conflicts, "utilization": base_util,
                          "affected_trains": affected_trains_orig},
        "modified_plan": {"duration": body.new_duration, "start": body.block_start,
                          "end": body.block_end, "conflicts": new_conflicts, "utilization": new_util,
                          "affected_trains": affected_trains_new},
        "risk_change": new_conflicts - base_conflicts,
        "utilization_change": new_util - base_util,
        "affected_trains": affected_trains_new,
        "conflict_count": new_conflicts,
    }}

# ============================================================
# EVENT SIMULATION
# ============================================================

class EventRequest(BaseModel):
    event_type: str
    location: Optional[str] = ""
    description: Optional[str] = ""
    severity: Optional[str] = "MEDIUM"

@router.post("/events/simulate")
def simulate_event(body: EventRequest):
    event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    affected_blocks = [b["id"] for b in _blocks[:2]]
    affected_trains = [t["train_number"] for t in _trains[:3]]
    recommendations = {
        "TRAIN_DELAY": "Adjust block start time by delay duration. Notify crew and machines.",
        "EMERGENCY_DEFECT": "Issue emergency block immediately. Alert DRM and safety officer.",
        "CREW_UNAVAILABLE": "Source alternate crew from nearest depot. Consider block postponement.",
        "MACHINE_UNAVAILABLE": "Identify substitute machine. Replan block with manual methods if needed.",
        "BLOCK_OVERRUN": "Extend block with DRM approval. Clear trains after work completion verification.",
        "SIGNAL_FAILURE": "Revert to absolute block working. Dispatch signal technician immediately.",
        "POWER_BLOCK_CHANGE": "Coordinate with TPC for revised power block window. Update all departments.",
    }
    rec = recommendations.get(body.event_type, "Assess impact and replan as required.")
    event = {"id": event_id, "event_type": body.event_type, "timestamp": _now(),
             "description": body.description or f"{body.event_type.replace('_', ' ').title()} at {body.location}",
             "severity": body.severity, "affected_blocks": affected_blocks,
             "affected_trains": affected_trains, "status": "ACTIVE", "recommendation": rec}
    _events.append(event)
    _add_audit("System", "Event Simulator", "EVENT_SIMULATED", "Event", event_id, None, body.event_type)
    return {"success": True, "data": event}

@router.get("/events")
def get_events():
    return {"success": True, "data": _events}

@router.post("/events/replan")
def replan(body: dict):
    event_id = body.get("event_id", "")
    _add_audit("System (AI)", "Optimizer", "REPLAN_EXECUTED", "BlockPlan", event_id, None, "Revised plan generated")
    return {"success": True, "data": {
        "message": "Revised block plan generated based on current event constraints.",
        "blocks": [
            {"block_id": f"REPLAN-{uuid.uuid4().hex[:6].upper()}", "track": "UP Line",
             "start_time": "01:30", "end_time": "05:00", "tasks": ["MT-2024-001"],
             "status": "PROPOSED", "reason": "Adjusted for event impact"},
        ],
    }}

# ============================================================
# APPROVALS
# ============================================================

@router.get("/approvals")
def get_approvals():
    return {"success": True, "data": _approvals}

@router.post("/approvals")
def create_approval(body: dict):
    new_id = f"APR-{uuid.uuid4().hex[:6].upper()}"
    apr = {**body, "id": new_id, "status": "DRAFT", "submitted_at": None, "reviewed_at": None}
    _approvals.append(apr)
    _add_audit("User", "OPERATOR", "APPROVAL_CREATED", "Approval", new_id, None, "DRAFT")
    return {"success": True, "data": apr}

@router.post("/approvals/{approval_id}/submit")
def submit_approval(approval_id: str):
    for i, a in enumerate(_approvals):
        if a["id"] == approval_id:
            _approvals[i] = {**a, "status": "SUBMITTED", "submitted_at": _now()}
            _add_audit("User", "OPERATOR", "APPROVAL_SUBMITTED", "Approval", approval_id, "DRAFT", "SUBMITTED")
            return {"success": True, "data": _approvals[i]}
    raise HTTPException(status_code=404, detail="Approval not found")

@router.post("/approvals/{approval_id}/approve")
def approve_approval(approval_id: str, body: dict = {}):
    for i, a in enumerate(_approvals):
        if a["id"] == approval_id:
            _approvals[i] = {**a, "status": "APPROVED", "reviewed_at": _now(),
                              "reviewed_by": body.get("reviewed_by", "DOM"),
                              "comments": body.get("comments", "")}
            _add_audit("User", "DOM", "APPROVAL_APPROVED", "Approval", approval_id, a["status"], "APPROVED")
            return {"success": True, "data": _approvals[i]}
    raise HTTPException(status_code=404, detail="Approval not found")

@router.post("/approvals/{approval_id}/reject")
def reject_approval(approval_id: str, body: dict = {}):
    for i, a in enumerate(_approvals):
        if a["id"] == approval_id:
            _approvals[i] = {**a, "status": "REJECTED", "reviewed_at": _now(),
                              "comments": body.get("comments", "Rejected.")}
            _add_audit("User", "DOM", "APPROVAL_REJECTED", "Approval", approval_id, a["status"], "REJECTED")
            return {"success": True, "data": _approvals[i]}
    raise HTTPException(status_code=404, detail="Approval not found")

# ============================================================
# AUDIT LOGS
# ============================================================

@router.get("/audit-logs")
def get_audit_logs():
    return {"success": True, "data": _audit_log}

# ============================================================
# GIS ASSETS
# ============================================================

@router.get("/gis/assets")
def get_gis_assets():
    return {"success": True, "data": _gis_assets}

# ============================================================
# RECOMMENDATIONS
# ============================================================

@router.get("/recommendations")
def get_recommendations():
    return {"success": True, "data": _recommendations}

@router.post("/recommendations/{rec_id}/accept")
def accept_recommendation(rec_id: str):
    for i, r in enumerate(_recommendations):
        if r["id"] == rec_id:
            _recommendations[i] = {**r, "status": "ACCEPTED"}
            _add_audit("User", "OPERATOR", "RECOMMENDATION_ACCEPTED", "Recommendation", rec_id, "PENDING", "ACCEPTED")
            return {"success": True, "data": _recommendations[i]}
    raise HTTPException(status_code=404, detail="Recommendation not found")

@router.post("/recommendations/{rec_id}/dismiss")
def dismiss_recommendation(rec_id: str):
    for i, r in enumerate(_recommendations):
        if r["id"] == rec_id:
            _recommendations[i] = {**r, "status": "DISMISSED"}
            _add_audit("User", "OPERATOR", "RECOMMENDATION_DISMISSED", "Recommendation", rec_id, "PENDING", "DISMISSED")
            return {"success": True, "data": _recommendations[i]}
    raise HTTPException(status_code=404, detail="Recommendation not found")
