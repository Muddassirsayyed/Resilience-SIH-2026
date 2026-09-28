// ============================================================
// Railway Control Office — Mock Data
// Structured for future API replacement
// ============================================================

// Station definitions for the operational schematic
export const stations = [
  { id: 'KNP', name: 'Kanpur Central', code: 'CNB', x: 80, y: 200 },
  { id: 'ETW', name: 'Etawah', code: 'ETW', x: 280, y: 200 },
  { id: 'TDL', name: 'Tundla Jn', code: 'TDL', x: 480, y: 200 },
  { id: 'AGC', name: 'Agra Cantt', code: 'AGC', x: 680, y: 200 },
  { id: 'MTJ', name: 'Mathura Jn', code: 'MTJ', x: 880, y: 200 },
  // Branch line from Tundla
  { id: 'AH', name: 'Aligarh Jn', code: 'ALJN', x: 480, y: 80 },
  { id: 'FBD', name: 'Firozabad', code: 'FBD', x: 580, y: 320 },
  // Branch from Kanpur
  { id: 'UNO', name: 'Unnao Jn', code: 'UNO', x: 80, y: 80 },
  { id: 'LKO', name: 'Lucknow', code: 'LKO', x: 80, y: -20 },
]

// Railway sections connecting stations
export const sections = [
  {
    id: 'KNP-01',
    from: 'KNP',
    to: 'ETW',
    status: 'available',
    distance: 137,
    maxSpeed: 130,
  },
  {
    id: 'KNP-02',
    from: 'ETW',
    to: 'TDL',
    status: 'movement',
    distance: 98,
    maxSpeed: 120,
  },
  {
    id: 'KNP-03',
    from: 'TDL',
    to: 'AGC',
    status: 'available',
    distance: 42,
    maxSpeed: 110,
  },
  {
    id: 'KNP-04',
    from: 'AGC',
    to: 'MTJ',
    status: 'maintenance',
    distance: 54,
    maxSpeed: 100,
    block: {
      startTime: '22:00',
      endTime: '03:00',
      departments: ['Engineering', 'S&T'],
      tasks: ['Track inspection', 'Signal maintenance'],
      authority: 'DEN/AGC',
    },
  },
  {
    id: 'KNP-05',
    from: 'TDL',
    to: 'AH',
    status: 'movement',
    distance: 72,
    maxSpeed: 110,
  },
  {
    id: 'KNP-06',
    from: 'TDL',
    to: 'FBD',
    status: 'restricted',
    distance: 38,
    maxSpeed: 60,
  },
  {
    id: 'KNP-07',
    from: 'KNP',
    to: 'UNO',
    status: 'critical',
    distance: 18,
    maxSpeed: 80,
    block: {
      startTime: '00:30',
      endTime: '04:30',
      departments: ['Engineering', 'S&T', 'Traction'],
      tasks: ['OHE maintenance', 'Track tamping'],
      authority: 'DEN/CNB',
    },
  },
  {
    id: 'KNP-08',
    from: 'UNO',
    to: 'LKO',
    status: 'available',
    distance: 62,
    maxSpeed: 130,
  },
]

// Active trains on the network
export const trains = [
  {
    id: '12904',
    number: '12904',
    name: 'Goldn Temple Shatabdi',
    type: 'Express',
    direction: 'up', // toward MTJ
    currentSection: 'KNP-04',
    fromStation: 'AGC',
    toStation: 'MTJ',
    status: 'on-time',
    speed: 0,
    scheduledTime: '22:35',
    delay: 0,
    progress: 0.35,
  },
  {
    id: '12311',
    number: '12311',
    name: 'Kalka Mail',
    type: 'Express',
    direction: 'down', // toward KNP
    currentSection: 'KNP-02',
    fromStation: 'TDL',
    toStation: 'ETW',
    status: 'delayed',
    speed: 85,
    scheduledTime: '21:45',
    delay: 12,
    progress: 0.55,
  },
  {
    id: 'G7821',
    number: 'G/7821',
    name: 'Goods Rake',
    type: 'Goods',
    direction: 'up',
    currentSection: 'KNP-05',
    fromStation: 'TDL',
    toStation: 'AH',
    status: 'on-route',
    speed: 45,
    scheduledTime: '20:00',
    delay: 0,
    progress: 0.4,
  },
  {
    id: '12001',
    number: '12001',
    name: 'Bhopal Shatabdi',
    type: 'Superfast',
    direction: 'up',
    currentSection: 'KNP-01',
    fromStation: 'KNP',
    toStation: 'ETW',
    status: 'on-time',
    speed: 120,
    scheduledTime: '06:15',
    delay: 0,
    progress: 0.7,
  },
  {
    id: '14853',
    number: '14853',
    name: 'Marudhar Express',
    type: 'Express',
    direction: 'down',
    currentSection: 'KNP-03',
    fromStation: 'AGC',
    toStation: 'TDL',
    status: 'on-time',
    speed: 95,
    scheduledTime: '23:10',
    delay: 0,
    progress: 0.2,
  },
  {
    id: 'G9402',
    number: 'G/9402',
    name: 'Container Spl',
    type: 'Goods',
    direction: 'up',
    currentSection: 'KNP-07',
    fromStation: 'KNP',
    toStation: 'UNO',
    status: 'halted',
    speed: 0,
    scheduledTime: '01:00',
    delay: 0,
    progress: 0.5,
  },
]

// Train conflicts
export const conflicts = [
  {
    id: 'CONF-001',
    trainId: '12904',
    trainNumber: '12904',
    trainName: 'Goldn Temple Shatabdi',
    trainType: 'Express',
    sectionId: 'KNP-04',
    scheduledTime: '22:35',
    blockStartTime: '22:00',
    blockEndTime: '03:00',
    impact: 'Train movement may be affected due to ongoing maintenance block.',
    severity: 'critical',
    status: 'pending-review',
  },
  {
    id: 'CONF-002',
    trainId: 'G9402',
    trainNumber: 'G/9402',
    trainName: 'Container Spl',
    trainType: 'Goods',
    sectionId: 'KNP-07',
    scheduledTime: '01:00',
    blockStartTime: '00:30',
    blockEndTime: '04:30',
    impact: 'Goods train halted. Route clearance required.',
    severity: 'warning',
    status: 'pending-review',
  },
]

// Live alerts
export const alerts = [
  {
    id: 'ALT-001',
    severity: 'critical',
    message: 'Track defect detected',
    location: 'KNP-07',
    time: '2 min ago',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'ALT-002',
    severity: 'warning',
    message: 'Train delay detected',
    location: '12311 Kalka Mail',
    time: '8 min ago',
    detail: '12 min delay',
    timestamp: Date.now() - 480000,
  },
  {
    id: 'ALT-003',
    severity: 'info',
    message: 'Maintenance block started',
    location: 'KNP-07',
    time: '00:30',
    timestamp: Date.now() - 600000,
  },
  {
    id: 'ALT-004',
    severity: 'warning',
    message: 'Speed restriction imposed',
    location: 'KNP-06',
    time: '15 min ago',
    detail: '60 km/h max',
    timestamp: Date.now() - 900000,
  },
  {
    id: 'ALT-005',
    severity: 'info',
    message: 'Goods train cleared section',
    location: 'KNP-01',
    time: '22 min ago',
    timestamp: Date.now() - 1320000,
  },
]

// Network statistics
export const networkStats = {
  activeTrains: 128,
  activeBlocks: 7,
  criticalSections: 2,
  delayedTrains: 5,
  availableSections: 94.7,
}

// Filter options
export const divisions = [
  { id: 'all', name: 'All Divisions' },
  { id: 'agra', name: 'Agra Division' },
  { id: 'allahabad', name: 'Prayagraj Division' },
  { id: 'lucknow', name: 'Lucknow Division' },
  { id: 'moradabad', name: 'Moradabad Division' },
]

export const sectionFilters = [
  { id: 'all', name: 'All Sections' },
  { id: 'mainline', name: 'Main Line' },
  { id: 'branch', name: 'Branch Lines' },
  { id: 'loop', name: 'Loop Lines' },
]

// Status color mapping
export const statusColors = {
  available: { bg: '#22c55e', text: '#166534', label: 'Available' },
  maintenance: { bg: '#f59e0b', text: '#92400e', label: 'Maintenance Block' },
  critical: { bg: '#ef4444', text: '#991b1b', label: 'Critical' },
  movement: { bg: '#3b82f6', text: '#1e40af', label: 'Train Movement' },
  restricted: { bg: '#f97316', text: '#9a3412', label: 'Restricted' },
}

// Section detail data (for panel)
export const sectionDetails = {
  'KNP-01': {
    name: 'Kanpur - Etawah',
    status: 'available',
    availability: 98.2,
    assets: ['Track', 'Signal', 'OHE', 'Telecom'],
    affectedTrains: 1,
    departments: [],
    lastInspection: '06 Sep 2026',
  },
  'KNP-02': {
    name: 'Etawah - Tundla',
    status: 'movement',
    availability: 96.5,
    assets: ['Track', 'Signal', 'OHE'],
    affectedTrains: 1,
    departments: [],
    lastInspection: '05 Sep 2026',
  },
  'KNP-03': {
    name: 'Tundla - Agra',
    status: 'available',
    availability: 97.8,
    assets: ['Track', 'Signal', 'OHE', 'Telecom'],
    affectedTrains: 1,
    departments: [],
    lastInspection: '07 Sep 2026',
  },
  'KNP-04': {
    name: 'Agra - Mathura',
    status: 'maintenance',
    availability: 92.0,
    assets: ['Track', 'Signal', 'OHE'],
    affectedTrains: 2,
    departments: ['Engineering', 'S&T', 'Traction'],
    lastInspection: '04 Sep 2026',
    block: {
      startTime: '22:00',
      endTime: '03:00',
      departments: ['Engineering', 'S&T'],
      tasks: ['Track inspection', 'Signal maintenance'],
    },
  },
  'KNP-05': {
    name: 'Tundla - Aligarh',
    status: 'movement',
    availability: 95.3,
    assets: ['Track', 'Signal'],
    affectedTrains: 1,
    departments: [],
    lastInspection: '06 Sep 2026',
  },
  'KNP-06': {
    name: 'Tundla - Firozabad',
    status: 'restricted',
    availability: 88.1,
    assets: ['Track', 'Signal', 'OHE'],
    affectedTrains: 0,
    departments: ['Engineering'],
    lastInspection: '03 Sep 2026',
  },
  'KNP-07': {
    name: 'Kanpur - Unnao',
    status: 'critical',
    availability: 78.5,
    assets: ['Track', 'Signal', 'OHE'],
    affectedTrains: 1,
    departments: ['Engineering', 'S&T', 'Traction'],
    lastInspection: '07 Sep 2026',
    block: {
      startTime: '00:30',
      endTime: '04:30',
      departments: ['Engineering', 'S&T', 'Traction'],
      tasks: ['OHE maintenance', 'Track tamping'],
    },
  },
  'KNP-08': {
    name: 'Unnao - Lucknow',
    status: 'available',
    availability: 99.1,
    assets: ['Track', 'Signal', 'OHE', 'Telecom'],
    affectedTrains: 0,
    departments: [],
    lastInspection: '07 Sep 2026',
  },
}

// ============================================================
// Dashboard-specific data
// ============================================================

// Critical issues for dashboard
export const criticalIssues = [
  {
    id: 'CI-001',
    severity: 'critical',
    title: 'Track Defect',
    section: 'KNP-04',
    department: 'Engineering / Track',
    detectedAgo: '18 min ago',
    action: 'Review Block',
  },
  {
    id: 'CI-002',
    severity: 'high',
    title: 'Signal Failure Risk',
    section: 'KNP-07',
    department: 'S&T',
    detectedAgo: '32 min ago',
    action: 'Review',
  },
  {
    id: 'CI-003',
    severity: 'high',
    title: 'OHE Maintenance Due',
    section: 'KNP-03',
    department: 'Traction',
    detectedAgo: '1 hr ago',
    action: 'Schedule Maintenance',
  },
]

// AI Recommendation
export const aiRecommendation = {
  id: 'REC-001',
  title: 'Combine 3 maintenance activities into one block',
  section: 'KNP-04',
  window: '22:00 – 03:00',
  departments: ['Engineering', 'S&T', 'Traction'],
  reason:
    'All three activities require access to the same corridor. Combining them reduces repeated blocks and keeps the section available for train operations during the day.',
  impact: 'Estimated 2.5 hours additional asset availability.',
  status: 'recommended',
}

// Maintenance timeline blocks for dashboard
export const maintenanceTimeline = [
  { id: 'MB-001', section: 'KNP-02', department: 'Engineering', start: '20:00', end: '21:30', color: '#3b82f6' },
  { id: 'MB-002', section: 'KNP-04', department: 'Engineering + S&T', start: '22:00', end: '03:00', color: '#f59e0b' },
  { id: 'MB-003', section: 'KNP-07', department: 'Traction', start: '00:30', end: '02:00', color: '#ef4444' },
]

// ============================================================
// AI Priority Center - Mock Data
// ============================================================

export const priorityStats = {
  critical: 4,
  high: 7,
  medium: 9,
  low: 4,
  immediateAttention: 4,
  blockRecommended: 8,
  lastAnalysis: 'Just now',
  tasksAnalyzed: 24
}

export const priorityTasks = [
  {
    id: 'PT-001',
    rank: 1,
    priority: 'CRITICAL',
    taskName: 'Track Defect',
    sectionId: 'KNP-04',
    asset: 'Rail Joint RJ-44',
    department: 'Engineering',
    urgency: 'Immediate',
    trainImpact: 2,
    blockRequired: true,
    aiReason: 'Safety-related defect with high asset impact. The section has 2 scheduled train movements during the expected maintenance period.',
    detectedTime: '10:22',
    estimatedDuration: '2 hours',
    assetImpact: 'HIGH',
    criticality: 'HIGH',
    aiRecommendationDetail: 'Prioritize this task before other planned maintenance because it is safety-related and affects a heavily used corridor.',
  },
  {
    id: 'PT-002',
    rank: 2,
    priority: 'CRITICAL',
    taskName: 'Signal Failure Risk',
    sectionId: 'KNP-07',
    asset: 'Signal S-104',
    department: 'S&T',
    urgency: 'Immediate',
    trainImpact: 1,
    blockRequired: true,
    aiReason: 'Failure could restrict train movement. Immediate intervention prevents cascading delays.',
    detectedTime: '09:15',
    estimatedDuration: '1.5 hours',
    assetImpact: 'HIGH',
    criticality: 'HIGH',
    aiRecommendationDetail: 'Address immediately to prevent complete signal failure. Can be combined with other S&T tasks in the area.',
  },
  {
    id: 'PT-003',
    rank: 3,
    priority: 'HIGH',
    taskName: 'OHE Maintenance',
    sectionId: 'KNP-03',
    asset: 'OHE Mast 44',
    department: 'Traction',
    urgency: 'Today',
    trainImpact: 3,
    blockRequired: true,
    aiReason: 'Overdue traction maintenance with high corridor utilization. Risk of power trip if delayed further.',
    detectedTime: 'Yesterday',
    estimatedDuration: '3 hours',
    assetImpact: 'MEDIUM',
    criticality: 'MEDIUM',
    aiRecommendationDetail: 'Schedule within the next 24 hours. High traffic corridor means block timing must be optimized.',
  },
  {
    id: 'PT-004',
    rank: 4,
    priority: 'HIGH',
    taskName: 'Track Inspection',
    sectionId: 'KNP-06',
    asset: 'Track T-22',
    department: 'Engineering',
    urgency: 'Today',
    trainImpact: 0,
    blockRequired: false,
    aiReason: 'Maintenance can be completed without a traffic block. Routine inspection is due.',
    detectedTime: '08:00',
    estimatedDuration: '1 hour',
    assetImpact: 'LOW',
    criticality: 'LOW',
    aiRecommendationDetail: 'Can be performed during regular operating hours with caution order.',
  },
  {
    id: 'PT-005',
    rank: 5,
    priority: 'MEDIUM',
    taskName: 'Point Machine Service',
    sectionId: 'KNP-01',
    asset: 'Point P-12',
    department: 'S&T',
    urgency: 'Next 3 Days',
    trainImpact: 0,
    blockRequired: false,
    aiReason: 'Routine preventative maintenance. No immediate operational risk.',
    detectedTime: '2 Days Ago',
    estimatedDuration: '45 mins',
    assetImpact: 'LOW',
    criticality: 'LOW',
    aiRecommendationDetail: 'Include in next available maintenance window for this section.',
  }
]

// ============================================================
// Conflict Resolution - Mock Data
// ============================================================

export const conflictStats = {
  activeConflicts: 2,
  critical: 1,
  high: 1,
  affectedTrains: 3,
  blocksRequiringReview: 2,
  resolvedToday: 5,
}

export const activeConflictsData = [
  {
    id: 'CR-104',
    severity: 'CRITICAL',
    trainId: 'EXP 12904',
    trainType: 'Express',
    blockId: 'KNP-04',
    section: 'Station C → Station D',
    sectionId: 'KNP-04',
    trainTime: '22:35',
    blockTime: '22:00–03:00',
    impact: 'Train movement overlaps maintenance block.',
    status: 'Requires Review',
    affectedTrains: 3,
    maintenanceTasks: ['Track Defect', 'Signal Inspection', 'OHE Inspection'],
    departments: ['Engineering', 'S&T', 'Traction'],
    conflictDescription: 'The scheduled train movement overlaps the proposed maintenance block.',
  },
  {
    id: 'CR-105',
    severity: 'HIGH',
    trainId: 'EXP 12311',
    trainType: 'Express',
    blockId: 'KNP-07',
    section: 'Station D → Station E',
    sectionId: 'KNP-07',
    trainTime: '23:50',
    blockTime: '23:30–02:00',
    impact: 'Train movement may be delayed.',
    status: 'Requires Review',
    affectedTrains: 1,
    maintenanceTasks: ['OHE Routine Check'],
    departments: ['Traction'],
    conflictDescription: 'Train is scheduled shortly after block start. Risk of delay if maintenance runs late.',
  }
]

export const resolvedConflictsData = [
  {
    id: 'CR-098',
    sectionId: 'KNP-03',
    trainId: 'EXP 12904',
    status: 'Resolved',
    resolution: 'Block moved from 21:00 to 03:00',
    time: '10:14',
    controller: 'Div. Controller'
  },
  {
    id: 'CR-096',
    sectionId: 'KNP-07',
    trainId: 'EXP 12311',
    status: 'Resolved',
    resolution: 'Maintenance split into two windows',
    time: '09:22',
    controller: 'Div. Controller'
  }
]

export const aiResolutionOptions = {
  'CR-104': {
    recommended: 'A',
    options: [
      {
        id: 'A',
        title: 'Move Maintenance Block',
        newWindow: '03:30–08:30',
        trainConflicts: 0,
        assetAvailability: 'Acceptable',
        reason: 'No scheduled train movement overlaps this window. Full maintenance duration available.',
        benefits: ['No scheduled train conflict', 'Same railway section', 'Full maintenance duration available', 'Safety-critical work can be completed', 'Lower operational disruption']
      },
      {
        id: 'B',
        title: 'Shorten Maintenance Block',
        newWindow: '22:00–00:30',
        trainConflicts: 1,
        maintenance: 'Only critical track work',
        reason: 'Complete the safety-critical task first and schedule remaining work separately.',
        benefits: []
      },
      {
        id: 'C',
        title: 'Keep Current Block',
        newWindow: '22:00–03:00',
        trainConflicts: 3,
        status: 'Controller review required',
        reason: 'Proceed with the block but halt/reroute trains. Significant operational impact.',
        benefits: []
      }
    ]
  }
}


// ============================================================
// Block Planning - Mock Data
// ============================================================

export const planningStats = {
  pendingMaintenance: 11,
  availableWindows: 6,
  recommendedBlocks: 4,
  trainConflicts: 2,
  controllerReview: 4,
}

export const planningTasks = [
  {
    id: 'MT-1042',
    taskName: 'Track Defect',
    sectionId: 'KNP-04',
    department: 'Engineering',
    durationMinutes: 120, // 2 hrs
    priority: 'CRITICAL',
    blockRequired: true,
  },
  {
    id: 'MT-1045',
    taskName: 'Signal Inspection',
    sectionId: 'KNP-04',
    department: 'S&T',
    durationMinutes: 60, // 1 hr
    priority: 'HIGH',
    blockRequired: true,
  },
  {
    id: 'MT-1051',
    taskName: 'OHE Inspection',
    sectionId: 'KNP-04',
    department: 'Traction',
    durationMinutes: 120, // 2 hrs
    priority: 'HIGH',
    blockRequired: true,
  },
  {
    id: 'MT-1062',
    taskName: 'Track Geometry Check',
    sectionId: 'KNP-06',
    department: 'Engineering',
    durationMinutes: 90, // 90 min
    priority: 'MEDIUM',
    blockRequired: true,
  },
]

export const availableWindows = [
  {
    id: 'AW-001',
    sectionId: 'KNP-02',
    startTime: '20:00',
    endTime: '21:30',
    durationMinutes: 90,
    status: 'AVAILABLE',
  },
  {
    id: 'AW-002',
    sectionId: 'KNP-04',
    startTime: '22:00',
    endTime: '03:00',
    durationMinutes: 300,
    status: 'AVAILABLE',
  },
  {
    id: 'AW-003',
    sectionId: 'KNP-07',
    startTime: '00:30',
    endTime: '02:00',
    durationMinutes: 90,
    status: 'AVAILABLE',
  },
]

export const windowTrainMovements = [
  {
    trainId: '12904',
    trainName: 'EXP 12904',
    scheduledTime: '22:35',
    status: 'Scheduled',
    conflict: true,
  },
  {
    trainId: '12311',
    trainName: 'EXP 12311',
    scheduledTime: '23:50',
    status: 'Scheduled',
    conflict: true,
  },
  {
    trainId: 'G7821',
    trainName: 'GOODS G/7821',
    scheduledTime: '01:20',
    status: 'Scheduled',
    conflict: true,
  },
]

// ============================================================
// Maintenance Planner (Weekly/Monthly) - Mock Data
// ============================================================

export const plannerStats = {
  plannedTasks: 24,
  plannedBlocks: 12,
  pendingApproval: 4,
  criticalPending: 2,
  trainConflicts: 3,
  overdueWork: 5,
  assetAvailability: 94.7,
}

export const weeklyBlocks = [
  {
    id: 'WB-101',
    day: 'MONDAY',
    date: '2026-09-07',
    sectionId: 'KNP-02',
    startTime: '20:00',
    endTime: '22:00',
    durationMinutes: 120,
    departments: ['Engineering'],
    tasks: ['Track Inspection'],
    status: 'APPROVED',
    trainConflicts: 0,
    affectedTrains: 1,
    priority: 'LOW',
  },
  {
    id: 'WB-102',
    day: 'MONDAY',
    date: '2026-09-07',
    sectionId: 'KNP-04',
    startTime: '22:00',
    endTime: '03:00',
    durationMinutes: 300,
    departments: ['Engineering', 'S&T', 'Traction'],
    tasks: ['Track Defect', 'Signal Inspection', 'OHE Inspection'],
    status: 'AI RECOMMENDED',
    trainConflicts: 1,
    affectedTrains: 3,
    priority: 'CRITICAL',
  },
  {
    id: 'WB-103',
    day: 'TUESDAY',
    date: '2026-09-08',
    sectionId: 'KNP-07',
    startTime: '23:00',
    endTime: '02:00',
    durationMinutes: 180,
    departments: ['Traction'],
    tasks: ['OHE Inspection'],
    status: 'CONTROLLER REVIEW',
    trainConflicts: 0,
    affectedTrains: 2,
    priority: 'HIGH',
  },
  {
    id: 'WB-104',
    day: 'WEDNESDAY',
    date: '2026-09-09',
    sectionId: 'KNP-03',
    startTime: '22:30',
    endTime: '01:30',
    durationMinutes: 180,
    departments: ['Engineering'],
    tasks: ['Track Maintenance'],
    status: 'DRAFT',
    trainConflicts: 0,
    affectedTrains: 0,
    priority: 'MEDIUM',
  }
]

export const monthlyWorkload = {
  departments: [
    { name: 'Engineering / Track', tasks: 18, blocks: 9, critical: 3 },
    { name: 'S&T', tasks: 12, blocks: 6, critical: 2 },
    { name: 'Traction', tasks: 12, blocks: 7, critical: 1 },
  ],
  sections: [
    { sectionId: 'KNP-04', blocks: 5, tasks: 12, conflicts: 3 },
    { sectionId: 'KNP-07', blocks: 4, tasks: 8, conflicts: 1 },
    { sectionId: 'KNP-03', blocks: 3, tasks: 7, conflicts: 0 },
  ]
}

export const overdueWork = [
  { id: 'OD-01', task: 'Track Defect', sectionId: 'KNP-06', overdueTime: 'Overdue 1 day', department: 'Engineering', priority: 'CRITICAL' },
  { id: 'OD-02', task: 'OHE Inspection', sectionId: 'KNP-03', overdueTime: 'Overdue 3 hrs', department: 'Traction', priority: 'HIGH' },
  { id: 'OD-03', task: 'Signal Testing', sectionId: 'KNP-07', overdueTime: 'Overdue 5 hrs', department: 'S&T', priority: 'HIGH' },
]

export const pendingMaintenanceTasks = [
  { id: 'MT-1042', task: 'Track Defect', sectionId: 'KNP-04', priority: 'CRITICAL', duration: '2 hrs', department: 'Engineering' },
  { id: 'MT-1045', task: 'Signal Inspection', sectionId: 'KNP-04', priority: 'HIGH', duration: '1 hr', department: 'S&T' },
  { id: 'MT-1051', task: 'OHE Inspection', sectionId: 'KNP-04', priority: 'HIGH', duration: '2 hrs', department: 'Traction' },
]

// ============================================================
// Monitoring & Reports - Mock Data
// ============================================================

export const monitoringStats = {
  activeTrains: 128,
  activeBlocks: 7,
  criticalSections: 2,
  delayedTrains: 5,
  affectedTrains: 3,
  assetAvailability: 94.7,
}

export const liveTrainMovements = [
  { trainId: '12904', section: 'KNP-04', direction: '→', scheduledTime: '22:35', status: 'On Time', impact: 'None' },
  { trainId: '12311', section: 'KNP-07', direction: '←', scheduledTime: '23:50', status: 'Delayed 12 min', impact: 'Block' },
  { trainId: 'G/7821', section: 'KNP-04', direction: '→', scheduledTime: '01:20', status: 'On Route', impact: 'Review' },
]

export const activeBlocks = [
  { id: 'KNP-04', time: '22:00–03:00', departments: 'Engineering + S&T', tasks: 'Track + Signal', status: 'ACTIVE', affectedTrains: 2 },
  { id: 'KNP-07', time: '00:30–02:00', departments: 'Traction', tasks: 'OHE Inspection', status: 'ACTIVE', affectedTrains: 1 },
]

export const liveAlerts = [
  { id: 1, severity: 'CRITICAL', event: 'Track defect detected', location: 'KNP-04', time: '2 min ago' },
  { id: 2, severity: 'WARNING', event: 'Train 12904 delayed 12 min', location: 'KNP-07', time: '5 min ago' },
  { id: 3, severity: 'WARNING', event: 'Maintenance block approaching', location: 'KNP-03', time: 'Starts in 20 min' },
  { id: 4, severity: 'INFO', event: 'Block completed', location: 'KNP-02', time: '10 min ago' },
]

export const assetAvailabilityReport = {
  track: 96.2,
  signal: 94.8,
  ohe: 93.1,
  overall: 94.7,
}

export const performanceSummary = {
  assetAvailability: 94.7,
  maintenanceBlocks: 42,
  completedBlocks: 35,
  cancelledBlocks: 2,
  trainConflicts: 7,
  resolvedConflicts: 5,
  overdueTasks: 5,
  tasksCompleted: 38,
}

export const reportTableData = [
  { date: '08 Sep', section: 'KNP-04', maintenance: 'Track + Signal', block: '22:00–03:00', duration: '5 hrs', trainImpact: '2 trains', status: 'Completed' },
  { date: '07 Sep', section: 'KNP-07', maintenance: 'OHE', block: '00:30–02:00', duration: '1.5 hrs', trainImpact: '1 train', status: 'Completed' },
  { date: '06 Sep', section: 'KNP-02', maintenance: 'Track', block: '20:00–22:00', duration: '2 hrs', trainImpact: '0 trains', status: 'Completed' },
  { date: '06 Sep', section: 'KNP-03', maintenance: 'Signal', block: '01:00–03:00', duration: '2 hrs', trainImpact: '1 train', status: 'Cancelled' },
]
