import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, RefreshCw, CalendarRange, Filter, Search,
  Train, ShieldAlert, CheckCircle2, X, Brain, CalendarClock,
  ArrowRight, Activity, Clock
} from 'lucide-react'
import {
  conflictStats, activeConflictsData, resolvedConflictsData, aiResolutionOptions
} from '../data/mockData'

function Header() {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-600" />
          Conflict Resolution
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Review train movements and maintenance blocks that cannot safely operate in the same window.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Live Conflict Monitoring
        </div>
        <div className="text-[10px] text-gray-500 text-right">
          Last updated: <br />
          <span className="font-semibold text-gray-700">Just now</span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-[11px] font-semibold rounded hover:bg-gray-50 transition-colors">
          <RefreshCw size={12} />
          Refresh Conflicts
        </button>
        <Link 
          to="/block-planning"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors"
        >
          <CalendarRange size={12} />
          View Block Planning
        </Link>
      </div>
    </div>
  )
}

function ConflictSummary() {
  const cards = [
    { label: 'Active Conflicts', value: String(conflictStats.activeConflicts).padStart(2, '0'), color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50' },
    { label: 'Critical', value: String(conflictStats.critical).padStart(2, '0'), color: 'text-red-700', border: 'border-gray-200', bg: 'bg-white' },
    { label: 'High', value: String(conflictStats.high).padStart(2, '0'), color: 'text-orange-600', border: 'border-gray-200', bg: 'bg-white' },
    { label: 'Affected Trains', value: String(conflictStats.affectedTrains).padStart(2, '0'), color: 'text-gray-800', border: 'border-gray-200', bg: 'bg-white' },
    { label: 'Blocks Requiring Review', value: String(conflictStats.blocksRequiringReview).padStart(2, '0'), color: 'text-gray-800', border: 'border-gray-200', bg: 'bg-white' },
    { label: 'Resolved Today', value: String(conflictStats.resolvedToday).padStart(2, '0'), color: 'text-green-600', border: 'border-gray-200', bg: 'bg-white' },
  ]

  return (
    <div className="flex gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`flex-1 ${c.bg} border ${c.border} rounded-lg p-2.5 flex flex-col justify-center items-center shadow-sm`}>
          <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center mt-0.5">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function RecentlyResolved() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
      <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <CheckCircle2 size={14} className="text-green-600" />
        Recently Resolved
      </h2>
      <div className="space-y-2">
        {resolvedConflictsData.map(c => (
          <div key={c.id} className="text-[10px] border border-gray-100 rounded p-2 bg-gray-50 flex items-start justify-between">
            <div>
              <div className="font-bold text-gray-700">{c.id} <span className="text-gray-400 font-normal ml-1">({c.sectionId})</span></div>
              <div className="text-gray-600 mt-0.5">Train: {c.trainId}</div>
              <div className="text-green-700 font-medium mt-1">{c.resolution}</div>
            </div>
            <div className="text-right">
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold uppercase tracking-wider">{c.status}</span>
              <div className="text-gray-400 mt-1">{c.time}</div>
              <div className="text-gray-400">{c.controller}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ManualResolutionModal({ onClose, conflict }) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            Resolve Manually - {conflict.id}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          
          <div>
            <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Resolution Type</label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none">
              <option>Move Block</option>
              <option>Shorten Block</option>
              <option>Split Maintenance</option>
              <option>Select Another Window</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">New Start Time</label>
              <input type="time" defaultValue="03:30" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">New End Time</label>
              <input type="time" defaultValue="08:30" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Reason</label>
            <textarea className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none h-16" placeholder="Enter reason for operational change..."></textarea>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Affected Trains</label>
            <input type="text" value="EXP 12904, EXP 12311, GOODS G/7821" readOnly className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-50 text-gray-600 focus:outline-none" />
          </div>
          
          <div className="bg-gray-50 p-3 rounded border border-gray-200 grid grid-cols-3 gap-2 text-center mt-2">
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Train Conflicts</span>
              <span className="font-semibold text-green-600 text-xs">0</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Block Duration</span>
              <span className="font-semibold text-gray-800 text-xs">5 hrs</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Affected Section</span>
              <span className="font-semibold text-blue-600 text-xs">KNP-04</span>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-100">Review Resolution</button>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Confirm for Controller Approval</button>
        </div>
      </div>
    </div>
  )
}

function ConflictDetailPanel({ conflict, onClose, setResolutionState }) {
  const [showManualModal, setShowManualModal] = useState(false)
  const [activeTab, setActiveTab] = useState('DETAILS')
  const aiData = aiResolutionOptions[conflict.id]

  if (!conflict) return null

  const handleAISelect = () => {
    setResolutionState(conflict.id, 'CONTROLLER REVIEW')
    alert("Recommendation selected. Controller approval is still required.\n\n(Demo action — backend integration pending.)")
  }

  return (
    <div className="w-[450px] bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-200 z-10 shadow-xl">
      {showManualModal && <ManualResolutionModal conflict={conflict} onClose={() => setShowManualModal(false)} />}
      
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            CONFLICT {conflict.id}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${conflict.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
            {conflict.severity}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 text-[11px] font-semibold bg-white sticky top-0 z-10">
        <button 
          className={`flex-1 py-2.5 text-center uppercase tracking-wider border-b-2 ${activeTab === 'DETAILS' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('DETAILS')}
        >
          Details & Timeline
        </button>
        <button 
          className={`flex-1 py-2.5 text-center uppercase tracking-wider border-b-2 ${activeTab === 'AI_OPTIONS' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('AI_OPTIONS')}
        >
          AI Suggested Options
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1 bg-gray-50/50">
        
        {activeTab === 'DETAILS' && (
          <>
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] bg-white p-3 border border-gray-200 rounded">
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Train</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1"><Train size={12} className="text-gray-400"/> {conflict.trainId}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Train Type</span>
                <span className="font-semibold text-gray-800">{conflict.trainType}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Section</span>
                <span className="font-semibold text-gray-800">{conflict.sectionId}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Affected Trains</span>
                <span className="font-semibold text-red-600">{conflict.affectedTrains}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Train Movement</span>
                <span className="font-bold text-gray-900">{conflict.trainTime}</span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Maintenance Block</span>
                <span className="font-bold text-gray-900">{conflict.blockTime}</span>
              </div>
            </div>

            {/* Why is this a conflict? */}
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert size={14} /> Why this is a conflict
              </h4>
              <div className="space-y-1.5 text-[11px] text-red-900">
                <p><span className="font-semibold">Maintenance block:</span> {conflict.blockTime}</p>
                <p><span className="font-semibold">Train movement:</span> {conflict.trainTime}</p>
                <p><span className="font-semibold">Affected section:</span> {conflict.sectionId}</p>
                <p><span className="font-semibold">Overlap:</span> 4 hours 25 minutes</p>
                <div className="mt-2 pt-2 border-t border-red-200">
                  <span className="font-semibold block mb-0.5">Operational impact:</span>
                  Train movement cannot safely use the section while the maintenance block is active.
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="bg-white border border-gray-200 rounded p-3">
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-3">Visual Timeline</h4>
              
              <div className="relative pl-10 pb-4">
                <div className="absolute left-4 top-1 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative mb-2">
                  <div className="absolute -left-10 bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600">22:00</div>
                  <div className="ml-2 border border-orange-200 bg-orange-50/50 p-2 rounded relative">
                    <div className="text-[9px] font-bold text-orange-800 uppercase tracking-wider mb-0.5">MAINTENANCE BLOCK</div>
                    <div className="text-[10px] text-gray-600">{conflict.maintenanceTasks.join(', ')}</div>
                    
                    {/* The conflict train inside the block */}
                    <div className="mt-3 bg-red-50 border border-red-200 p-2 rounded flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-800 flex items-center gap-1"><Train size={10} className="text-blue-600"/> {conflict.trainId}</span>
                        <span className="text-[10px] font-bold text-gray-800">22:35</span>
                      </div>
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={10} /> CONFLICT
                      </span>
                    </div>

                  </div>
                </div>
                
                <div className="absolute -left-10 bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600 mt-2">03:00</div>
              </div>
            </div>

            {/* Tasks & Depts */}
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-white border border-gray-200 p-2 rounded">
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">Maintenance</span>
                <ul className="list-disc pl-4 text-gray-700 space-y-0.5">
                  {conflict.maintenanceTasks.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 p-2 rounded">
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">Departments</span>
                <ul className="list-disc pl-4 text-gray-700 space-y-0.5">
                  {conflict.departments.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
          </>
        )}

        {activeTab === 'AI_OPTIONS' && aiData && (
          <div className="space-y-4">
            {aiData.options.map((opt) => {
              const isRec = opt.id === aiData.recommended;
              return (
                <div key={opt.id} className={`bg-white border-2 rounded-lg p-3 ${isRec ? 'border-blue-500 shadow-md relative overflow-hidden' : 'border-gray-200'}`}>
                  {isRec && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50 z-0"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isRec ? 'text-blue-700' : 'text-gray-800'}`}>
                        {isRec && <Brain size={14} />}
                        OPTION {opt.id} — {opt.title}
                      </h4>
                      {isRec && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          RECOMMENDED
                        </span>
                      )}
                    </div>

                    {isRec && (
                      <div className="mb-3 text-[12px] font-bold text-gray-800">
                        "{opt.title.replace('Block', 'the KNP-04 maintenance block')} to {opt.newWindow}."
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider block text-[8px]">New Window</span>
                        <span className="font-semibold text-gray-800">{opt.newWindow}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider block text-[8px]">Train Conflicts</span>
                        <span className={`font-semibold ${opt.trainConflicts === 0 ? 'text-green-600' : 'text-red-600'}`}>{opt.trainConflicts}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-gray-500 uppercase tracking-wider block text-[8px] mb-0.5">Why / Reason</span>
                      <p className="text-[10px] text-gray-700">{opt.reason}</p>
                      
                      {isRec && opt.benefits.length > 0 && (
                        <ul className="mt-1.5 list-disc pl-4 text-[10px] text-gray-700 space-y-0.5">
                          {opt.benefits.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      )}
                    </div>

                    {isRec ? (
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleAISelect} className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700">Accept Recommendation</button>
                        <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-[10px] font-bold rounded hover:bg-gray-50">Modify</button>
                        <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-[10px] font-bold rounded hover:bg-red-50">Reject</button>
                      </div>
                    ) : (
                      <button className="w-full mt-2 px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded hover:bg-gray-100 transition-colors">
                        Review Option {opt.id}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-center pt-2">
              <button 
                onClick={() => setShowManualModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                Resolve Manually
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ConflictResolution() {
  const [selectedConflict, setSelectedConflict] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('All')
  
  // Local state to simulate status changes for demo
  const [conflictStatuses, setConflictStatuses] = useState({})

  const filteredConflicts = useMemo(() => {
    return activeConflictsData.filter(c => {
      const matchSearch = c.trainId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.sectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSev = filterSeverity === 'All' || c.severity === filterSeverity;
      return matchSearch && matchSev;
    });
  }, [searchTerm, filterSeverity])

  const handleSetResolutionState = (id, newStatus) => {
    setConflictStatuses(prev => ({...prev, [id]: newStatus}))
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden relative">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <ConflictSummary />

          <div className="grid grid-cols-4 gap-4">
            
            {/* Left/Center: Conflict List */}
            <div className="col-span-3 space-y-4">
              
              {/* Controls Bar */}
              <div className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search train, block or section..." 
                      className="pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="h-4 w-px bg-gray-300"></div>
                  
                  <div className="flex items-center gap-2">
                    <Filter size={12} className="text-gray-500" />
                    <select 
                      className="text-[11px] border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500"
                      value={filterSeverity}
                      onChange={e => setFilterSeverity(e.target.value)}
                    >
                      <option value="All">All Severities</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conflict Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="px-3 py-2.5 font-semibold">Severity</th>
                      <th className="px-3 py-2.5 font-semibold">Train</th>
                      <th className="px-3 py-2.5 font-semibold">Block & Section</th>
                      <th className="px-3 py-2.5 font-semibold">Time Overlap</th>
                      <th className="px-3 py-2.5 font-semibold">Impact</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px]">
                    {filteredConflicts.map(c => {
                      const displayStatus = conflictStatuses[c.id] || c.status;
                      const isReview = displayStatus === 'CONTROLLER REVIEW';
                      return (
                        <tr 
                          key={c.id} 
                          className={`border-b border-gray-100 hover:bg-red-50/30 cursor-pointer transition-colors ${selectedConflict?.id === c.id ? 'bg-red-50/50' : ''}`}
                          onClick={() => setSelectedConflict(c)}
                        >
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${c.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                              {c.severity}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-bold text-gray-800">{c.trainId}</div>
                            <div className="text-gray-500 text-[9px] uppercase">{c.trainType}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-gray-800">{c.blockId}</div>
                            <div className="text-gray-500 text-[10px]">{c.section}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-gray-800 flex flex-col gap-0.5">
                              <span className="flex items-center gap-1"><Train size={10} className="text-blue-500"/> {c.trainTime}</span>
                              <span className="flex items-center gap-1"><Clock size={10} className="text-orange-500"/> {c.blockTime}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600 max-w-[150px]">
                            {c.impact}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`font-semibold ${isReview ? 'text-orange-600' : 'text-gray-700'}`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button 
                              className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold"
                              onClick={(e) => { e.stopPropagation(); setSelectedConflict(c); }}
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredConflicts.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-3 py-8 text-center text-gray-500 text-[11px]">
                          No conflicts match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Responsible AI Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                <p className="text-[11px] font-medium text-blue-800 flex justify-center items-center gap-2">
                  <Brain size={14} />
                  AI recommendations are advisory. Train movements and maintenance blocks are not changed automatically. Controller approval is required.
                </p>
              </div>

            </div>

            {/* Right Column: Mini Panels */}
            <div className="col-span-1 space-y-4">
              <RecentlyResolved />
            </div>

          </div>
        </div>

        {/* Right Detail Panel */}
        {selectedConflict && (
          <ConflictDetailPanel 
            conflict={selectedConflict} 
            onClose={() => setSelectedConflict(null)} 
            setResolutionState={handleSetResolutionState}
          />
        )}
      </div>
    </div>
  )
}
