import { BlockPlanItem, ConflictAlertItem, PlanGenerateResponse } from '../types';

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
