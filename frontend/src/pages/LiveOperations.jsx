import React, { useState, useEffect } from 'react'
import { Radio, Train, Activity } from 'lucide-react'
import { useApp } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const LIVE_ALERTS_POOL = [
  '12951 Mumbai Rajdhani passing Bhusawal at 03:47 — 2 min late',
  'Block BLK-001 maintenance in progress — KM 347+200',
  'Signal S-22 restored to normal at Moradabad',
  'Crew deployment confirmed for BLK-004 (Guwahati)',
  '12621 Tamil Nadu Express on time — Chennai',
  'Power block coordination complete — WR TPC Vadodara',
  'Track geometry car reporting — Howrah-Burdwan section',
  'BLK-003 submitted for DOM review — Salem Division',
]

export default function LiveOperations() {
  const { state } = useApp()
  const [alerts, setAlerts] = useState(LIVE_ALERTS_POOL.slice(0, 4))
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
      setAlerts(prev => {
        const newAlert = LIVE_ALERTS_POOL[Math.floor(Math.random() * LIVE_ALERTS_POOL.length)]
        return [newAlert, ...prev.slice(0, 5)]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const activeBlocks = state.blocks.filter(b => b.status === 'APPROVED')
  const pendingBlocks = state.blocks.filter(b => ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(b.status))

  const STAT_CARDS = [
    { label: 'Active Trains', value: state.trains.length, color: '#2563EB' },
    { label: 'Blocks In Progress', value: activeBlocks.length, color: '#16A34A' },
    { label: 'Pending Blocks', value: pendingBlocks.length, color: '#D97706' },
    { label: 'Active Events', value: state.events.filter(e => e.status === 'ACTIVE').length, color: '#DC2626' },
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><Radio size={18} className="text-green-500" /> Live Operations</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time train movements and active block operations · <span className="text-amber-600">Demo data</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STAT_CARDS.map(c => (
          <div key={c.label} className="bg-white border border-slate-200 rounded p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Train Movements */}
        <div className="col-span-2 bg-white border border-slate-200 rounded">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Train size={14} className="text-blue-500" />
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Train Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Train No', 'Name', 'Type', 'Origin', 'Destination', 'Pass Time', 'Priority', 'Zone'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.trains.map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-semibold text-slate-800">{t.train_number}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-[140px] truncate">{t.name}</td>
                    <td className="px-3 py-2 text-slate-500">{t.train_type}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{t.origin}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{t.destination}</td>
                    <td className="px-3 py-2 font-mono font-medium text-slate-700">{t.scheduled_pass_time}</td>
                    <td className="px-3 py-2"><StatusBadge status={t.priority} /></td>
                    <td className="px-3 py-2 font-semibold text-slate-700">{t.zone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="bg-white border border-slate-200 rounded flex flex-col">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Live Feed</h2>
            <span className="ml-auto text-[9px] text-slate-400">auto-refresh 8s</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {alerts.map((alert, i) => (
              <div key={i} className={`text-[10px] text-slate-700 p-2 rounded border ${i === 0 ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-slate-400 mr-1">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                {alert}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Blocks */}
      <div className="bg-white border border-slate-200 rounded">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <Activity size={14} className="text-green-500" />
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Active Block Operations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Window Code', 'Corridor', 'Zone', 'Time Window', 'Dept', 'Crew', 'Machine', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.blocks.map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{b.window_code}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate">{b.corridor}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-700">{b.zone}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-700">{b.start_time}–{b.end_time}</td>
                  <td className="px-3 py-2.5 text-slate-600">{b.department}</td>
                  <td className="px-3 py-2.5 text-slate-600">{b.crew}</td>
                  <td className="px-3 py-2.5 text-slate-500 max-w-[120px] truncate">{b.machine}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
