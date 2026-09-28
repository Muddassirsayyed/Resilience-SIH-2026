import React, { useState, useEffect } from 'react'
import { Bell, User, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../../store/appStore'

const ZONES = ['ALL', 'CR', 'WR', 'NR', 'SR', 'ER', 'SCR', 'SWR', 'NFR', 'NCR', 'ECR', 'SECR', 'NWR', 'WCR', 'NER', 'SER']
const DIVISIONS = {
  ALL: ['ALL'],
  CR: ['ALL', 'Mumbai', 'Bhusawal', 'Pune', 'Nagpur', 'Solapur'],
  WR: ['ALL', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Ratlam'],
  NR: ['ALL', 'Delhi', 'Ambala', 'Moradabad', 'Lucknow', 'Firozpur'],
  SR: ['ALL', 'Chennai', 'Trichy', 'Madurai', 'Salem', 'Palakkad'],
  ER: ['ALL', 'Howrah', 'Sealdah', 'Asansol', 'Malda'],
  SCR: ['ALL', 'Hyderabad', 'Secunderabad', 'Vijayawada', 'Guntur'],
  SWR: ['ALL', 'Bangalore', 'Mysore', 'Hubli'],
  NFR: ['ALL', 'Katihar', 'Lumding', 'Tinsukia', 'Alipurduar'],
  NCR: ['ALL', 'Prayagraj', 'Agra', 'Jhansi'],
  ECR: ['ALL', 'Hajipur', 'Danapur', 'Dhanbad', 'Mughal Sarai'],
  SECR: ['ALL', 'Bilaspur', 'Raipur', 'Nagpur'],
  NWR: ['ALL', 'Jaipur', 'Ajmer', 'Jodhpur', 'Bikaner'],
  WCR: ['ALL', 'Jabalpur', 'Bhopal', 'Kota'],
  NER: ['ALL', 'Gorakhpur', 'Lucknow', 'Varanasi'],
  SER: ['ALL', 'Kharagpur', 'Ranchi', 'Chakradharpur', 'Adra'],
}

export default function TopBar() {
  const { state, dispatch } = useApp()
  const [time, setTime] = useState(new Date())
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const divisions = DIVISIONS[state.selectedZone] || ['ALL']

  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  const notifCount = state.events.filter(e => e.status === 'ACTIVE').length + 3

  return (
    <header className="h-12 flex items-center gap-3 px-4 bg-white border-b border-slate-200 shrink-0 z-30">
      {/* Zone */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Zone</span>
        <select
          value={state.selectedZone}
          onChange={e => { dispatch({ type: 'SET_ZONE', payload: e.target.value }); dispatch({ type: 'SET_DIVISION', payload: 'ALL' }) }}
          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-red-400 bg-white text-slate-700"
        >
          {ZONES.map(z => <option key={z}>{z}</option>)}
        </select>
      </div>

      {/* Division */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Division</span>
        <select
          value={state.selectedDivision}
          onChange={e => dispatch({ type: 'SET_DIVISION', payload: e.target.value })}
          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-red-400 bg-white text-slate-700"
        >
          {divisions.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-50 border border-green-200">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-semibold text-green-700">OPERATIONAL</span>
      </div>

      {/* Backend status */}
      <div className="flex items-center gap-1 text-[10px]">
        {state.backendOnline ? (
          <><Wifi size={12} className="text-green-500" /><span className="text-green-600">API Online</span></>
        ) : (
          <><WifiOff size={12} className="text-amber-500" /><span className="text-amber-600">Demo Mode</span></>
        )}
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div className="text-right">
        <div className="text-xs font-mono font-semibold text-slate-800">{timeStr}</div>
        <div className="text-[9px] text-slate-500">{dateStr}</div>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(n => !n)}
          className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 top-9 w-72 bg-white border border-slate-200 rounded shadow-lg z-50 text-xs">
            <div className="px-3 py-2 border-b border-slate-100 font-semibold text-slate-700">Notifications</div>
            {state.events.filter(e => e.status === 'ACTIVE').map(e => (
              <div key={e.id} className="px-3 py-2 border-b border-slate-100 hover:bg-slate-50">
                <div className="font-medium text-red-600">{e.event_type.replace(/_/g, ' ')}</div>
                <div className="text-slate-500 mt-0.5 truncate">{e.description}</div>
              </div>
            ))}
            <div className="px-3 py-2 border-b border-slate-100 hover:bg-slate-50">
              <div className="font-medium text-amber-600">3 Block Approvals Pending</div>
              <div className="text-slate-500 mt-0.5">APR-002, APR-003, APR-004 awaiting review</div>
            </div>
            <div className="px-3 py-2 text-center text-slate-500 hover:bg-slate-50 cursor-pointer" onClick={() => setShowNotif(false)}>
              Close
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: '#C0392B' }}>
          {state.currentUser.initials}
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-semibold text-slate-800 leading-none">{state.currentUser.name}</div>
          <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{state.currentUser.role}</div>
        </div>
      </div>
    </header>
  )
}
