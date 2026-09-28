import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench, Clock, CheckCircle2, AlertTriangle, Train,
  Zap, Brain, Activity, RefreshCw, Filter, ChevronRight,
  ShieldAlert, TrendingUp
} from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const ZONES = ['ALL', 'CR', 'WR', 'NR', 'SR', 'ER', 'SCR', 'SWR', 'NFR', 'NCR', 'ECR', 'SECR', 'NWR', 'WCR', 'NER', 'SER']
const DEPTS = ['ALL', 'ENGG', 'SIG', 'TRACTION', 'MECH']
const PRIORITIES = ['ALL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['ALL', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [zone, setZone] = useState('ALL')
  const [dept, setDept] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  const tasks = useMemo(() => state.tasks.filter(t => {
    if (zone !== 'ALL' && t.zone !== zone) return false
    if (dept !== 'ALL' && t.department !== dept) return false
    if (status !== 'ALL' && t.status !== status) return false
    if (priority === 'HIGH' && t.risk_score < 70) return false
    if (priority === 'MEDIUM' && (t.risk_score >= 70 || t.risk_score < 40)) return false
    if (priority === 'LOW' && t.risk_score >= 40) return false
    return true
  }), [state.tasks, zone, dept, priority, status])

  const stats = useMemo(() => ({
    active: state.tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
    pendingBlocks: state.blocks.filter(b => ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(b.status)).length,
    approvedBlocks: state.blocks.filter(b => b.status === 'APPROVED').length,
    highRisk: state.tasks.filter(t => t.risk_score >= 70).length,
    trainsAffected: 6,
    utilization: 73,
    emergencyEvents: state.events.filter(e => e.status === 'ACTIVE').length,
    pendingRecs: state.recommendations.filter(r => r.status === 'PENDING').length,
  }), [state])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      dispatch({ type: 'RESET' })
      setRefreshing(false)
      toast.success('Dashboard data refreshed')
    }, 800)
  }

  const STAT_CARDS = [
    { label: 'Active Maintenance Tasks', value: stats.active, icon: Wrench, color: '#2563EB', bg: '#EFF6FF', action: () => navigate('/maintenance-tasks') },
    { label: 'Pending Block Requests', value: stats.pendingBlocks, icon: Clock, color: '#D97706', bg: '#FFFBEB', action: () => navigate('/block-planner') },
    { label: 'Approved Blocks', value: stats.approvedBlocks, icon: CheckCircle2, color: '#16A34A', bg: '#F0FDF4', action: () => navigate('/approvals') },
    { label: 'High Risk Assets', value: stats.highRisk, icon: ShieldAlert, color: '#C0392B', bg: '#FEF2F2', action: () => navigate('/maintenance-tasks') },
    { label: 'Trains Affected', value: stats.trainsAffected, icon: Train, color: '#7C3AED', bg: '#F5F3FF', action: () => navigate('/live-operations') },
    { label: 'Block Utilization', value: `${stats.utilization}%`, icon: TrendingUp, color: '#0891B2', bg: '#ECFEFF', action: () => navigate('/reports') },
    { label: 'Emergency Events', value: stats.emergencyEvents, icon: Zap, color: '#DC2626', bg: '#FFF1F2', action: () => navigate('/events') },
    { label: 'AI Recommendations', value: stats.pendingRecs, icon: Brain, color: '#059669', bg: '#F0FDF4', action: () => navigate('/ai-recommendations') },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">RAILOPT — AI-Enabled Block Planning & Optimization · <span className="text-amber-600 font-medium">DEMO MODE</span></p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded">
        <Filter size={13} className="text-slate-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-500 mr-1">FILTER</span>
        {[
          { label: 'Zone', value: zone, set: setZone, opts: ZONES },
          { label: 'Dept', value: dept, set: setDept, opts: DEPTS },
          { label: 'Priority', value: priority, set: setPriority, opts: PRIORITIES },
          { label: 'Status', value: status, set: setStatus, opts: STATUSES },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium">{f.label}:</span>
            <select value={f.value} onChange={e => f.set(e.target.value)}
              className="text-xs border border-slate-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-red-400">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {(zone !== 'ALL' || dept !== 'ALL' || priority !== 'ALL' || status !== 'ALL') && (
          <button onClick={() => { setZone('ALL'); setDept('ALL'); setPriority('ALL'); setStatus('ALL') }}
            className="text-xs text-red-600 hover:underline ml-1">Clear</button>
        )}
        <span className="ml-auto text-xs text-slate-500">{tasks.length} tasks matching</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3">
        {STAT_CARDS.map(c => (
          <button key={c.label} onClick={c.action}
            className="bg-white border border-slate-200 rounded p-3 text-left hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon size={16} style={{ color: c.color }} />
              </div>
              <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 mt-1" />
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wide">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* High Priority Tasks */}
        <div className="col-span-2 bg-white border border-slate-200 rounded">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">High Priority Maintenance Tasks</h2>
            <button onClick={() => navigate('/maintenance-tasks')} className="text-xs text-red-600 hover:underline font-medium">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Task ID', 'Location', 'Zone', 'Dept', 'Risk', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.filter(t => t.risk_score >= 70).slice(0, 6).map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-medium text-slate-800">{t.task_id}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-[180px] truncate">{t.location}</td>
                    <td className="px-3 py-2"><span className="font-semibold text-slate-700">{t.zone}</span></td>
                    <td className="px-3 py-2 text-slate-600">{t.department}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${t.risk_score}%`, background: t.risk_score >= 70 ? '#DC2626' : t.risk_score >= 40 ? '#D97706' : '#16A34A' }} />
                        </div>
                        <span className="font-semibold" style={{ color: t.risk_score >= 70 ? '#DC2626' : '#D97706' }}>{t.risk_score}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                    <td className="px-3 py-2">
                      <button onClick={() => navigate('/maintenance-tasks')}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded text-white" style={{ background: '#C0392B' }}>
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
                {tasks.filter(t => t.risk_score >= 70).length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No high-priority tasks match current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* AI Recommendations */}
          <div className="bg-white border border-slate-200 rounded flex-1">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Brain size={13} className="text-purple-500" /> AI Recommendations
              </h2>
              <button onClick={() => navigate('/ai-recommendations')} className="text-xs text-red-600 hover:underline">View All →</button>
            </div>
            <div className="p-2 space-y-2">
              {state.recommendations.filter(r => r.status === 'PENDING').slice(0, 3).map(r => (
                <div key={r.id} className="border border-slate-100 rounded p-2.5 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-700 leading-snug">{r.recommendation}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{r.suggested_window} · <span className="font-medium text-blue-600">{r.confidence}% confidence</span></div>
                    </div>
                    <StatusBadge status={r.priority} />
                  </div>
                  <button onClick={() => navigate('/ai-recommendations')}
                    className="mt-2 w-full text-[10px] font-semibold py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100">
                    REVIEW
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Events */}
          <div className="bg-white border border-slate-200 rounded">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Zap size={13} className="text-red-500" /> Recent Events
              </h2>
              <button onClick={() => navigate('/events')} className="text-xs text-red-600 hover:underline">View All →</button>
            </div>
            <div className="p-2 space-y-1.5">
              {state.events.slice(0, 3).map(e => (
                <div key={e.id} className="flex items-start gap-2 p-2 rounded border border-slate-100 hover:bg-slate-50">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${e.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                  <div>
                    <div className="text-[10px] font-semibold text-slate-700">{e.event_type.replace(/_/g, ' ')}</div>
                    <div className="text-[9px] text-slate-500 truncate">{e.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Blocks */}
      <div className="bg-white border border-slate-200 rounded">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Live Block Status</h2>
          <button onClick={() => navigate('/block-planner')} className="text-xs text-red-600 hover:underline font-medium">Open Block Planner →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Window Code', 'Corridor', 'Track', 'Zone', 'Time Window', 'Dept', 'Crew', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.blocks.slice(0, 5).map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono font-medium text-slate-800">{b.window_code}</td>
                  <td className="px-3 py-2 text-slate-600 max-w-[180px] truncate">{b.corridor}</td>
                  <td className="px-3 py-2 text-slate-600">{b.track}</td>
                  <td className="px-3 py-2 font-semibold text-slate-700">{b.zone}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{b.start_time}–{b.end_time}</td>
                  <td className="px-3 py-2 text-slate-600">{b.department}</td>
                  <td className="px-3 py-2 text-slate-600">{b.crew}</td>
                  <td className="px-3 py-2"><StatusBadge status={b.status} /></td>
                  <td className="px-3 py-2">
                    <button onClick={() => navigate('/block-planner')}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100">
                      OPEN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
