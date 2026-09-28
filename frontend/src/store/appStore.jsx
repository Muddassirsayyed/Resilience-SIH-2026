import React, { createContext, useContext, useReducer } from 'react'
import {
  DEMO_TASKS, DEMO_BLOCKS, DEMO_TRAINS, DEMO_APPROVALS,
  DEMO_AUDIT_LOGS, DEMO_RECOMMENDATIONS, DEMO_EVENTS
} from '../data/demoData'

const AppContext = createContext(null)

function createLog(action, objectType, objectId, oldVal, newVal, user) {
  return {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    user: user?.name || 'System',
    role: user?.role || 'SYSTEM',
    action,
    object_type: objectType,
    object_id: String(objectId),
    old_value: oldVal ? (typeof oldVal === 'string' ? oldVal : JSON.stringify(oldVal).substring(0, 80)) : null,
    new_value: newVal ? (typeof newVal === 'string' ? newVal : JSON.stringify(newVal).substring(0, 80)) : null,
  }
}

const initialState = {
  tasks: DEMO_TASKS.map(t => ({ ...t })),
  blocks: DEMO_BLOCKS.map(b => ({ ...b })),
  trains: DEMO_TRAINS,
  approvals: DEMO_APPROVALS.map(a => ({ ...a })),
  auditLog: DEMO_AUDIT_LOGS.map(l => ({ ...l })),
  recommendations: DEMO_RECOMMENDATIONS.map(r => ({ ...r })),
  events: DEMO_EVENTS.map(e => ({ ...e })),
  backendOnline: false,
  selectedZone: 'ALL',
  selectedDivision: 'ALL',
  currentUser: {
    name: 'Sr. DOM Bhusawal',
    role: 'DIVISIONAL OPERATIONS MANAGER',
    zone: 'CR',
    division: 'Bhusawal',
    initials: 'SDB',
  },
  toasts: [],
}

function reducer(state, action) {
  const user = state.currentUser
  switch (action.type) {
    case 'ADD_TASK': {
      const newLog = createLog('TASK_CREATED', 'MaintenanceTask', action.payload.task_id, null, action.payload.task_id, user)
      return { ...state, tasks: [...state.tasks, action.payload], auditLog: [newLog, ...state.auditLog] }
    }
    case 'UPDATE_TASK': {
      const old = state.tasks.find(t => t.id === action.payload.id)
      const newLog = createLog('TASK_UPDATED', 'MaintenanceTask', action.payload.task_id, old?.status, action.payload.status, user)
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), auditLog: [newLog, ...state.auditLog] }
    }
    case 'DELETE_TASK': {
      const t = state.tasks.find(x => x.id === action.payload)
      const newLog = createLog('TASK_DELETED', 'MaintenanceTask', t?.task_id || action.payload, t?.task_id, null, user)
      return { ...state, tasks: state.tasks.filter(x => x.id !== action.payload), auditLog: [newLog, ...state.auditLog] }
    }
    case 'ADD_BLOCK': {
      const newLog = createLog('BLOCK_CREATED', 'BlockWindow', action.payload.id, null, action.payload.window_code, user)
      return { ...state, blocks: [...state.blocks, action.payload], auditLog: [newLog, ...state.auditLog] }
    }
    case 'UPDATE_BLOCK': {
      const newLog = createLog('BLOCK_UPDATED', 'BlockWindow', action.payload.id, null, action.payload.status, user)
      return { ...state, blocks: state.blocks.map(b => b.id === action.payload.id ? action.payload : b), auditLog: [newLog, ...state.auditLog] }
    }
    case 'DELETE_BLOCK': {
      const b = state.blocks.find(x => x.id === action.payload)
      const newLog = createLog('BLOCK_DELETED', 'BlockWindow', action.payload, b?.window_code, null, user)
      return { ...state, blocks: state.blocks.filter(x => x.id !== action.payload), auditLog: [newLog, ...state.auditLog] }
    }
    case 'ADD_APPROVAL': {
      const newLog = createLog('APPROVAL_CREATED', 'Approval', action.payload.id, null, 'DRAFT', user)
      return { ...state, approvals: [...state.approvals, action.payload], auditLog: [newLog, ...state.auditLog] }
    }
    case 'UPDATE_APPROVAL': {
      const old = state.approvals.find(a => a.id === action.payload.id)
      const newLog = createLog(`APPROVAL_${action.payload.status}`, 'Approval', action.payload.id, old?.status, action.payload.status, user)
      return { ...state, approvals: state.approvals.map(a => a.id === action.payload.id ? action.payload : a), auditLog: [newLog, ...state.auditLog] }
    }
    case 'ACCEPT_RECOMMENDATION': {
      const rec = state.recommendations.find(r => r.id === action.payload)
      const newLog = createLog('RECOMMENDATION_ACCEPTED', 'Recommendation', action.payload, 'PENDING', 'ACCEPTED', user)
      return { ...state, recommendations: state.recommendations.map(r => r.id === action.payload ? { ...r, status: 'ACCEPTED' } : r), auditLog: [newLog, ...state.auditLog] }
    }
    case 'DISMISS_RECOMMENDATION': {
      const newLog = createLog('RECOMMENDATION_DISMISSED', 'Recommendation', action.payload, 'PENDING', 'DISMISSED', user)
      return { ...state, recommendations: state.recommendations.map(r => r.id === action.payload ? { ...r, status: 'DISMISSED' } : r), auditLog: [newLog, ...state.auditLog] }
    }
    case 'SIMULATE_EVENT': {
      const newLog = createLog('EVENT_SIMULATED', 'Event', action.payload.id, null, action.payload.event_type, user)
      return { ...state, events: [...state.events, action.payload], auditLog: [newLog, ...state.auditLog] }
    }
    case 'ACKNOWLEDGE_EVENT': {
      return { ...state, events: state.events.map(e => e.id === action.payload ? { ...e, status: 'ACKNOWLEDGED' } : e) }
    }
    case 'ADD_AUDIT': {
      return { ...state, auditLog: [action.payload, ...state.auditLog] }
    }
    case 'SET_BACKEND': {
      return { ...state, backendOnline: action.payload }
    }
    case 'SET_ZONE': {
      return { ...state, selectedZone: action.payload }
    }
    case 'SET_DIVISION': {
      return { ...state, selectedDivision: action.payload }
    }
    case 'ADD_TOAST': {
      const id = Date.now()
      return { ...state, toasts: [...state.toasts, { id, ...action.payload }] }
    }
    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    }
    case 'RESET': {
      const newLog = createLog('DATA_REFRESHED', 'System', 'RAILOPT', null, 'Demo data refreshed', user)
      return { ...initialState, tasks: DEMO_TASKS.map(t => ({ ...t })), backendOnline: state.backendOnline, auditLog: [newLog, ...initialState.auditLog] }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Helper hook for toasts
export function useToast() {
  const { dispatch } = useApp()
  return {
    success: (message) => {
      const id = Date.now()
      dispatch({ type: 'ADD_TOAST', payload: { id, type: 'success', message } })
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000)
    },
    error: (message) => {
      const id = Date.now()
      dispatch({ type: 'ADD_TOAST', payload: { id, type: 'error', message } })
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000)
    },
    info: (message) => {
      const id = Date.now()
      dispatch({ type: 'ADD_TOAST', payload: { id, type: 'info', message } })
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000)
    },
  }
}

// Local AI priority calculation (no backend needed)
export function localPriorityCalc(task) {
  let score = 0
  const reasons = []
  if (task.safety_critical) { score += 40; reasons.push('Safety-critical asset') }
  const crit = (task.criticality || 'MEDIUM').toUpperCase()
  if (crit === 'HIGH') { score += 30; reasons.push('High criticality') }
  else if (crit === 'MEDIUM') { score += 20 }
  else { score += 10 }
  if (task.overdue) { score += 20; reasons.push('Maintenance overdue') }
  score += Math.min(Math.round((task.risk_score || 50) * 0.1), 10)
  score = Math.min(score, 100)
  const priority = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'
  return {
    task_id: task.task_id,
    final_priority: priority,
    risk_score: score,
    reason: reasons.length ? reasons.join(' + ') : 'Routine maintenance priority',
    recommended_action: priority === 'HIGH' ? 'Schedule immediately in next available block' : priority === 'MEDIUM' ? 'Schedule within 48 hours' : 'Schedule at next convenience',
    rule_engine_priority: priority,
    ml_priority: null,
    ml_enabled: false,
  }
}
