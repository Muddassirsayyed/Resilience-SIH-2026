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
}
