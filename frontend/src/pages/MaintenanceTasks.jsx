import React, { useState, useMemo } from 'react'
import { Plus, Search, Eye, Edit2, Brain, Calendar, Trash2, X, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useApp, useToast, localPriorityCalc } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const EMPTY_TASK = {
  task_id: '', asset_id: '', asset_type: 'Track', department: 'ENGG',
  location: '', zone: 'CR', division: '', criticality: 'MEDIUM',
  safety_critical: false, overdue: false, estimated_duration: 120,
  crew_required: 4, machine_required: '', status: 'PENDING',
  risk_score: 50, notes: '', preferred_date: '',
}

const ASSET_TYPES = ['Track', 'Bridge', 'OHE Wire', 'OHE Mast', 'Signal', 'Point Machine', 'Level Crossing', 'Traction Substation', 'Tunnel', 'Other']
const DEPTS = ['ENGG', 'SIG', 'TRACTION', 'MECH', 'CIVIL', 'ELECTRICAL']
const ZONES = ['CR', 'WR', 'NR', 'SR', 'ER', 'SCR', 'SWR', 'NFR', 'NCR', 'ECR', 'SECR', 'NWR', 'WCR', 'NER', 'SER']

function RiskBar({ score }) {
  const color = score >= 70 ? '#DC2626' : score >= 40 ? '#D97706' : '#16A34A'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}</span>
    </div>
  )
}

function TaskForm({ task, onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_TASK, ...task })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.asset_id) e.asset_id = 'Required'
    if (!form.location) e.location = 'Required'
    if (!form.division) e.division = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const calcScore = () => {
      let s = 0
      if (form.safety_critical) s += 40
      if (form.criticality === 'HIGH') s += 30
      else if (form.criticality === 'MEDIUM') s += 20
      else s += 10
      if (form.overdue) s += 20
      return Math.min(s, 100)
    }
    onSave({ ...form, risk_score: form.risk_score || calcScore(), id: form.id || Date.now() })
  }

  const F = ({ label, name, type = 'text', opts, req, half }) => (
    <div className={`${half ? 'col-span-1' : 'col-span-2'}`}>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}{req && ' *'}</label>
      {opts ? (
        <select value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className={`w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:border-red-400 ${errors[name] ? 'border-red-400' : 'border-slate-200'}`}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.checked }))}
            className="w-3 h-3 accent-red-600" />
          <span className="text-xs text-slate-700">Yes</span>
        </label>
      ) : (
        <input type={type} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className={`w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:border-red-400 ${errors[name] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
      )}
      {errors[name] && <p className="text-[9px] text-red-500 mt-0.5">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Asset ID" name="asset_id" req half />
        <F label="Asset Type" name="asset_type" opts={ASSET_TYPES} half />
        <F label="Department" name="department" opts={DEPTS} half />
        <F label="Zone" name="zone" opts={ZONES} half />
        <F label="Division" name="division" req half />
        <F label="Location / KM" name="location" req />
        <F label="Criticality" name="criticality" opts={['HIGH', 'MEDIUM', 'LOW']} half />
        <F label="Status" name="status" opts={['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED']} half />
        <F label="Safety Critical" name="safety_critical" type="checkbox" half />
        <F label="Overdue" name="overdue" type="checkbox" half />
        <F label="Est. Duration (min)" name="estimated_duration" type="number" half />
        <F label="Crew Required" name="crew_required" type="number" half />
        <F label="Machine Required" name="machine_required" half />
        <F label="Preferred Date" name="preferred_date" type="date" half />
        <F label="Notes" name="notes" />
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded text-slate-700 hover:bg-slate-50">Cancel</button>
        <button onClick={handleSubmit} className="px-3 py-1.5 text-xs font-semibold rounded text-white" style={{ background: '#C0392B' }}>
          {task?.id ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </div>
  )
}

function PriorityModal({ task, onClose }) {
  const result = localPriorityCalc(task)
  const color = result.final_priority === 'HIGH' ? '#DC2626' : result.final_priority === 'MEDIUM' ? '#D97706' : '#16A34A'
  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4 p-3 rounded border" style={{ background: result.final_priority === 'HIGH' ? '#FEF2F2' : result.final_priority === 'MEDIUM' ? '#FFFBEB' : '#F0FDF4', borderColor: color + '40' }}>
        <div className="text-3xl font-black" style={{ color }}>{result.final_priority}</div>
        <div>
          <div className="text-xs text-slate-500">Risk Score</div>
          <div className="text-2xl font-bold" style={{ color }}>{result.risk_score}%</div>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div><span className="font-semibold text-slate-600">Reason: </span><span className="text-slate-700">{result.reason}</span></div>
        <div><span className="font-semibold text-slate-600">Recommended Action: </span><span className="text-slate-700">{result.recommended_action}</span></div>
        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
          ℹ️ AI advisory output — prototype demo only. Does not represent live Indian Railways operational AI.
        </div>
      </div>
      <div className="flex justify-end mt-4"><button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded text-slate-700">Close</button></div>
    </div>
  )
}

function TaskDetail({ task, onClose, onEdit, onSchedule }) {
  const [priResult, setPriResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { state } = useApp()

  const runPriority = async () => {
    setLoading(true)
    try {
      if (state.backendOnline) {
        const r = await fetch(`${API_BASE}/api/ml/predict-priority`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task }) })
        const d = await r.json()
        if (d.success) { setPriResult(d.data); setLoading(false); return }
      }
    } catch {}
    setTimeout(() => { setPriResult(localPriorityCalc(task)); setLoading(false) }, 600)
  }

  return (
    <div className="p-4 text-xs space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Task ID', task.task_id], ['Asset ID', task.asset_id], ['Asset Type', task.asset_type],
          ['Department', task.department], ['Zone / Division', `${task.zone} / ${task.division}`],
          ['Location', task.location], ['Criticality', task.criticality], ['Status', task.status],
          ['Duration', `${task.estimated_duration} min`], ['Crew', task.crew_required],
          ['Machine', task.machine_required || '—'], ['Preferred Date', task.preferred_date || '—'],
          ['Safety Critical', task.safety_critical ? '✓ Yes' : 'No'], ['Overdue', task.overdue ? '⚠ Yes' : 'No'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded p-2">
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{k}</div>
            <div className="text-slate-800 font-medium mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      {task.notes && <div className="p-2 bg-amber-50 border border-amber-100 rounded text-slate-700"><span className="font-semibold">Notes:</span> {task.notes}</div>}
      <div className="p-2 rounded border border-slate-200">
        <div className="font-semibold text-slate-600 mb-1.5">Risk Score</div>
        <RiskBar score={task.risk_score} />
      </div>
      {priResult && (
        <div className="p-3 rounded border" style={{ background: priResult.final_priority === 'HIGH' ? '#FEF2F2' : '#FFFBEB', borderColor: '#fca5a5' }}>
          <div className="font-semibold text-slate-700 mb-1">AI Priority Result</div>
          <div className="font-bold text-lg" style={{ color: priResult.final_priority === 'HIGH' ? '#DC2626' : '#D97706' }}>{priResult.final_priority} — {priResult.risk_score}%</div>
          <div className="text-slate-600 mt-1">{priResult.reason}</div>
          <div className="text-slate-500 mt-1">{priResult.recommended_action}</div>
        </div>
      )}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button onClick={runPriority} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white disabled:opacity-60"
          style={{ background: '#7C3AED' }}>
          <Brain size={12} />{loading ? 'Analyzing...' : 'Run AI Priority'}
        </button>
        <button onClick={() => onEdit(task)} className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50">
          <Edit2 size={12} className="inline mr-1" />Edit
        </button>
        <button onClick={() => { toast.success(`Task ${task.task_id} sent to Block Planner`); onClose() }}
          className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50">
          <Calendar size={12} className="inline mr-1" />Schedule
        </button>
        <button onClick={onClose} className="ml-auto px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-500">Close</button>
      </div>
    </div>
  )
}

export default function MaintenanceTasks() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('ALL')
  const [filterDept, setFilterDept] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [viewTask, setViewTask] = useState(null)
  const [editTask, setEditTask] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [priorityTask, setPriorityTask] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => state.tasks.filter(t => {
    if (search && !t.task_id.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false
    if (filterZone !== 'ALL' && t.zone !== filterZone) return false
    if (filterDept !== 'ALL' && t.department !== filterDept) return false
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
    return true
  }).sort((a, b) => b.risk_score - a.risk_score), [state.tasks, search, filterZone, filterDept, filterStatus])

  const handleSave = (task) => {
    if (task.id && state.tasks.find(t => t.id === task.id)) {
      dispatch({ type: 'UPDATE_TASK', payload: task })
      toast.success(`Task ${task.task_id} updated`)
    } else {
      const newTask = { ...task, task_id: task.task_id || `MT-2024-${String(Date.now()).slice(-4)}`, id: Date.now() }
      dispatch({ type: 'ADD_TASK', payload: newTask })
      toast.success(`Task ${newTask.task_id} created`)
    }
    setEditTask(null)
    setAddOpen(false)
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
    toast.success('Task deleted')
    setDeleteId(null)
  }

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">Maintenance Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} tasks · sorted by risk score</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white"
          style={{ background: '#C0392B' }}>
          <Plus size={13} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2 top-1.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search task ID or location..."
            className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-red-400" />
        </div>
        {[
          { v: filterZone, set: setFilterZone, opts: ['ALL', ...ZONES], label: 'Zone' },
          { v: filterDept, set: setFilterDept, opts: ['ALL', ...DEPTS], label: 'Dept' },
          { v: filterStatus, set: setFilterStatus, opts: ['ALL', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'], label: 'Status' },
        ].map(f => (
          <select key={f.label} value={f.v} onChange={e => f.set(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-red-400">
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Task ID', 'Asset', 'Dept', 'Zone', 'Location', 'Criticality', 'Risk', 'Duration', 'Crew', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">
                  <div className="flex items-center gap-1">
                    {t.safety_critical && <ShieldAlert size={10} className="text-red-500" />}
                    {t.overdue && <AlertTriangle size={10} className="text-amber-500" />}
                    {t.task_id}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate-600">{t.asset_type}</td>
                <td className="px-3 py-2.5 text-slate-600">{t.department}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-700">{t.zone}</td>
                <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate">{t.location}</td>
                <td className="px-3 py-2.5"><StatusBadge status={t.criticality} /></td>
                <td className="px-3 py-2.5"><RiskBar score={t.risk_score} /></td>
                <td className="px-3 py-2.5 text-slate-600">{Math.round(t.estimated_duration / 60 * 10) / 10}h</td>
                <td className="px-3 py-2.5 text-slate-600">{t.crew_required}</td>
                <td className="px-3 py-2.5"><StatusBadge status={t.status} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewTask(t)} title="View" className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye size={13} /></button>
                    <button onClick={() => setEditTask(t)} title="Edit" className="p-1 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => setPriorityTask(t)} title="AI Priority" className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"><Brain size={13} /></button>
                    <button onClick={() => setDeleteId(t.id)} title="Delete" className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-slate-400">No tasks match current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal isOpen={!!viewTask} onClose={() => setViewTask(null)} title={`Task: ${viewTask?.task_id}`} size="lg">
        {viewTask && <TaskDetail task={viewTask} onClose={() => setViewTask(null)} onEdit={t => { setEditTask(t); setViewTask(null) }} />}
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm task={editTask} onClose={() => setEditTask(null)} onSave={handleSave} />}
      </Modal>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Maintenance Task" size="lg">
        <TaskForm task={{}} onClose={() => setAddOpen(false)} onSave={handleSave} />
      </Modal>

      <Modal isOpen={!!priorityTask} onClose={() => setPriorityTask(null)} title={`AI Priority — ${priorityTask?.task_id}`} size="md">
        {priorityTask && <PriorityModal task={priorityTask} onClose={() => setPriorityTask(null)} />}
      </Modal>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded border border-slate-200 shadow-xl p-5 max-w-sm w-full mx-4">
            <div className="font-semibold text-slate-800 mb-2">Delete Task?</div>
            <div className="text-xs text-slate-600 mb-4">This action cannot be undone. The task will be removed from the system.</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-700">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-3 py-1.5 text-xs font-semibold rounded text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
