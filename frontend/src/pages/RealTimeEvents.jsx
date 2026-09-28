import React, { useState } from 'react'
import { Zap, AlertTriangle, CheckCircle2, Eye, RefreshCw } from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const EVENT_TYPES = [
  { value: 'TRAIN_DELAY', label: 'Train Delay' },
  { value: 'EMERGENCY_DEFECT', label: 'Emergency Defect' },
  { value: 'CREW_UNAVAILABLE', label: 'Crew Unavailable' },
  { value: 'MACHINE_UNAVAILABLE', label: 'Machine Unavailable' },
  { value: 'BLOCK_OVERRUN', label: 'Block Overrun' },
  { value: 'SIGNAL_FAILURE', label: 'Signal Failure' },
  { value: 'POWER_BLOCK_CHANGE', label: 'Power Block Change' },
]

const RECOMMENDATIONS = {
  TRAIN_DELAY: 'Adjust block start time by delay duration. Notify crew and machines.',
  EMERGENCY_DEFECT: 'Issue emergency block immediately. Alert DRM and safety officer.',
  CREW_UNAVAILABLE: 'Source alternate crew from nearest depot. Consider block postponement.',
  MACHINE_UNAVAILABLE: 'Identify substitute machine. Replan block with manual methods if needed.',
  BLOCK_OVERRUN: 'Extend block with DRM approval. Clear trains after work completion verification.',
  SIGNAL_FAILURE: 'Revert to absolute block working. Dispatch signal technician immediately.',
  POWER_BLOCK_CHANGE: 'Coordinate with TPC for revised power block window. Update all departments.',
}

export default function RealTimeEvents() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [eventType, setEventType] = useState('TRAIN_DELAY')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [simulating, setSimulating] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [replanning, setReplanning] = useState(false)

  const handleSimulate = () => {
    if (!description.trim()) { toast.error('Enter event description'); return }
    setSimulating(true)
    setTimeout(() => {
      const event = {
        id: `EVT-${Date.now().toString(36).toUpperCase().slice(-8)}`,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        description,
        severity,
        affected_blocks: state.blocks.slice(0, 2).map(b => b.id),
        affected_trains: state.trains.slice(0, 3).map(t => t.train_number),
        status: 'ACTIVE',
        recommendation: RECOMMENDATIONS[eventType],
      }
      dispatch({ type: 'SIMULATE_EVENT', payload: event })
      setLastResult(event)
      setSimulating(false)
      toast.success(`Event simulated: ${event.id}`)
      setDescription('')
    }, 800)
  }

  const handleAcknowledge = (id) => {
    dispatch({ type: 'ACKNOWLEDGE_EVENT', payload: id })
    toast.info('Event acknowledged')
  }

  const handleReplan = () => {
    setReplanning(true)
    setTimeout(() => {
      setReplanning(false)
      toast.success('Revised block plan generated based on current event')
      dispatch({ type: 'ADD_AUDIT', payload: { id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), user: 'System', role: 'AI Optimizer', action: 'REPLAN_EXECUTED', object_type: 'BlockPlan', object_id: 'CURRENT', old_value: null, new_value: 'Revised plan generated' } })
    }, 1200)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Real-Time Events</h1>
        <p className="text-xs text-slate-500 mt-0.5">Simulate operational events and see impact on block schedule</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Event List */}
        <div className="col-span-2 bg-white border border-slate-200 rounded">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Active & Recent Events</h2>
            <span className="text-xs text-slate-500">{state.events.length} events</span>
          </div>
          <div className="divide-y divide-slate-50">
            {state.events.map(e => (
              <div key={e.id} className={`p-3 hover:bg-slate-50 ${e.status === 'ACTIVE' ? 'bg-red-50' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${e.status === 'ACTIVE' ? 'text-red-600' : 'text-slate-500'}`}>
                        {e.status === 'ACTIVE' ? '⬤' : '○'} {e.event_type.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={e.severity} />
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="text-xs text-slate-700 mt-1">{e.description}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0">{new Date(e.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="text-[10px] text-slate-500 mb-2">
                  Affected blocks: {e.affected_blocks.join(', ')} · Trains: {e.affected_trains.join(', ')}
                </div>
                <div className="text-xs text-blue-700 bg-blue-50 rounded p-2 mb-2">
                  <span className="font-semibold">Recommendation:</span> {e.recommendation}
                </div>
                <div className="flex items-center gap-2">
                  {e.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => handleAcknowledge(e.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded text-white bg-green-600 hover:bg-green-700">
                        <CheckCircle2 size={10} /> Acknowledge
                      </button>
                      <button onClick={handleReplan} disabled={replanning}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                        <RefreshCw size={10} className={replanning ? 'animate-spin' : ''} />
                        {replanning ? 'Replanning...' : 'Replan'}
                      </button>
                      <button onClick={() => toast.info(`Impact: ${e.affected_blocks.length} blocks, ${e.affected_trains.length} trains affected`)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100">
                        <Eye size={10} /> View Impact
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {state.events.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm">No events recorded</div>
            )}
          </div>
        </div>

        {/* Simulator */}
        <div className="bg-white border border-slate-200 rounded">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Zap size={12} className="text-amber-500" /> Event Simulator
            </h2>
          </div>
          <div className="p-3 space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Event Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)}
                className="w-full border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400">
                {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bhusawal Yard"
                className="w-full border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the event..."
                rows={3} className="w-full border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)}
                className="w-full border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400">
                {['LOW', 'MEDIUM', 'HIGH'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {eventType && (
              <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700">
                <span className="font-semibold">Expected action:</span> {RECOMMENDATIONS[eventType]}
              </div>
            )}

            <button onClick={handleSimulate} disabled={simulating}
              className="w-full flex items-center justify-center gap-1.5 py-2 font-semibold rounded text-white disabled:opacity-60 transition-colors"
              style={{ background: '#C0392B' }}>
              <Zap size={13} />{simulating ? 'Simulating...' : 'Simulate Event'}
            </button>
          </div>

          {lastResult && (
            <div className="border-t border-slate-100 p-3 space-y-2 text-xs">
              <div className="font-semibold text-slate-700">Last Result</div>
              <div className="font-mono text-slate-600">{lastResult.id}</div>
              <div className="text-red-600">{lastResult.affected_blocks.length} blocks, {lastResult.affected_trains.length} trains affected</div>
              <div className="text-slate-600">{lastResult.recommendation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
