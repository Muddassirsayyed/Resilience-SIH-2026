import {
  BlockPlanItem,
  ConflictAlertItem,
  PlanGenerateResponse,
  DashboardStats,
  MaintenanceTask,
  AssetDefectItem,
  BlockRecommendation,
  OptimizationResult,
} from '../types';

const API_BASE_URL = '/api';

export async function fetchBlockPlans(): Promise<BlockPlanItem[]> {
  const response = await fetch(`${API_BASE_URL}/plan`);
  if (!response.ok) {
    throw new Error(`Failed to fetch block plan: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchConflicts(): Promise<ConflictAlertItem[]> {
  const response = await fetch(`${API_BASE_URL}/conflicts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conflict alerts: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function generatePlan(): Promise<PlanGenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/plan/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to generate block plan: ${response.statusText}`);
  }
  return await response.json();
}

export async function resetPlan(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/plan/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset plan: ${response.statusText}`);
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch maintenance tasks: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchAssetsDefects(): Promise<AssetDefectItem[]> {
  const response = await fetch(`${API_BASE_URL}/assets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch assets & defects: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchRecommendations(): Promise<BlockRecommendation[]> {
  const response = await fetch(`${API_BASE_URL}/recommendations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch block recommendations: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function runOptimization(): Promise<OptimizationResult> {
  const response = await fetch(`${API_BASE_URL}/optimize`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to run OR-Tools optimization: ${response.statusText}`);
  }
  return await response.json();
}

export async function approveRecommendation(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/recommendations/${id}/approve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to approve recommendation: ${response.statusText}`);
  }
  return await response.json();
}

export async function rejectRecommendation(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/recommendations/${id}/reject`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reject recommendation: ${response.statusText}`);
  }
  return await response.json();
}
