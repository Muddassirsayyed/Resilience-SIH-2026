import {
  stations, sections, trains, networkStats,
  priorityTasks,
  planningStats, planningTasks, availableWindows, windowTrainMovements,
  conflictStats, activeConflictsData, resolvedConflictsData, aiResolutionOptions,
  plannerStats, weeklyBlocks, monthlyWorkload, overdueWork, pendingMaintenanceTasks,
  monitoringStats, liveTrainMovements, activeBlocks, liveAlerts, assetAvailabilityReport, performanceSummary, reportTableData
} from '../data/mockData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiService {
  constructor() {
    this.isBackendOnline = false
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, { timeout: 3000 })
      if (response.ok) {
        this.isBackendOnline = true
        return true
      }
      this.isBackendOnline = false
      return false
    } catch (error) {
      this.isBackendOnline = false
      return false
    }
  }

  async getHealth() {
    return await this.checkHealth()
  }

  async _fetch(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (e) {
      console.warn(`[API] Failed to fetch ${endpoint}:`, e)
      throw e
    }
  }

  async getMaintenanceTasks() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/maintenance-tasks')
        if (res.success && res.data) return res.data
      } catch (e) {
        // Fallback below
      }
    }
    return priorityTasks
  }

  async getMaintenanceTask(id) {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch(`/api/maintenance-tasks/${id}`)
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return priorityTasks.find(t => t.id === id) || null
  }

  async getBlockWindows() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/block-windows')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return availableWindows
  }

  async getBlockPlans() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/block-plans')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return weeklyBlocks
  }

  async generateOptimization(payload) {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/optimization/generate', {
          method: 'POST',
          body: JSON.stringify(payload || {})
        })
        if (res.success && res.data) return res.data
      } catch (e) {
        console.warn('Optimization service unavailable, falling back to mock.')
      }
    }
    // Mock simulation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          tasks: 24,
          blocks: 12,
          conflicts: 3,
          pendingReview: 4,
          message: 'Plan generated successfully (Mock)',
          recommendedBlocks: [
            {
              id: 'KNP-04',
              time: '22:00-03:00',
              tasks: ['Track Defect', 'Signal Inspection', 'OHE Inspection'],
              departments: ['Engineering', 'S&T', 'Traction'],
              duration: '5 hrs',
              status: 'CONTROLLER REVIEW'
            }
          ]
        })
      }, 2000)
    })
  }

  async getCorridors() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/corridors')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return sections
  }

  async getAssets() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/assets')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return assetAvailabilityReport
  }

  async getTrains() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/trains')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return trains
  }

  async getConflicts() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/conflicts')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return activeConflictsData
  }

  // ============================================================
  // INTEGRATION APIs (TMS, SMMS, TDMS, COA)
  // ============================================================

  async getIntegrationStatus() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/status')
        if (res.success && res.sources) return res.sources
      } catch (e) {}
    }
    return null
  }

  async getTMSData() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/tms')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  async getSMMSData() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/smms')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  async getTDMSData() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/tdms')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  async getCOAData() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/coa')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  async getIntegratedSnapshot() {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/integration/all')
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  async predictPriority(task) {
    if (this.isBackendOnline) {
      try {
        const res = await this._fetch('/api/ml/predict-priority', {
          method: 'POST',
          body: JSON.stringify({ task })
        })
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return null
  }

  // ============================================================
  // CONSTRAINT ENGINE APIs (Phase 2A)
  // ============================================================

  async checkConstraints(payload) {
    if (this.isBackendOnline) {
      try {
        return await this._fetch('/api/constraints/check', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      } catch (e) {
        console.warn('[API] Constraint check failed:', e)
      }
    }
    return null
  }

  async checkCompatibility(payload) {
    if (this.isBackendOnline) {
      try {
        return await this._fetch('/api/constraints/compatibility', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      } catch (e) {}
    }
    return null
  }

  async getCandidateWindows(taskId, corridor = null) {
    if (this.isBackendOnline) {
      try {
        const url = corridor
          ? `/api/constraints/candidate-windows/${taskId}?corridor=${corridor}`
          : `/api/constraints/candidate-windows/${taskId}`
        const res = await this._fetch(url)
        if (res.success && res.data) return res.data
      } catch (e) {}
    }
    return []
  }

}

const API = new ApiService()
export default API

