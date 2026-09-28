export interface BlockPlanItem {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  assigned_tasks: string[];
  status: string;
  section_code?: string;
  priority?: string;
}

export interface ConflictAlertItem {
  id: string;
  task: string;
  train: string;
  location?: string;
  overlap_start: string;
  overlap_end: string;
  conflict_type: string;
  severity: string;
  impact?: string;
  status: string;
}

export interface PlanGenerateResponse {
  success: boolean;
  message: string;
  before_conflict_count: number;
  after_conflict_count: number;
  conflicts_resolved: number;
  optimization_score: string;
  generated_at: string;
}

export interface MaintenanceTask {
  id: string;
  department: string;
  asset_id: string;
  location: string;
  section_code: string;
  defect_description: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimated_duration_hrs: number;
  preferred_date: string;
  time_window: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  safety_constraints: string[];
  status: 'PENDING' | 'BUNDLED' | 'COMPLETED';
}

export interface AssetDefectItem {
  id: string;
  asset_id: string;
  asset_name: string;
  department: string;
  location: string;
  corridor: string;
  defect: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string;
  status: 'ACTIVE_DEFECT' | 'SCHEDULED' | 'RESOLVED';
  recommended_block_id?: string;
  criticality_score: number;
}

export interface BundledTaskDetail {
  task_id: string;
  department: string;
  description: string;
  duration_hrs: number;
}

export interface BlockRecommendation {
  id: string;
  block_code: string;
  corridor: string;
  section_code: string;
  date: string;
  time_window: string;
  departments: string[];
  bundled_tasks: BundledTaskDetail[];
  duration_hours: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimated_savings_hours: number;
  operational_impact: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  safety_validation: string;
  approval_disclaimer: string;
}

export interface DashboardStats {
  total_maintenance_tasks: number;
  pending_defects: number;
  high_risk_assets: number;
  planned_blocks: number;
  active_blocks: number;
  completed_blocks: number;
  estimated_block_hours_saved: number;
  asset_downtime_reduction_percent: number;
  train_operation_impact: string;
  department_workload: {
    [key: string]: number;
  };
  is_demo_data: boolean;
}

export interface OptimizationResult {
  success: boolean;
  algorithm: string;
  total_tasks_processed: number;
  blocks_avoided: number;
  original_total_hours: number;
  bundled_total_hours: number;
  estimated_hours_saved: number;
  optimization_score: string;
  safety_constraints_satisfied: boolean;
  bundled_blocks: {
    section_code: string;
    corridor: string;
    tasks_bundled_count: number;
    departments: string[];
    original_separate_hours: number;
    bundled_block_hours: number;
    hours_saved: number;
  }[];
  timestamp: string;
  title: string;
  location: string;
  section_code?: string;
  department: string;
  duration_hours?: number;
  criticality: number;
  safety: number;
  overdue: number;
  train_impact: number;
  asset_impact: number;
  status?: string;
  description?: string;
}

export interface PrioritizedTask extends MaintenanceTask {
  priority_score: number;
}

export interface PrioritizedTasksResponse {
  success: boolean;
  total: number;
  data: PrioritizedTask[];
  grouped?: Record<string, Record<string, PrioritizedTask[]>>;
}

export type DisruptionType =
  | 'train_delay'
  | 'train_cancellation'
  | 'emergency_blockage'
  | 'window_closure'
  | 'resource_reduction';

export interface Disruption {
  type: DisruptionType;
  train_id?: string;
  delay_minutes?: number;
  section_code?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  window_id?: string;
  closure_type?: 'full' | 'shorten';
  new_end_time?: string;
  resource_type?: 'crew' | 'machine';
  type_name?: string;
  new_capacity?: number;
}

export interface ScenarioCreateRequest {
  name: string;
  description?: string;
  disruptions: Disruption[];
}

export interface ChangedTaskItem {
  task_id: string;
  task_title: string;
  base_window?: string;
  scenario_window?: string;
  base_start?: string;
  scenario_start?: string;
  base_end?: string;
  scenario_end?: string;
  status: 'UNCHANGED' | 'MOVED' | 'REMOVED' | 'NEW';
}

export interface WhatIfComparison {
  tasks_scheduled_base: number;
  tasks_scheduled_scenario: number;
  tasks_new: string[];
  tasks_removed: string[];
  tasks_moved: string[];
  tasks_unchanged: string[];
  changed_tasks: ChangedTaskItem[];
  conflicts_before: number;
  conflicts_after: number;
  conflicts_resolved: number;
  newly_introduced_conflicts: number;
  optimization_score: string;
  scheduler_type: string;
  resource_impact?: Record<string, any>;
}

export interface ScenarioItem {
  scenario_id: string;
  name: string;
  description: string;
  disruptions: Disruption[];
  created_at: string;
  status: 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: WhatIfComparison;
}

export interface NetworkSection {
  section_id: string;
  section_name: string;
  corridor_id: string;
  location: string;
  sequence: number;
  adjacent_sections: string[];
  electrified: boolean;
  tracks: number;
  max_speed_kmh?: number;
  is_junction?: boolean;
  start_station?: string;
  end_station?: string;
  length_km?: number;
  signaling_type?: string;
  description?: string;
  connected_junctions?: string[];
}

export interface NetworkCorridor {
  corridor_id: string;
  name: string;
  corridor_name?: string;
  zone?: string;
  line_classification?: string;
  origin_station?: string;
  destination_station?: string;
  total_distance_km?: number;
  sections: NetworkSection[];
  junction_sections?: string[];
  description?: string;
}

export interface NetworkTopologyResponse {
  corridors: NetworkCorridor[];
}

export interface NetworkImpactRequest {
  section_id: string;
  start_time: string;
  end_time: string;
  impact_type?: string;
  include_adjacent?: boolean;
  radius_hops?: number;
}

export interface NetworkImpactAffectedBlock {
  task_id: string;
  department: string;
  work_type: string;
  scheduled_start: string;
  scheduled_end: string;
  section_id: string;
}

export interface NetworkReroutingOption {
  alternative_route_id: string;
  alternative_sections: string[];
  capacity_status: string;
  reason: string;
}

export interface NetworkImpactData {
  section_id: string;
  target_section_id?: string;
  affected_section?: NetworkSection;
  adjacent_sections: NetworkSection[];
  adjacent_sections_impacted?: string[];
  affected_corridors: NetworkCorridor[];
  affected_tasks: any[];
  affected_trains: any[];
  affected_blocks?: NetworkImpactAffectedBlock[];
  rerouting_options?: NetworkReroutingOption[];
  total_impacted_tasks: number;
  total_impacted_trains: number;
  radius_hops?: number;
  status: string;
}

export interface NetworkImpactResponse {
  status: string;
  data: NetworkImpactData;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  scheduler: string;
  fallback_available: boolean;
}
