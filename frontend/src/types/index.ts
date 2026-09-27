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
