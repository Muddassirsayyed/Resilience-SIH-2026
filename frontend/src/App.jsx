import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './store/appStore'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import ToastContainer from './components/shared/ToastContainer'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MaintenanceTasks = lazy(() => import('./pages/MaintenanceTasks'))
const BlockPlanner = lazy(() => import('./pages/BlockPlanner'))
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'))
const RealTimeEvents = lazy(() => import('./pages/RealTimeEvents'))
const WhatIfSimulation = lazy(() => import('./pages/WhatIfSimulation'))
const Approvals = lazy(() => import('./pages/Approvals'))
const AuditLogs = lazy(() => import('./pages/AuditLogs'))
const GISMap = lazy(() => import('./pages/GISMap'))
const Reports = lazy(() => import('./pages/Reports'))
const LiveOperations = lazy(() => import('./pages/LiveOperations'))
const WeeklyPlanning = lazy(() => import('./pages/WeeklyPlanning'))
const Documents = lazy(() => import('./pages/Documents'))
const Administration = lazy(() => import('./pages/Administration'))

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2" />
        Loading...
      </div>
    </div>
  )
}

function AppInner() {
  const { dispatch } = useApp()
  useEffect(() => {
    fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.ok && dispatch({ type: 'SET_BACKEND', payload: true }))
      .catch(() => dispatch({ type: 'SET_BACKEND', payload: false }))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-operations" element={<LiveOperations />} />
              <Route path="/maintenance-tasks" element={<MaintenanceTasks />} />
              <Route path="/block-planner" element={<BlockPlanner />} />
              <Route path="/ai-recommendations" element={<AIRecommendations />} />
              <Route path="/events" element={<RealTimeEvents />} />
              <Route path="/simulation" element={<WhatIfSimulation />} />
              <Route path="/weekly-planning" element={<WeeklyPlanning />} />
              <Route path="/gis-map" element={<GISMap />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/administration" element={<Administration />} />
              {/* legacy routes */}
              <Route path="/network" element={<Navigate to="/live-operations" replace />} />
              <Route path="/monitoring" element={<Navigate to="/live-operations" replace />} />
              <Route path="/priority-center" element={<Navigate to="/ai-recommendations" replace />} />
              <Route path="/block-planning" element={<Navigate to="/block-planner" replace />} />
              <Route path="/conflicts" element={<Navigate to="/block-planner" replace />} />
              <Route path="/planning" element={<Navigate to="/weekly-planning" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
