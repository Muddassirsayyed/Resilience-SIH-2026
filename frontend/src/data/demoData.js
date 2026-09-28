// ============================================================
// RAILOPT — Comprehensive Demo Data
// Multi-zone Indian Railways prototype data
// NOT real operational data — for demonstration only
// ============================================================

export const DEMO_TASKS = [
  { id: 1, task_id: 'MT-2024-001', asset_id: 'TRK-CR-BH-001', asset_type: 'Track', department: 'ENGG',
    location: 'Bhusawal–Malegaon (KM 347+200)', zone: 'CR', division: 'Bhusawal',
    criticality: 'HIGH', safety_critical: true, overdue: true, estimated_duration: 240,
    crew_required: 12, machine_required: 'Tamping Machine', status: 'PENDING',
    risk_score: 87, notes: 'Rail fracture reported at KM 347+200. Immediate attention required.', preferred_date: '2024-09-17' },

  { id: 2, task_id: 'MT-2024-002', asset_id: 'OHE-WR-VL-009', asset_type: 'OHE Wire', department: 'TRACTION',
    location: 'Vadodara–Anand (KM 112+450)', zone: 'WR', division: 'Vadodara',
    criticality: 'HIGH', safety_critical: true, overdue: false, estimated_duration: 180,
    crew_required: 8, machine_required: 'Tower Wagon', status: 'SCHEDULED',
    risk_score: 79, notes: 'OHE wire sagging detected during patrol. Replace section.', preferred_date: '2024-09-17' },

  { id: 3, task_id: 'MT-2024-003', asset_id: 'SIG-NR-MB-022', asset_type: 'Signal', department: 'SIG',
    location: 'Moradabad–Rampur (KM 78+800)', zone: 'NR', division: 'Moradabad',
    criticality: 'MEDIUM', safety_critical: true, overdue: false, estimated_duration: 120,
    crew_required: 4, machine_required: 'Signal Test Equipment', status: 'PENDING',
    risk_score: 65, notes: 'Interlocking relay failure. Signal showing wrong aspect.', preferred_date: '2024-09-18' },

  { id: 4, task_id: 'MT-2024-004', asset_id: 'BRG-SR-CBE-007', asset_type: 'Bridge', department: 'ENGG',
    location: 'Coimbatore–Erode (KM 203+100)', zone: 'SR', division: 'Salem',
    criticality: 'HIGH', safety_critical: true, overdue: true, estimated_duration: 360,
    crew_required: 16, machine_required: 'Crane', status: 'PENDING',
    risk_score: 91, notes: 'Bridge girder crack detected. Safety-critical repair.', preferred_date: '2024-09-17' },

  { id: 5, task_id: 'MT-2024-005', asset_id: 'TRK-ER-HWH-034', asset_type: 'Track', department: 'ENGG',
    location: 'Howrah–Burdwan (KM 89+750)', zone: 'ER', division: 'Howrah',
    criticality: 'MEDIUM', safety_critical: false, overdue: false, estimated_duration: 150,
    crew_required: 6, machine_required: 'Track Geometry Car', status: 'IN_PROGRESS',
    risk_score: 52, notes: 'Rail profile wear beyond permissible limits. Grinding required.', preferred_date: '2024-09-18' },

  { id: 6, task_id: 'MT-2024-006', asset_id: 'TRD-SCR-SC-011', asset_type: 'Traction Substation', department: 'TRACTION',
    location: 'Secunderabad–Kazipet (KM 145+300)', zone: 'SCR', division: 'Hyderabad',
    criticality: 'HIGH', safety_critical: true, overdue: false, estimated_duration: 210,
    crew_required: 6, machine_required: 'Insulation Tester', status: 'PENDING',
    risk_score: 73, notes: 'Transformer oil leakage at traction substation.', preferred_date: '2024-09-19' },

  { id: 7, task_id: 'MT-2024-007', asset_id: 'SIG-SWR-BNG-055', asset_type: 'Point Machine', department: 'SIG',
    location: 'Bangalore–Tumkur (KM 22+600)', zone: 'SWR', division: 'Bangalore',
    criticality: 'MEDIUM', safety_critical: false, overdue: true, estimated_duration: 90,
    crew_required: 3, machine_required: 'Point Lubrication Kit', status: 'PENDING',
    risk_score: 58, notes: 'Point machine sluggish. Lubrication and adjustment needed.', preferred_date: '2024-09-17' },

  { id: 8, task_id: 'MT-2024-008', asset_id: 'TRK-NCR-CNB-018', asset_type: 'Track', department: 'ENGG',
    location: 'Kanpur–Fatehpur (KM 67+400)', zone: 'NCR', division: 'Prayagraj',
    criticality: 'LOW', safety_critical: false, overdue: false, estimated_duration: 120,
    crew_required: 8, machine_required: 'Tamping Machine', status: 'SCHEDULED',
    risk_score: 38, notes: 'Routine tamping as per schedule.', preferred_date: '2024-09-20' },

  { id: 9, task_id: 'MT-2024-009', asset_id: 'OHE-NWR-JP-003', asset_type: 'OHE Mast', department: 'TRACTION',
    location: 'Jaipur–Ajmer (KM 134+200)', zone: 'NWR', division: 'Jaipur',
    criticality: 'MEDIUM', safety_critical: true, overdue: false, estimated_duration: 150,
    crew_required: 5, machine_required: 'Tower Wagon', status: 'PENDING',
    risk_score: 66, notes: 'OHE mast tilting. Needs straightening and foundation check.', preferred_date: '2024-09-18' },

  { id: 10, task_id: 'MT-2024-010', asset_id: 'BRG-NFR-GHY-002', asset_type: 'Bridge', department: 'ENGG',
    location: 'Guwahati–Bongaigaon (KM 45+100)', zone: 'NFR', division: 'Katihar',
    criticality: 'HIGH', safety_critical: true, overdue: true, estimated_duration: 480,
    crew_required: 20, machine_required: 'Crane + Welding Unit', status: 'PENDING',
    risk_score: 94, notes: 'Flood-damaged bridge pier. Temporary speed restriction imposed.', preferred_date: '2024-09-17' },

  { id: 11, task_id: 'MT-2024-011', asset_id: 'TRK-WCR-JBP-009', asset_type: 'Track', department: 'ENGG',
    location: 'Jabalpur–Katni (KM 88+550)', zone: 'WCR', division: 'Jabalpur',
    criticality: 'MEDIUM', safety_critical: false, overdue: false, estimated_duration: 180,
    crew_required: 10, machine_required: 'Ballast Cleaning Machine', status: 'COMPLETED',
    risk_score: 41, notes: 'Ballast renewal complete.', preferred_date: '2024-09-15' },

  { id: 12, task_id: 'MT-2024-012', asset_id: 'SIG-SECR-BSP-017', asset_type: 'Level Crossing Gate', department: 'SIG',
    location: 'Bilaspur–Raipur (KM 56+800)', zone: 'SECR', division: 'Bilaspur',
    criticality: 'HIGH', safety_critical: true, overdue: false, estimated_duration: 120,
    crew_required: 4, machine_required: 'LC Gate Equipment', status: 'PENDING',
    risk_score: 76, notes: 'LC gate motor failure. Manual operation in progress.', preferred_date: '2024-09-17' },

  { id: 13, task_id: 'MT-2024-013', asset_id: 'TRK-ECR-DNR-024', asset_type: 'Track', department: 'ENGG',
    location: 'Danapur–Ara (KM 23+300)', zone: 'ECR', division: 'Danapur',
    criticality: 'LOW', safety_critical: false, overdue: false, estimated_duration: 90,
    crew_required: 6, machine_required: 'Manual Tools', status: 'PENDING',
    risk_score: 29, notes: 'Routine weld joint inspection.', preferred_date: '2024-09-21' },

  { id: 14, task_id: 'MT-2024-014', asset_id: 'TRK-NER-LJN-031', asset_type: 'Track', department: 'ENGG',
    location: 'Lucknow–Gorakhpur (KM 212+400)', zone: 'NER', division: 'Lucknow',
    criticality: 'MEDIUM', safety_critical: true, overdue: true, estimated_duration: 200,
    crew_required: 9, machine_required: 'Ultrasonic Rail Testing Car', status: 'PENDING',
    risk_score: 69, notes: 'Ultrasonic test overdue. Internal crack suspected.', preferred_date: '2024-09-17' },

  { id: 15, task_id: 'MT-2024-015', asset_id: 'TRK-SER-KGP-008', asset_type: 'Track', department: 'ENGG',
    location: 'Kharagpur–Balasore (KM 145+700)', zone: 'SER', division: 'Kharagpur',
    criticality: 'HIGH', safety_critical: true, overdue: false, estimated_duration: 300,
    crew_required: 14, machine_required: 'Rail Laying Machine', status: 'SCHEDULED',
    risk_score: 81, notes: 'Rail replacement at fish-plated joint. Speed restriction imposed.', preferred_date: '2024-09-18' },
]

export const DEMO_BLOCKS = [
  { id: 'BLK-001', window_code: 'CR-BH-N1', corridor: 'Bhusawal–Malegaon', track: 'UP Line',
    start_time: '22:00', end_time: '03:00', duration_minutes: 300, department: 'ENGG',
    task_ids: ['MT-2024-001'], power_block_required: false, status: 'APPROVED',
    zone: 'CR', division: 'Bhusawal', crew: 12, machine: 'Tamping Machine',
    approved_by: 'DOM/Bhusawal', approved_at: '2024-09-16T15:30:00' },

  { id: 'BLK-002', window_code: 'WR-VL-D1', corridor: 'Vadodara–Anand', track: 'DN Line',
    start_time: '01:00', end_time: '04:00', duration_minutes: 180, department: 'TRACTION',
    task_ids: ['MT-2024-002'], power_block_required: true, status: 'PENDING',
    zone: 'WR', division: 'Vadodara', crew: 8, machine: 'Tower Wagon',
    approved_by: null, approved_at: null },

  { id: 'BLK-003', window_code: 'SR-SL-N1', corridor: 'Coimbatore–Erode', track: 'UP Line',
    start_time: '23:00', end_time: '05:00', duration_minutes: 360, department: 'ENGG',
    task_ids: ['MT-2024-004'], power_block_required: false, status: 'SUBMITTED',
    zone: 'SR', division: 'Salem', crew: 16, machine: 'Crane',
    approved_by: null, approved_at: null },

  { id: 'BLK-004', window_code: 'NFR-KT-N1', corridor: 'Guwahati–Bongaigaon', track: 'UP+DN',
    start_time: '00:00', end_time: '08:00', duration_minutes: 480, department: 'ENGG',
    task_ids: ['MT-2024-010'], power_block_required: false, status: 'UNDER_REVIEW',
    zone: 'NFR', division: 'Katihar', crew: 20, machine: 'Crane + Welding Unit',
    approved_by: null, approved_at: null },

  { id: 'BLK-005', window_code: 'SER-KGP-D1', corridor: 'Kharagpur–Balasore', track: 'DN Line',
    start_time: '02:00', end_time: '07:00', duration_minutes: 300, department: 'ENGG',
    task_ids: ['MT-2024-015'], power_block_required: false, status: 'APPROVED',
    zone: 'SER', division: 'Kharagpur', crew: 14, machine: 'Rail Laying Machine',
    approved_by: 'DOM/Kharagpur', approved_at: '2024-09-16T18:00:00' },
]

export const DEMO_TRAINS = [
  { id: 1, train_number: '12951', name: 'Mumbai Rajdhani Express', train_type: 'RAJDHANI', origin: 'Mumbai Central', destination: 'New Delhi', scheduled_pass_time: '03:45', priority: 'HIGH', zone: 'WR' },
  { id: 2, train_number: '12952', name: 'New Delhi Rajdhani', train_type: 'RAJDHANI', origin: 'New Delhi', destination: 'Mumbai Central', scheduled_pass_time: '22:30', priority: 'HIGH', zone: 'WR' },
  { id: 3, train_number: '12009', name: 'Shatabdi Express', train_type: 'SHATABDI', origin: 'Mumbai Central', destination: 'Ahmedabad', scheduled_pass_time: '06:25', priority: 'HIGH', zone: 'WR' },
  { id: 4, train_number: '11301', name: 'Udyan Express', train_type: 'SUPERFAST', origin: 'Mumbai CST', destination: 'Bangalore City', scheduled_pass_time: '23:15', priority: 'MEDIUM', zone: 'CR' },
  { id: 5, train_number: '12025', name: 'Pune Shatabdi', train_type: 'SHATABDI', origin: 'Pune', destination: 'New Delhi', scheduled_pass_time: '07:10', priority: 'HIGH', zone: 'CR' },
  { id: 6, train_number: '12649', name: 'Karnataka Sampark Kranti', train_type: 'SUPERFAST', origin: 'Yesvantpur', destination: 'Hazrat Nizamuddin', scheduled_pass_time: '01:30', priority: 'MEDIUM', zone: 'SWR' },
  { id: 7, train_number: '12875', name: 'Neelachal Express', train_type: 'SUPERFAST', origin: 'Puri', destination: 'New Delhi', scheduled_pass_time: '02:45', priority: 'MEDIUM', zone: 'SER' },
  { id: 8, train_number: '15929', name: 'Dibrugarh Rajdhani', train_type: 'RAJDHANI', origin: 'Dibrugarh', destination: 'New Delhi', scheduled_pass_time: '04:15', priority: 'HIGH', zone: 'NFR' },
  { id: 9, train_number: '22691', name: 'Rajdhani Express', train_type: 'RAJDHANI', origin: 'Bangalore City', destination: 'New Delhi', scheduled_pass_time: '20:00', priority: 'HIGH', zone: 'SWR' },
  { id: 10, train_number: '12841', name: 'Coromandel Express', train_type: 'SUPERFAST', origin: 'Mumbai CST', destination: 'Chennai Central', scheduled_pass_time: '00:10', priority: 'MEDIUM', zone: 'CR' },
  { id: 11, train_number: '12393', name: 'Sampoorna Kranti', train_type: 'SUPERFAST', origin: 'Rajendra Nagar', destination: 'New Delhi', scheduled_pass_time: '03:20', priority: 'MEDIUM', zone: 'ECR' },
  { id: 12, train_number: '12621', name: 'Tamil Nadu Express', train_type: 'SUPERFAST', origin: 'New Delhi', destination: 'Chennai Central', scheduled_pass_time: '22:30', priority: 'HIGH', zone: 'SR' },
  { id: 13, train_number: '58001', name: 'HWH-PURI Passenger', train_type: 'PASSENGER', origin: 'Howrah', destination: 'Puri', scheduled_pass_time: '06:30', priority: 'LOW', zone: 'SER' },
  { id: 14, train_number: '12721', name: 'Dakshin Express', train_type: 'SUPERFAST', origin: 'Hyderabad', destination: 'New Delhi', scheduled_pass_time: '21:45', priority: 'MEDIUM', zone: 'SCR' },
  { id: 15, train_number: '13019', name: 'Bagh Express', train_type: 'EXPRESS', origin: 'Howrah', destination: 'Pathankot', scheduled_pass_time: '04:50', priority: 'LOW', zone: 'ER' },
]

export const DEMO_APPROVALS = [
  { id: 'APR-001', block_id: 'BLK-001', task_id: 'MT-2024-001', status: 'APPROVED',
    submitted_by: 'SSE/BH', reviewed_by: 'DOM/Bhusawal', submitted_at: '2024-09-16T10:00:00',
    reviewed_at: '2024-09-16T15:30:00', comments: 'Approved. Ensure flagmen deployed at both ends.' },
  { id: 'APR-002', block_id: 'BLK-002', task_id: 'MT-2024-002', status: 'UNDER_REVIEW',
    submitted_by: 'SSE/Vadodara', reviewed_by: null, submitted_at: '2024-09-16T14:00:00',
    reviewed_at: null, comments: 'Power block coordination required with TPC.' },
  { id: 'APR-003', block_id: 'BLK-003', task_id: 'MT-2024-004', status: 'SUBMITTED',
    submitted_by: 'SSE/Salem', reviewed_by: null, submitted_at: '2024-09-16T16:30:00',
    reviewed_at: null, comments: '' },
  { id: 'APR-004', block_id: 'BLK-004', task_id: 'MT-2024-010', status: 'UNDER_REVIEW',
    submitted_by: 'DEN/NFR', reviewed_by: 'DOM/Katihar', submitted_at: '2024-09-15T08:00:00',
    reviewed_at: null, comments: 'Bridge safety inspection report required.' },
  { id: 'APR-005', block_id: 'BLK-005', task_id: 'MT-2024-015', status: 'APPROVED',
    submitted_by: 'SSE/KGP', reviewed_by: 'DOM/Kharagpur', submitted_at: '2024-09-16T09:00:00',
    reviewed_at: '2024-09-16T18:00:00', comments: 'Approved. Speed restriction until rail replacement complete.' },
  { id: 'APR-006', block_id: null, task_id: 'MT-2024-007', status: 'DRAFT',
    submitted_by: 'SSE/Bangalore', reviewed_by: null, submitted_at: null,
    reviewed_at: null, comments: 'Draft pending crew confirmation.' },
]

export const DEMO_AUDIT_LOGS = [
  { id: 'LOG-001', timestamp: '2024-09-16T18:00:00', user: 'DOM/Bhusawal', role: 'DIVISIONAL OPERATIONS MANAGER', action: 'APPROVAL_APPROVED', object_type: 'Approval', object_id: 'APR-001', old_value: 'SUBMITTED', new_value: 'APPROVED' },
  { id: 'LOG-002', timestamp: '2024-09-16T16:30:00', user: 'SSE/Salem', role: 'SR. SECTION ENGINEER', action: 'APPROVAL_SUBMITTED', object_type: 'Approval', object_id: 'APR-003', old_value: 'DRAFT', new_value: 'SUBMITTED' },
  { id: 'LOG-003', timestamp: '2024-09-16T15:00:00', user: 'System', role: 'AI Engine', action: 'OPTIMIZATION_RUN', object_type: 'BlockPlan', object_id: 'PLAN-20240916', old_value: null, new_value: '3 plans generated' },
  { id: 'LOG-004', timestamp: '2024-09-16T14:00:00', user: 'SSE/Vadodara', role: 'SR. SECTION ENGINEER', action: 'BLOCK_CREATED', object_type: 'BlockWindow', object_id: 'BLK-002', old_value: null, new_value: 'WR-VL-D1 01:00–04:00' },
  { id: 'LOG-005', timestamp: '2024-09-16T12:30:00', user: 'System', role: 'AI Engine', action: 'PRIORITY_CALCULATED', object_type: 'MaintenanceTask', object_id: 'MT-2024-010', old_value: 'MEDIUM', new_value: 'HIGH (score:94)' },
  { id: 'LOG-006', timestamp: '2024-09-16T11:00:00', user: 'DEN/NFR', role: 'DIVISIONAL ENGINEER', action: 'TASK_CREATED', object_type: 'MaintenanceTask', object_id: 'MT-2024-010', old_value: null, new_value: 'Bridge — flood damage' },
  { id: 'LOG-007', timestamp: '2024-09-16T10:00:00', user: 'SSE/BH', role: 'SR. SECTION ENGINEER', action: 'APPROVAL_SUBMITTED', object_type: 'Approval', object_id: 'APR-001', old_value: 'DRAFT', new_value: 'SUBMITTED' },
  { id: 'LOG-008', timestamp: '2024-09-15T22:30:00', user: 'System', role: 'Event Monitor', action: 'EVENT_DETECTED', object_type: 'Event', object_id: 'EVT-001', old_value: null, new_value: 'Train 12951 delayed 45 min at Vadodara' },
  { id: 'LOG-009', timestamp: '2024-09-15T20:00:00', user: 'SSE/KGP', role: 'SR. SECTION ENGINEER', action: 'TASK_UPDATED', object_type: 'MaintenanceTask', object_id: 'MT-2024-015', old_value: 'PENDING', new_value: 'SCHEDULED' },
  { id: 'LOG-010', timestamp: '2024-09-15T18:00:00', user: 'Admin', role: 'SYSTEM ADMIN', action: 'SYSTEM_STARTUP', object_type: 'System', object_id: 'RAILOPT', old_value: null, new_value: 'Demo mode initialized' },
]

export const DEMO_RECOMMENDATIONS = [
  { id: 'REC-001', task_id: 'MT-2024-001', recommendation: 'Prioritize track fracture repair at BH KM 347+200', suggested_window: '22:00–03:00 (Tonight)', corridor: 'Bhusawal–Malegaon', reason: 'Safety-critical + overdue. Low train traffic after 22:00. Tamping machine available.', priority: 'HIGH', status: 'PENDING', confidence: 94 },
  { id: 'REC-002', task_id: 'MT-2024-010', recommendation: 'Emergency bridge repair must be scheduled immediately', suggested_window: '00:00–08:00 (Tonight)', corridor: 'Guwahati–Bongaigaon', reason: 'Flood-damaged pier is safety-critical. Speed restriction already imposed. Further delay increases derailment risk.', priority: 'HIGH', status: 'PENDING', confidence: 97 },
  { id: 'REC-003', task_id: 'MT-2024-004', recommendation: 'Schedule bridge girder repair at Coimbatore', suggested_window: '23:00–05:00 (Tonight)', corridor: 'Coimbatore–Erode', reason: 'Overdue safety-critical repair. Night window optimal — 2 express trains routed via alternate line.', priority: 'HIGH', status: 'PENDING', confidence: 89 },
  { id: 'REC-004', task_id: 'MT-2024-014', recommendation: 'Ultrasonic rail testing overdue at NER', suggested_window: '01:00–04:30 (Tomorrow)', corridor: 'Lucknow–Gorakhpur', reason: 'Ultrasonic test 3 weeks overdue. Internal crack risk elevated. Low traffic window identified.', priority: 'MEDIUM', status: 'PENDING', confidence: 78 },
  { id: 'REC-005', task_id: 'MT-2024-012', recommendation: 'LC gate motor repair at Bilaspur', suggested_window: '14:00–16:00 (Today)', corridor: 'Bilaspur–Raipur', reason: 'Manual operation ongoing — safety risk. Daytime block preferred. Crew available.', priority: 'HIGH', status: 'ACCEPTED', confidence: 85 },
  { id: 'REC-006', task_id: 'MT-2024-009', recommendation: 'OHE mast rectification at NWR', suggested_window: '02:00–05:00 (Tomorrow)', corridor: 'Jaipur–Ajmer', reason: 'Tilting mast risk factor increasing. Tower wagon available.', priority: 'MEDIUM', status: 'PENDING', confidence: 71 },
]

export const DEMO_EVENTS = [
  { id: 'EVT-001', event_type: 'TRAIN_DELAY', timestamp: '2024-09-16T22:30:00', description: 'Train 12951 Mumbai Rajdhani delayed 45 min at Vadodara due to signal failure', severity: 'MEDIUM', affected_blocks: ['BLK-002'], affected_trains: ['12951'], status: 'ACKNOWLEDGED', recommendation: 'Adjust block BLK-002 start time by 45 minutes.' },
  { id: 'EVT-002', event_type: 'EMERGENCY_DEFECT', timestamp: '2024-09-16T08:15:00', description: 'Emergency rail fracture at Guwahati reported by loco pilot of 15929', severity: 'HIGH', affected_blocks: ['BLK-004'], affected_trains: ['15929'], status: 'ACTIVE', recommendation: 'Immediate block sanctioned. Reroute 15929 via alternate route.' },
]

export const DEMO_ASSETS_GIS = [
  { asset_id: 'TRK-CR-BH-001', asset_type: 'Track', location: 'Bhusawal–Malegaon', zone: 'CR', condition: 'POOR', risk_score: 87, last_maintenance: '2024-06-15', next_maintenance: '2024-09-17', status: 'RESTRICTED', lat: 21.0421, lng: 75.7722 },
  { asset_id: 'OHE-WR-VL-009', asset_type: 'OHE Wire', location: 'Vadodara–Anand', zone: 'WR', condition: 'FAIR', risk_score: 79, last_maintenance: '2024-07-20', next_maintenance: '2024-09-17', status: 'MONITORING', lat: 22.3072, lng: 73.1812 },
  { asset_id: 'BRG-SR-CBE-007', asset_type: 'Bridge', location: 'Coimbatore–Erode', zone: 'SR', condition: 'CRITICAL', risk_score: 91, last_maintenance: '2024-05-10', next_maintenance: '2024-09-17', status: 'RESTRICTED', lat: 11.0168, lng: 76.9558 },
  { asset_id: 'BRG-NFR-GHY-002', asset_type: 'Bridge', location: 'Guwahati–Bongaigaon', zone: 'NFR', condition: 'CRITICAL', risk_score: 94, last_maintenance: '2024-04-15', next_maintenance: '2024-09-17', status: 'BLOCKED', lat: 26.1445, lng: 91.7362 },
  { asset_id: 'SIG-NR-MB-022', asset_type: 'Signal', location: 'Moradabad–Rampur', zone: 'NR', condition: 'FAIR', risk_score: 65, last_maintenance: '2024-08-01', next_maintenance: '2024-09-18', status: 'MONITORING', lat: 28.8386, lng: 78.7733 },
  { asset_id: 'TRD-SCR-SC-011', asset_type: 'Traction Substation', location: 'Secunderabad–Kazipet', zone: 'SCR', condition: 'FAIR', risk_score: 73, last_maintenance: '2024-07-30', next_maintenance: '2024-09-19', status: 'MONITORING', lat: 17.4399, lng: 78.4983 },
  { asset_id: 'TRK-SER-KGP-008', asset_type: 'Track', location: 'Kharagpur–Balasore', zone: 'SER', condition: 'POOR', risk_score: 81, last_maintenance: '2024-06-20', next_maintenance: '2024-09-18', status: 'RESTRICTED', lat: 22.3460, lng: 87.3119 },
  { asset_id: 'SIG-SWR-BNG-055', asset_type: 'Point Machine', location: 'Bangalore–Tumkur', zone: 'SWR', condition: 'FAIR', risk_score: 58, last_maintenance: '2024-08-10', next_maintenance: '2024-09-17', status: 'MONITORING', lat: 13.0827, lng: 77.5877 },
  { asset_id: 'TRK-ECR-DNR-024', asset_type: 'Track', location: 'Danapur–Ara', zone: 'ECR', condition: 'GOOD', risk_score: 29, last_maintenance: '2024-09-01', next_maintenance: '2024-09-21', status: 'OPERATIONAL', lat: 25.6139, lng: 84.9756 },
  { asset_id: 'TRK-NR-DLI-012', asset_type: 'Track', location: 'Delhi–Ghaziabad', zone: 'NR', condition: 'GOOD', risk_score: 22, last_maintenance: '2024-09-05', next_maintenance: '2024-10-05', status: 'OPERATIONAL', lat: 28.7041, lng: 77.1025 },
  { asset_id: 'SIG-SECR-BSP-017', asset_type: 'Level Crossing', location: 'Bilaspur–Raipur', zone: 'SECR', condition: 'FAIR', risk_score: 76, last_maintenance: '2024-08-15', next_maintenance: '2024-09-17', status: 'MONITORING', lat: 22.0797, lng: 82.1391 },
  { asset_id: 'OHE-NWR-JP-003', asset_type: 'OHE Mast', location: 'Jaipur–Ajmer', zone: 'NWR', condition: 'FAIR', risk_score: 66, last_maintenance: '2024-08-05', next_maintenance: '2024-09-18', status: 'MONITORING', lat: 26.9124, lng: 75.7873 },
]
