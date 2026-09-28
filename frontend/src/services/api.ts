import {
  BlockPlanItem,
  ConflictAlertItem,
  PlanGenerateResponse,
  PrioritizedTasksResponse,
  ScenarioCreateRequest,
  ScenarioItem,
  WhatIfComparison,
  NetworkTopologyResponse,
  NetworkCorridor,
  NetworkSection,
  NetworkImpactRequest,
  NetworkImpactResponse,
  HealthResponse,
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

export async function fetchPrioritizedTasks(): Promise<PrioritizedTasksResponse> {
  const response = await fetch(`${API_BASE_URL}/prioritized-tasks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prioritized tasks: ${response.statusText}`);
  }
  return await response.json();
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

// ---------------------------------------------------------
// What-If Scenario Simulation APIs
// ---------------------------------------------------------

export async function fetchScenarios(): Promise<ScenarioItem[]> {
  const response = await fetch(`${API_BASE_URL}/scenarios`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchScenarioById(scenarioId: string): Promise<ScenarioItem> {
  const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scenario details: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function createScenario(
  payload: ScenarioCreateRequest
): Promise<{ scenario_id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to create scenario: ${response.statusText}`);
  }
  return await response.json();
}

export async function runScenario(scenarioId: string): Promise<WhatIfComparison> {
  const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to run scenario simulation: ${response.statusText}`);
  }
  const result = await response.json();
  return result.result;
}

export async function deleteScenario(scenarioId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete scenario: ${response.statusText}`);
  }
}

// ---------------------------------------------------------
// Network Topology & Multi-Corridor APIs
// ---------------------------------------------------------

export async function fetchNetwork(): Promise<NetworkTopologyResponse> {
  const response = await fetch(`${API_BASE_URL}/network`);
  if (!response.ok) {
    throw new Error(`Failed to fetch network topology: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchCorridorById(corridorId: string): Promise<NetworkCorridor> {
  const response = await fetch(`${API_BASE_URL}/network/corridors/${corridorId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch corridor details: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchSectionById(sectionId: string): Promise<NetworkSection> {
  const response = await fetch(`${API_BASE_URL}/network/sections/${sectionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch section details: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function calculateNetworkImpact(payload: NetworkImpactRequest): Promise<NetworkImpactResponse> {
  const response = await fetch(`${API_BASE_URL}/network/impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to calculate network impact: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch system health: ${response.statusText}`);
  }
  return await response.json();
}

