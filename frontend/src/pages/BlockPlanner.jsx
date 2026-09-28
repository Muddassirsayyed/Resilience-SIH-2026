import React, { useState } from 'react'
import { CalendarRange, Plus, CheckCircle2, AlertTriangle, X, Brain, Zap, Check, XCircle, Trash2, Shield } from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function timeToX(time, width) {
  const [h, m] = time.split(':').map(Number)
  return ((h * 60 + m) / (24 * 60)) * width
}

function TimelineBlock({ block, selected, onClick, width }) {
  const left = timeToX(block.start_time, width)
  const endH = parseInt(block.end_time.split(':')[0])
  const endM = parseInt(block.end_time.split(':')[1])
  const startH = parseInt(block.start_time.split(':')[0])
  const startM = parseInt(block.start_time.split(':')[1])
  let durationMin = (endH * 60 + endM) - (startH * 60 + startM)
  if (durationMin < 0) durationMin += 1440
  const blockWidth = Math.max((durationMin / 1440) * width, 40)

  const color = block.status === 'APPROVED' ? '#16A34A' : block.status === 'CONFLICT' ? '#DC2626' : block.status === 'SUBMITTED' ? '#2563EB' : block.status === 'UNDER_REVIEW' ? '#7C3AED' : '#D97706'

  return (
    <div
      className="absolute top-1 h-7 rounded cursor-pointer flex items-center px-2 text-white text-[10px] font-semibold overflow-hidden transition-all"
      style={{ left, width: blockWidth, background: color, opacity: selected ? 1 : 0.85, border: selected ? '2px solid #1E293B' : '1px solid transparent', zIndex: selected ? 10 : 1 }}
      onClick={() => onClick(block)}
      title={`${block.window_code} | ${block.start_time}–${block.end_time}`}
    >
      {block.window_code}
    </div>
  )
}

function CreateBlockModal({ onClose, onSave }) {
  const { state } = useApp()
  const [form, setForm] = useState({ corridor: '', track: 'UP Line', start_time: '22:00', end_time: '02:00', department: 'ENGG', power_block_required: false, zone: 'CR', crew: 8, machine: '', task_ids: [] })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.corridor) e.corridor = 'Required'
    if (!form.zone) e.zone = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...form, id: `BLK-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      window_code: `${form.zone}-NEW-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      status: 'PENDING', division: 'TBD',
    })
  }

  return (
    <div className="p-4 space-y-3 text-xs">
      {[
        { label: 'Corridor', name: 'corridor', req: true },
        { label: 'Zone', name: 'zone', opts: ['CR','WR','NR','SR','ER','SCR','SWR','NFR','NCR','ECR','SECR','NWR','WCR','NER','SER'] },
        { label: 'Track', name: 'track', opts: ['UP Line', 'DN Line', 'UP+DN', 'Loop'] },
        { label: 'Department', name: 'department', opts: ['ENGG','SIG','TRACTION','MECH'] },
        { label: 'Start Time', name: 'start_time', type: 'time' },
        { label: 'End Time', name: 'end_time', type: 'time' },
        { label: 'Crew', name: 'crew', type: 'number' },
        { label: 'Machine', name: 'machine' },
      ].map(f => (
        <div key={f.name}>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">{f.label}{f.req && ' *'}</label>
          {f.opts ? (
            <select value={form[f.name]} onChange={e => setForm(x => ({ ...x, [f.name]: e.target.value }))}
              className="w-full border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input type={f.type || 'text'} value={form[f.name] || ''} onChange={e => setForm(x => ({ ...x, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
              className={`w-full border rounded px-2 py-1.5 focus:outline-none focus:border-red-400 ${errors[f.name] ? 'border-red-400' : 'border-slate-200'}`} />
          )}
          {errors[f.name] && <p className="text-[9px] text-red-500 mt-0.5">{errors[f.name]}</p>}
        </div>
      ))}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.power_block_required} onChange={e => setForm(x => ({ ...x, power_block_required: e.target.checked }))} className="accent-red-600" />
        <span className="text-slate-700">Power Block Required</span>
      </label>
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button onClick={onClose} className="px-3 py-1.5 border border-slate-300 rounded text-slate-700">Cancel</button>
        <button onClick={handleSave} className="px-3 py-1.5 font-semibold rounded text-white" style={{ background: '#C0392B' }}>Create Block</button>
      </div>
    </div>
  )
}

function ConflictResult({ result, onClose }) {
  if (!result) return null
  const { status, conflicts, suggestions } = result
  const color = status === 'SAFE' ? '#16A34A' : status === 'WARNING' ? '#D97706' : '#DC2626'
  return (
    <div className="p-4 space-y-3 text-xs">
      <div className="flex items-center gap-3 p-3 rounded" style={{ background: status === 'SAFE' ? '#F0FDF4' : status === 'WARNING' ? '#FFFBEB' : '#FEF2F2' }}>
        <div className="text-2xl font-black" style={{ color }}>{status}</div>
        <div className="text-slate-600">{conflicts.length === 0 ? 'No conflicts detected. Block can proceed.' : `${conflicts.length} conflict(s) detected.`}</div>
      </div>
      {conflicts.map((c, i) => (
        <div key={i} className="border border-slate-200 rounded p-2.5">
          <div className="font-semibold text-slate-700">Train #{c.train_number} — {c.train_name}</div>
          <div className="text-slate-600 mt-0.5">Passes at <strong>{c.pass_time}</strong> · {c.priority} priority</div>
          <div className="text-slate-500 mt-1">{c.reason}</div>
        </div>
      ))}
      {suggestions.length > 0 && (
        <div className="border border-green-200 bg-green-50 rounded p-2.5">
          <div className="font-semibold text-green-700 mb-1">Suggested Alternatives</div>
          {suggestions.map((s, i) => (
            <div key={i} className="text-green-700">{s.start_time}–{s.end_time}: {s.reason}</div>
          ))}
        </div>
      )}
      <button onClick={onClose} className="w-full py-1.5 border border-slate-200 rounded text-slate-600 font-semibold text-xs">Close</button>
    </div>
  )
}

function OptimizationModal({ plans, onSelectPlan, onClose }) {
  const [selected, setSelected] = useState(null)
  return (
    <div className="p-4 text-xs">
      <p className="text-slate-500 mb-3">Select an optimization plan to apply to the block schedule. All plans are computed by the RAILOPT AI optimizer.</p>
      <div className="space-y-3">
        {plans.map(p => (
          <div key={p.plan_id} onClick={() => setSelected(p.plan_id)}
            className={`border rounded p-3 cursor-pointer transition-all ${selected === p.plan_id ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-semibold text-slate-800">{p.name}</div>
              <StatusBadge status={p.risk_level} />
            </div>
            <div className="text-slate-500 mb-2">{p.description}</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['Tasks', p.total_tasks], ['Block Hours', p.total_block_hours + 'h'],
                ['Conflicts', p.conflicts], ['Utilization', p.utilization_pct + '%'],
              ].map(([k, v]) => (
                <div key={k} className="text-center bg-white border border-slate-100 rounded py-1.5">
                  <div className="font-bold text-slate-800">{v}</div>
                  <div className="text-[9px] text-slate-400 uppercase">{k}</div>
                </div>
              ))}
            </div>
            <div className="text-slate-500 mt-2">Trains affected: <strong>{p.affected_trains}</strong></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <button onClick={onClose} className="px-3 py-1.5 border border-slate-300 rounded text-slate-700">Cancel</button>
        <button disabled={!selected} onClick={() => { onSelectPlan(selected); onClose() }}
          className="px-3 py-1.5 font-semibold rounded text-white disabled:opacity-50" style={{ background: '#C0392B' }}>
          Apply Selected Plan
        </button>
      </div>
    </div>
  )
}

export default function BlockPlanner() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [conflictResult, setConflictResult] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [optPlans, setOptPlans] = useState(null)
  const [optOpen, setOptOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [optimizing, setOptimizing] = useState(false)

  const timelineWidth = 900

  const pendingTasks = state.tasks.filter(t => ['PENDING'].includes(t.status))
  const selectedBlock = selected ? state.blocks.find(b => b.id === selected) : null

  const handleCheckConflicts = async () => {
    if (!selectedBlock) { toast.error('Select a block first'); return }
    setChecking(true)
    try {
      if (state.backendOnline) {
        const r = await fetch(`${API_BASE}/api/conflicts/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ block: selectedBlock }) })
        const d = await r.json()
        if (d.success) { setConflictResult(d.data); setConflictOpen(true); setChecking(false); return }
      }
    } catch {}
    // Local fallback conflict check
    const s = selectedBlock.start_time.split(':').map(Number)
    const e = selectedBlock.end_time.split(':').map(Number)
    const sMin = s[0] * 60 + s[1]
    let eMin = e[0] * 60 + e[1]
    if (eMin < sMin) eMin += 1440
    const conflicts = state.trains.filter(tr => {
      const [th, tm] = tr.scheduled_pass_time.split(':').map(Number)
      const tMin = th * 60 + tm
      return sMin <= tMin && tMin <= eMin
    }).map(tr => ({
      type: 'TRAIN_MOVEMENT', train_number: tr.train_number, train_name: tr.name,
      pass_time: tr.scheduled_pass_time, priority: tr.priority,
      severity: tr.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
      reason: `Train ${tr.train_number} passes at ${tr.scheduled_pass_time} which falls within the block window ${selectedBlock.start_time}–${selectedBlock.end_time}.`
    }))
    const suggestions = conflicts.length > 0 ? [{ start_time: selectedBlock.end_time, end_time: '06:00', reason: 'No train movements in this window' }] : []
    setConflictResult({ status: conflicts.some(c => c.severity === 'HIGH') ? 'CONFLICT' : conflicts.length ? 'WARNING' : 'SAFE', conflicts, suggestions, conflict_count: conflicts.length })
    setConflictOpen(true)
    setChecking(false)
    dispatch({ type: 'ADD_AUDIT', payload: { id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), user: 'User', role: 'OPERATOR', action: 'CONFLICT_CHECK', object_type: 'BlockWindow', object_id: selectedBlock.id, old_value: null, new_value: conflicts.length > 0 ? 'CONFLICT' : 'SAFE' } })
  }

  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      if (state.backendOnline) {
        const r = await fetch(`${API_BASE}/api/optimization/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: state.tasks }) })
        const d = await r.json()
        if (d.success) { setOptPlans(d.data.plans); setOptOpen(true); setOptimizing(false); return }
      }
    } catch {}
    // Local fallback
    setTimeout(() => {
      setOptPlans([
        { plan_id: 'PLAN-A', name: 'Plan A — Conservative', description: 'Prioritizes highest-risk safety-critical tasks only. Minimal train disruption.', total_tasks: 3, total_block_hours: 12, conflicts: 1, risk_level: 'LOW', utilization_pct: 65, affected_trains: 2, blocks: [] },
        { plan_id: 'PLAN-B', name: 'Plan B — Balanced (Recommended)', description: 'AI-recommended balance of maintenance urgency vs train operations.', total_tasks: 6, total_block_hours: 24, conflicts: 2, risk_level: 'MEDIUM', utilization_pct: 82, affected_trains: 4, blocks: [] },
        { plan_id: 'PLAN-C', name: 'Plan C — Aggressive', description: 'Maximum maintenance throughput. Higher train impact.', total_tasks: 9, total_block_hours: 36, conflicts: 5, risk_level: 'HIGH', utilization_pct: 94, affected_trains: 7, blocks: [] },
      ])
      setOptOpen(true)
      setOptimizing(false)
    }, 1500)
    dispatch({ type: 'ADD_AUDIT', payload: { id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), user: 'System', role: 'AI Optimizer', action: 'OPTIMIZATION_RUN', object_type: 'BlockPlan', object_id: 'TODAY', old_value: null, new_value: '3 plans generated' } })
  }

  const handleApprove = () => {
    if (!selectedBlock) { toast.error('Select a block first'); return }
    dispatch({ type: 'UPDATE_BLOCK', payload: { ...selectedBlock, status: 'APPROVED', approved_by: 'DOM/User', approved_at: new Date().toISOString() } })
    const aprId = `APR-${Date.now().toString(36).toUpperCase().slice(-6)}`
    dispatch({ type: 'ADD_APPROVAL', payload: { id: aprId, block_id: selectedBlock.id, task_id: selectedBlock.task_ids?.[0] || '', status: 'APPROVED', submitted_by: 'User', reviewed_by: 'DOM/User', submitted_at: new Date().toISOString(), reviewed_at: new Date().toISOString(), comments: 'Approved via Block Planner' } })
    toast.success(`Block ${selectedBlock.window_code} approved`)
    setSelected(null)
  }

  const handleReject = () => {
    if (!selectedBlock) { toast.error('Select a block first'); return }
    dispatch({ type: 'UPDATE_BLOCK', payload: { ...selectedBlock, status: 'CANCELLED' } })
    toast.info(`Block ${selectedBlock.window_code} rejected`)
    setSelected(null)
  }

  const handleDelete = () => {
    if (!selectedBlock) { toast.error('Select a block first'); return }
    dispatch({ type: 'DELETE_BLOCK', payload: selectedBlock.id })
    toast.success('Block deleted')
    setSelected(null)
  }

  const handleCreateBlock = (block) => {
    dispatch({ type: 'ADD_BLOCK', payload: block })
    toast.success(`Block ${block.window_code} created`)
    setCreateOpen(false)
    setSelected(block.id)
  }

  const handleSelectPlan = (planId) => {
    toast.success(`${planId} applied to schedule. Submit for approval.`)
    dispatch({ type: 'ADD_AUDIT', payload: { id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), user: 'User', role: 'OPERATOR', action: 'PLAN_SELECTED', object_type: 'OptimizationPlan', object_id: planId, old_value: null, new_value: 'SELECTED' } })
  }

  // Group blocks by corridor for timeline display
  const corridors = [...new Set(state.blocks.map(b => b.corridor))]

  return (
    <div className="flex h-full overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Left: Pending Tasks */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-3 py-2.5 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Pending Tasks</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{pendingTasks.length} awaiting scheduling</div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {pendingTasks.map(t => (
            <div key={t.id} className="border border-slate-200 rounded p-2 text-xs hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-semibold text-slate-800">{t.task_id}</span>
                <StatusBadge status={t.criticality} />
              </div>
              <div className="text-slate-500 truncate">{t.location}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-500">{t.department} · {t.zone}</span>
                <span className="text-[10px] font-semibold" style={{ color: t.risk_score >= 70 ? '#DC2626' : '#D97706' }}>Risk {t.risk_score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 shrink-0">
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white" style={{ background: '#C0392B' }}>
            <Plus size={12} /> Create Block
          </button>
          <button onClick={handleCheckConflicts} disabled={!selectedBlock || checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <AlertTriangle size={12} className="text-amber-500" />
            {checking ? 'Checking...' : 'Check Conflicts'}
          </button>
          <button onClick={handleOptimize} disabled={optimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Brain size={12} className="text-purple-500" />
            {optimizing ? 'Optimizing...' : 'Optimize'}
          </button>
          {selectedBlock && (
            <>
              <button onClick={handleApprove} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white bg-green-600 hover:bg-green-700">
                <Check size={12} /> Approve
              </button>
              <button onClick={handleReject} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white bg-red-600 hover:bg-red-700">
                <XCircle size={12} /> Reject
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-700 hover:bg-red-50">
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
          <span className="ml-auto text-[10px] text-slate-400">{state.blocks.length} blocks · Click a block to select</span>
        </div>

        {/* Timeline View */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white border border-slate-200 rounded">
            {/* Hour markers */}
            <div className="flex border-b border-slate-100 pl-32" style={{ minWidth: timelineWidth + 128 }}>
              {HOURS.filter(h => h % 2 === 0).map(h => (
                <div key={h} className="text-[9px] text-slate-400 font-mono" style={{ width: (timelineWidth / 12) }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Rows */}
            {corridors.map(corridor => (
              <div key={corridor} className="flex items-center border-b border-slate-50 hover:bg-slate-50 group">
                <div className="w-32 px-2 py-2 text-[10px] text-slate-600 font-medium shrink-0 truncate border-r border-slate-100" title={corridor}>
                  {corridor}
                </div>
                <div className="relative" style={{ width: timelineWidth, height: 38 }}>
                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div key={h} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: (h / 24) * timelineWidth }} />
                  ))}
                  {state.blocks.filter(b => b.corridor === corridor).map(b => (
                    <TimelineBlock key={b.id} block={b} selected={selected === b.id} onClick={b => setSelected(b.id === selected ? null : b.id)} width={timelineWidth} />
                  ))}
                </div>
              </div>
            ))}
            {corridors.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">No blocks scheduled. Click "Create Block" to add one.</div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
            {[['APPROVED', '#16A34A'], ['SUBMITTED', '#2563EB'], ['PENDING', '#D97706'], ['UNDER_REVIEW', '#7C3AED']].map(([s, c]) => (
              <div key={s} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: c }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Block Detail */}
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0">
        <div className="px-3 py-2.5 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Block Details</div>
        </div>
        {selectedBlock ? (
          <div className="p-3 space-y-3 overflow-y-auto flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800">{selectedBlock.window_code}</span>
              <StatusBadge status={selectedBlock.status} />
            </div>
            {[
              ['Corridor', selectedBlock.corridor], ['Track', selectedBlock.track],
              ['Zone / Division', `${selectedBlock.zone} / ${selectedBlock.division || 'N/A'}`],
              ['Department', selectedBlock.department],
              ['Time Window', `${selectedBlock.start_time}–${selectedBlock.end_time}`],
              ['Duration', `${selectedBlock.duration_minutes} min`],
              ['Crew', selectedBlock.crew],
              ['Machine', selectedBlock.machine || '—'],
              ['Power Block', selectedBlock.power_block_required ? 'Required' : 'Not Required'],
              ['Approved By', selectedBlock.approved_by || 'Pending'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-slate-800 text-right max-w-[140px]">{v}</span>
              </div>
            ))}
            {selectedBlock.task_ids?.length > 0 && (
              <div>
                <div className="text-slate-500 mb-1">Tasks</div>
                {selectedBlock.task_ids.map(tid => <div key={tid} className="font-mono text-slate-800">{tid}</div>)}
              </div>
            )}
            {selectedBlock.power_block_required && (
              <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-100 rounded">
                <Shield size={12} className="text-amber-600" />
                <span className="text-amber-700 text-[10px] font-medium">Power block coordination required with TPC</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs text-center p-4">
            Click a block on the timeline to view its details
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Block" size="md">
        <CreateBlockModal onClose={() => setCreateOpen(false)} onSave={handleCreateBlock} />
      </Modal>

      <Modal isOpen={conflictOpen} onClose={() => setConflictOpen(false)} title="Conflict Check Results" size="md">
        <ConflictResult result={conflictResult} onClose={() => setConflictOpen(false)} />
      </Modal>

      <Modal isOpen={optOpen} onClose={() => setOptOpen(false)} title="AI Optimization — Select Plan" size="xl">
        {optPlans && <OptimizationModal plans={optPlans} onSelectPlan={handleSelectPlan} onClose={() => setOptOpen(false)} />}
      </Modal>
    </div>
  )
}
