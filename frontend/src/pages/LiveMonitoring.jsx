import React from 'react'
import {
  Activity, RefreshCw, AlertTriangle, Info, Bell, ShieldAlert, CheckCircle2, Navigation
} from 'lucide-react'
import {
  monitoringStats, liveTrainMovements, activeBlocks, liveAlerts, assetAvailabilityReport
} from '../data/mockData'

function Header() {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity size={18} className="text-blue-600" />
          Live Monitoring
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Real-time operational status of railway sections, maintenance blocks and train movements.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-gray-600 font-semibold bg-green-50 px-2 py-1 rounded border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          LIVE
        </div>
        <div className="text-[10px] text-gray-500 text-right">
          Last updated: <br />
          <span className="font-semibold text-gray-700">Just now</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-semibold uppercase">Auto refresh:</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">ON</span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-[11px] font-semibold rounded hover:bg-gray-50 transition-colors">
          <RefreshCw size={12} />
          Refresh Now
        </button>
      </div>
    </div>
  )
}

function MonitoringSummary() {
  const cards = [
    { label: 'Active Trains', value: String(monitoringStats.activeTrains).padStart(2, '0'), color: 'text-blue-700' },
    { label: 'Active Blocks', value: String(monitoringStats.activeBlocks).padStart(2, '0'), color: 'text-orange-600' },
    { label: 'Critical Sections', value: String(monitoringStats.criticalSections).padStart(2, '0'), color: 'text-red-700' },
    { label: 'Delayed Trains', value: String(monitoringStats.delayedTrains).padStart(2, '0'), color: 'text-red-600' },
    { label: 'Affected Trains', value: String(monitoringStats.affectedTrains).padStart(2, '0'), color: 'text-orange-500' },
    { label: 'Asset Availability', value: `${monitoringStats.assetAvailability}%`, color: 'text-green-600' },
  ]

  return (
    <div className="flex gap-2 mb-4">
      {cards.map(c => (
        <div key={c.label} className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col justify-center items-center shadow-sm">
          <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider text-center mt-0.5">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function RailwaySchematic() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 relative overflow-hidden flex flex-col h-full min-h-[300px]">
      <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 z-10 relative">Live Railway Status</h2>
      <div className="flex-1 flex items-center justify-center relative">
        {/* Simple mock SVG network map for light mode */}
        <svg viewBox="0 0 400 200" className="w-full h-full max-w-[500px]" preserveAspectRatio="xMidYMid meet">
          {/* Main Line */}
          <line x1="50" y1="100" x2="350" y2="100" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
          
          {/* Active Block segment KNP-04 (red/orange) */}
          <line x1="150" y1="100" x2="250" y2="100" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
          
          {/* Branch lines */}
          <line x1="150" y1="100" x2="150" y2="40" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <line x1="250" y1="100" x2="250" y2="160" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          
          {/* Stations */}
          <circle cx="50" cy="100" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="50" y="120" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">KANPUR</text>
          
          <circle cx="150" cy="40" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="150" y="25" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">ETAWAH</text>
          
          <circle cx="150" cy="100" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="120" y="90" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">STN C</text>
          
          <circle cx="250" cy="100" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="280" y="90" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">STN D</text>
          
          <circle cx="250" cy="160" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="250" y="180" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">AGRA</text>

          <circle cx="350" cy="100" r="8" fill="#fff" stroke="#64748b" strokeWidth="3" />
          <text x="350" y="120" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="bold">MATHURA</text>

          {/* Trains */}
          <rect x="180" y="92" width="16" height="16" rx="4" fill="#3b82f6" />
          <path d="M192 100 L188 96 L188 104 Z" fill="#fff" />
          <text x="188" y="85" fontSize="8" fill="#1d4ed8" textAnchor="middle" fontWeight="bold">12904</text>
          <text x="188" y="120" fontSize="8" fill="#ef4444" textAnchor="middle" fontWeight="bold">⚠ CONFLICT</text>
        </svg>

        <div className="absolute top-2 right-2 bg-white/80 p-2 rounded text-[9px] font-bold text-gray-500 border border-gray-100 shadow-sm space-y-1 backdrop-blur-sm">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full"></div> AVAILABLE</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> MAINTENANCE BLOCK</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div> TRAIN</div>
        </div>
      </div>
    </div>
  )
}

function LiveTrainMovements() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Live Train Movements</h2>
        <span className="text-[10px] font-semibold text-gray-500">128 Active</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-[9px] uppercase tracking-wider text-gray-500 sticky top-0 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2">Train</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2 text-center">Dir</th>
              <th className="px-3 py-2">Schedule</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Impact</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {liveTrainMovements.map(t => (
              <tr key={t.trainId} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-2.5 font-bold text-gray-800">{t.trainId}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-600">{t.section}</td>
                <td className="px-3 py-2.5 text-center font-bold text-gray-400">{t.direction}</td>
                <td className="px-3 py-2.5 font-medium">{t.scheduledTime}</td>
                <td className="px-3 py-2.5">
                  <span className={`font-semibold ${t.status.includes('Delayed') ? 'text-red-600' : t.status === 'On Time' ? 'text-green-600' : 'text-blue-600'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    t.impact === 'None' ? 'bg-gray-100 text-gray-500' :
                    t.impact === 'Review' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActiveMaintenanceBlocks() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Active Maintenance Blocks</h2>
      </div>
      <div className="p-3 space-y-3 flex-1 overflow-y-auto bg-gray-50/30">
        {activeBlocks.map(b => (
          <div key={b.id} className="bg-white border border-gray-200 rounded p-3 shadow-sm hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg text-gray-800">{b.id}</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase rounded animate-pulse">
                {b.status}
              </span>
            </div>
            <div className="text-[11px] text-gray-600 space-y-1 mb-3">
              <div className="flex justify-between"><span className="text-gray-400">Time:</span> <span className="font-semibold">{b.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Depts:</span> <span className="font-semibold">{b.departments}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tasks:</span> <span className="font-semibold">{b.tasks}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Affected Trains:</span> <span className="font-semibold text-red-600">{b.affectedTrains}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold py-1.5 rounded hover:bg-gray-100 transition-colors">
                View Block
              </button>
              {b.affectedTrains > 0 && (
                <button className="flex-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold py-1.5 rounded hover:bg-red-100 transition-colors">
                  View Conflict
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveAlerts() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <Bell size={14} className="text-gray-500" />
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Live Operational Alerts</h2>
      </div>
      <div className="p-2 space-y-1 flex-1 overflow-y-auto">
        {liveAlerts.map(a => {
          const isCrit = a.severity === 'CRITICAL'
          const isWarn = a.severity === 'WARNING'
          const color = isCrit ? 'text-red-700' : isWarn ? 'text-orange-700' : 'text-blue-700'
          const bg = isCrit ? 'bg-red-50 border-red-100' : isWarn ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
          const Icon = isCrit ? ShieldAlert : isWarn ? AlertTriangle : Info
          return (
            <div key={a.id} className={`flex items-start gap-2 p-2 rounded border ${bg}`}>
              <Icon size={14} className={`${color} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{a.severity}</div>
                <div className="text-[11px] font-semibold text-gray-800 truncate">{a.event}</div>
                <div className="flex justify-between items-center mt-0.5 text-[9px] text-gray-500">
                  <span className="font-semibold">{a.location}</span>
                  <span>{a.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AssetAvailability() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col">
      <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Asset Availability</h2>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {[
          { label: 'Track', val: assetAvailabilityReport.track },
          { label: 'Signal', val: assetAvailabilityReport.signal },
          { label: 'OHE / Traction', val: assetAvailabilityReport.ohe },
          { label: 'Overall', val: assetAvailabilityReport.overall, isTotal: true },
        ].map(a => (
          <div key={a.label}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className={`font-semibold ${a.isTotal ? 'text-gray-900' : 'text-gray-600'}`}>{a.label}</span>
              <span className={`font-bold ${a.isTotal ? 'text-green-700 text-[12px]' : 'text-gray-800'}`}>{a.val}%</span>
            </div>
            <div className={`w-full bg-gray-100 rounded-full ${a.isTotal ? 'h-2.5' : 'h-1.5'}`}>
              <div className={`bg-green-500 h-full rounded-full`} style={{ width: `${a.val}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveTimeline() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 col-span-2">
      <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Today's Live Timeline</h2>
      
      <div className="flex items-center text-[10px] text-gray-400 font-bold justify-between px-8 mb-2">
        <span>18:00</span><span>20:00</span><span>22:00</span><span>00:00</span><span>02:00</span><span>04:00</span><span>06:00</span>
      </div>
      
      <div className="relative mx-8 h-20 bg-gray-50 border border-gray-100 rounded mb-4">
        <div className="absolute left-[33%] top-4 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 relative z-10"></div>
          <div className="w-px h-16 bg-gray-300 absolute top-2"></div>
          <div className="mt-2 text-[9px] font-bold text-orange-700 whitespace-nowrap bg-orange-50 px-1 py-0.5 rounded border border-orange-100 relative z-20">22:00 KNP-04 Start</div>
        </div>

        <div className="absolute left-[38%] top-0 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 relative z-10 animate-pulse"></div>
          <div className="w-px h-20 bg-gray-300 absolute top-2"></div>
          <div className="mt-14 text-[9px] font-bold text-red-700 whitespace-nowrap bg-red-50 px-1 py-0.5 rounded border border-red-100 relative z-20">22:35 Train Conflict</div>
        </div>

        <div className="absolute left-[54%] top-4 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 relative z-10"></div>
          <div className="w-px h-16 bg-gray-300 absolute top-2"></div>
          <div className="mt-2 text-[9px] font-bold text-orange-700 whitespace-nowrap bg-orange-50 px-1 py-0.5 rounded border border-orange-100 relative z-20">00:30 KNP-07 Start</div>
        </div>

        <div className="absolute left-[75%] top-0 flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 relative z-10"></div>
          <div className="w-px h-20 bg-gray-300 absolute top-2"></div>
          <div className="mt-14 text-[9px] font-bold text-green-700 whitespace-nowrap bg-green-50 px-1 py-0.5 rounded border border-green-100 relative z-20">03:00 KNP-04 End</div>
        </div>
      </div>
    </div>
  )
}

export default function LiveMonitoring() {
  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      <Header />
      
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        <MonitoringSummary />

        <div className="grid grid-cols-4 gap-4 h-[350px]">
          <div className="col-span-2 flex flex-col h-full">
            <RailwaySchematic />
          </div>
          <div className="col-span-1 flex flex-col h-full">
            <LiveTrainMovements />
          </div>
          <div className="col-span-1 flex flex-col h-full">
            <LiveAlerts />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 flex flex-col">
            <ActiveMaintenanceBlocks />
          </div>
          <div className="col-span-1 flex flex-col">
            <AssetAvailability />
          </div>
          <div className="col-span-2 flex flex-col">
            <LiveTimeline />
          </div>
        </div>
      </div>
    </div>
  )
}
