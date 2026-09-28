import React, { useState, useMemo } from 'react'
import { Brain, Check, X, Filter } from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

export default function AIRecommendations() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('PENDING')

  const filtered = useMemo(() => state.recommendations.filter(r => {
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    return true
  }), [state.recommendations, filterPriority, filterStatus])

  const handleAccept = (id) => {
    dispatch({ type: 'ACCEPT_RECOMMENDATION', payload: id })
    toast.success('Recommendation accepted and sent to Block Planner')
  }

  const handleDismiss = (id) => {
    dispatch({ type: 'DISMISS_RECOMMENDATION', payload: id })
    toast.info('Recommendation dismissed')
  }

  const counts = {
    pending: state.recommendations.filter(r => r.status === 'PENDING').length,
    accepted: state.recommendations.filter(r => r.status === 'ACCEPTED').length,
    dismissed: state.recommendations.filter(r => r.status === 'DISMISSED').length,
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Brain size={18} className="text-purple-500" /> AI Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">AI-generated block scheduling recommendations · <span className="text-amber-600">Demo predictions only</span></p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {[['Pending', counts.pending, '#D97706'], ['Accepted', counts.accepted, '#16A34A'], ['Dismissed', counts.dismissed, '#94A3B8']].map(([l, v, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-slate-600">{l}: <strong style={{ color: c }}>{v}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded">
        <Filter size={13} className="text-slate-400" />
        {[
          { label: 'Priority', v: filterPriority, set: setFilterPriority, opts: ['ALL', 'HIGH', 'MEDIUM', 'LOW'] },
          { label: 'Status', v: filterStatus, set: setFilterStatus, opts: ['ALL', 'PENDING', 'ACCEPTED', 'DISMISSED'] },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold">{f.label}:</span>
            <select value={f.v} onChange={e => f.set(e.target.value)}
              className="text-xs border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-red-400">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} recommendations</span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(r => (
          <div key={r.id} className={`bg-white border rounded p-4 space-y-3 ${r.status === 'DISMISSED' ? 'opacity-50' : ''} ${r.priority === 'HIGH' && r.status === 'PENDING' ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{r.task_id}</span>
                <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={r.priority} />
                <StatusBadge status={r.status} />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-800 leading-snug">{r.recommendation}</div>
              <div className="text-xs text-blue-700 mt-1 font-medium">⏱ {r.suggested_window} · {r.corridor}</div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 rounded p-2 border border-slate-100">
              <span className="font-semibold text-slate-700">Reasoning: </span>{r.reason}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[10px] text-slate-500">
                AI Confidence: <strong className="text-slate-700">{r.confidence}%</strong>
              </div>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${r.confidence}%` }} />
              </div>
            </div>

            {r.status === 'PENDING' && (
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button onClick={() => handleAccept(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded text-white bg-green-600 hover:bg-green-700">
                  <Check size={11} /> ACCEPT
                </button>
                <button onClick={() => handleDismiss(r.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
                  <X size={11} /> DISMISS
                </button>
              </div>
            )}
            {r.status === 'ACCEPTED' && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded p-2">
                <Check size={12} /> Accepted — added to scheduling queue
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400">No recommendations match current filters</div>
        )}
      </div>
    </div>
  )
}
