import React, { useState, useEffect } from 'react'
import {
  CalendarClock, Train, ShieldAlert,
  ArrowRight, Activity, Filter, CheckCircle2,
  Clock, X, Plus, AlertTriangle, Eye, ChevronRight, CalendarRange, Search, Info, MapPin, Brain
} from 'lucide-react'
import { planningStats, planningTasks } from '../data/mockData'
import API from '../services/API'

function Header({ onCreateManual }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <CalendarRange size={18} className="text-blue-600" />
          Block Planning
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Plan maintenance blocks around train movements and available railway operating windows.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Planning System Ready
        </div>
        <div className="text-[10px] text-gray-500">
          Planning Date: <span className="font-semibold text-gray-700">{dateStr}</span>
        </div>
        <select className="text-[11px] border border-gray-200 rounded bg-white px-2 py-1 focus:outline-none focus:border-blue-400">
          <option>Select Division</option>
          <option>Agra Division</option>
          <option>Prayagraj Division</option>
        </select>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors">
          <Brain size={12} fill="currentColor" />
          Find Best Block
        </button>
        <button 
          onClick={onCreateManual}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-[11px] font-semibold rounded hover:bg-gray-50 transition-colors"
        >
          <Plus size={12} />
          Create Block Manually
        </button>
      </div>
    </div>
  )
}

function PlanningSummary() {
  const cards = [
    { label: 'Pending Maintenance', value: String(planningStats.pendingMaintenance).padStart(2, '0'), color: 'text-gray-800' },
    { label: 'Available Windows', value: String(planningStats.availableWindows).padStart(2, '0'), color: 'text-blue-600' },
    { label: 'Recommended Blocks', value: String(planningStats.recommendedBlocks).padStart(2, '0'), color: 'text-green-600' },
    { label: 'Train Conflicts', value: String(planningStats.trainConflicts).padStart(2, '0'), color: 'text-red-600' },
    { label: 'Controller Review', value: String(planningStats.controllerReview).padStart(2, '0'), color: 'text-orange-600' },
  ]

  return (
    <div className="flex gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`flex-1 bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col justify-center items-center shadow-sm`}>
          <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center mt-0.5">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function ManualBlockModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Plus size={16} className="text-blue-600" />
            Create Block Manually
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Section</label>
              <select className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none">
                <option>KNP-04</option>
                <option>KNP-02</option>
                <option>KNP-07</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Departments</label>
              <input type="text" value="Engineering, S&T" readOnly className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-50 text-gray-600 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Start Time</label>
              <input type="time" defaultValue="22:00" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">End Time</label>
              <input type="time" defaultValue="03:00" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Maintenance Tasks</label>
            <div className="border border-gray-200 rounded p-2 bg-gray-50 text-[11px] text-gray-700 h-16 overflow-y-auto">
              Selected 3 tasks from KNP-04.
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Reason</label>
            <textarea className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none h-16" placeholder="Enter reason for block..."></textarea>
          </div>
          
          <div className="bg-gray-50 p-3 rounded border border-gray-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Duration</span>
              <span className="font-semibold text-gray-800 text-xs">5 hrs</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Train Conflicts</span>
              <span className="font-semibold text-red-600 text-xs">3</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-500 uppercase">Affected Trains</span>
              <span className="font-semibold text-orange-600 text-xs">3</span>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Create Block Draft</button>
        </div>
      </div>
    </div>
  )
}

function BlockDetailPanel({ block, onClose }) {
  if (!block) return null
  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">BLOCK {block.sectionId}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Status</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            AI RECOMMENDED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Section</span>
            <span className="font-semibold text-gray-800">{block.sectionId}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Stations</span>
            <span className="font-semibold text-gray-800">AGC → MTJ</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Start</span>
            <span className="font-semibold text-gray-800">22:00</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">End</span>
            <span className="font-semibold text-gray-800">03:00</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Duration</span>
            <span className="font-semibold text-gray-800">5 hrs</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Tasks</span>
            <span className="font-semibold text-gray-800">{block.taskCount}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Departments</span>
            <span className="font-semibold text-gray-800">3</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Conflicts</span>
            <span className="font-semibold text-red-600">1</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Assets</span>
          <div className="flex flex-wrap gap-1">
            {['Track', 'Signal', 'OHE'].map(a => (
              <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{a}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
          Modify
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors">
          Review Conflicts
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Approve Block
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">
          Reject
        </button>
      </div>
    </div>
  )
}

export default function BlockPlanning() {
  const [selectedTaskIds, setSelectedTaskIds] = useState(['MT-1042', 'MT-1045', 'MT-1051'])
  const [showManualModal, setShowManualModal] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)
  
  const [availableWindows, setAvailableWindows] = useState([])
  
  useEffect(() => {
    API.getBlockWindows().then(data => setAvailableWindows(data || []))
  }, [])

  const handleTaskToggle = (id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const selectedTasks = planningTasks.filter(t => selectedTaskIds.includes(t.id))
  const totalDuration = selectedTasks.reduce((acc, t) => acc + t.durationMinutes, 0)
  const durationHrs = totalDuration / 60
  
  const depts = Array.from(new Set(selectedTasks.map(t => t.department)))
  
  // Determine if AI logic highlights KNP-04
  const showAI = selectedTaskIds.includes('MT-1042') && selectedTaskIds.includes('MT-1045') && selectedTaskIds.includes('MT-1051');

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden relative">
      <Header onCreateManual={() => setShowManualModal(true)} />
      
      {showManualModal && <ManualBlockModal onClose={() => setShowManualModal(false)} />}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <PlanningSummary />

          <div className="grid grid-cols-3 gap-4">
            
            {/* Left Column: Tasks and Section */}
            <div className="col-span-1 space-y-4">
              
              {/* Select Maintenance Work */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Select Maintenance Work</h2>
                </div>
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[300px]">
                  {planningTasks.map(task => (
                    <label key={task.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => handleTaskToggle(task.id)}
                        className="mt-1 shrink-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-semibold text-gray-800 truncate">{task.id} - {task.taskName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span>{task.sectionId}</span>
                          <span>•</span>
                          <span>{task.department}</span>
                          <span>•</span>
                          <span>{task.durationMinutes} min</span>
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5 uppercase">{task.blockRequired ? 'Block Required' : 'No Block'}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 bg-blue-50/50">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500">Selected:</span>
                    <span className="font-semibold text-gray-800">{selectedTasks.length} tasks</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500">Combined duration:</span>
                    <span className="font-semibold text-gray-800">{durationHrs} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Departments:</span>
                    <span className="font-semibold text-gray-800 text-right">{depts.length > 0 ? depts.join(' + ') : 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Section / Corridor */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Affected Section</h2>
                {selectedTasks.length > 0 ? (
                  <>
                    <div className="text-lg font-bold text-blue-600 mb-1">{selectedTasks[0].sectionId}</div>
                    <div className="text-[11px] text-gray-600 flex items-center gap-1 mb-2">
                      Station C <ArrowRight size={10} /> Station D
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase mb-1">Assets:</span>
                      <div className="flex gap-1 flex-wrap">
                        {['Track', 'Signal', 'OHE'].map(a => (
                          <span key={a} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{a}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-gray-400 italic">Select tasks to see affected section</div>
                )}
              </div>

            </div>

            {/* Right Column: AI Logic and Windows */}
            <div className="col-span-2 space-y-4">
              
              {/* AI Block Recommendation */}
              {showAI && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain size={18} className="text-blue-600" />
                      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Recommended Block</h2>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      REQUIRES CONTROLLER REVIEW
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">Recommendation:</h3>
                      <div className="text-lg font-bold text-blue-600">KNP-04 <span className="text-sm text-gray-500 font-medium ml-2">22:00 – 03:00</span></div>
                      
                      <div className="mt-3 space-y-1.5 text-[11px]">
                        <div className="flex"><span className="w-24 text-gray-500">Tasks:</span><span className="font-semibold text-gray-800">Track Defect, Signal Inspection, OHE Inspection</span></div>
                        <div className="flex"><span className="w-24 text-gray-500">Departments:</span><span className="font-semibold text-gray-800">Engineering + S&T + Traction</span></div>
                        <div className="flex"><span className="w-24 text-gray-500">Duration:</span><span className="font-semibold text-gray-800">5 hrs</span></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Reason</h4>
                        <p className="text-[11px] text-gray-700">"These maintenance activities are located on the same corridor and can be completed within the available 5-hour maintenance window."</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Asset Availability Impact</h4>
                        <p className="text-[11px] text-gray-700">"Reduces repeated corridor access and preserves daytime availability."</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Train Impact</h4>
                        <p className="text-[11px] text-red-600 font-semibold">"3 scheduled train movements require controller review."</p>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Warning inside AI Recommendation */}
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert size={14} className="text-red-600" />
                      <h4 className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Train Conflict</h4>
                    </div>
                    <div className="text-[11px] text-red-800 space-y-1">
                      <p><span className="font-semibold">Train:</span> EXP 12904, EXP 12311, GOODS G/7821</p>
                      <p><span className="font-semibold">Section:</span> KNP-04</p>
                      <p><span className="font-semibold">Proposed Block:</span> 22:00–03:00</p>
                      <p className="mt-1"><strong>Impact:</strong> Train movement overlaps the proposed maintenance block.</p>
                      <p><strong>Required Action:</strong> Controller review required.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="px-3 py-1.5 text-[11px] font-semibold bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                      Review Conflicts
                    </button>
                    <button className="px-3 py-1.5 text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      Modify Block
                    </button>
                    <button 
                      onClick={() => setSelectedBlock({sectionId: 'KNP-04', taskCount: 3})}
                      className="px-3 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ml-auto"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              )}

              {/* Block Timeline */}
              {showAI && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Block Timeline (KNP-04)</h2>
                  
                  <div className="relative pl-8 pb-4">
                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-300"></div>
                    
                    <div className="relative mb-4">
                      <div className="absolute -left-[27px] bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600">22:00</div>
                      <div className="ml-4 border border-blue-200 bg-blue-50 p-2 rounded relative">
                        <div className="absolute -left-4 top-3 w-4 h-px bg-blue-300"></div>
                        <div className="text-[10px] font-bold text-blue-800 uppercase">Engineering</div>
                        <div className="text-[11px] text-blue-900 font-medium">Track Defect</div>
                        <div className="text-[10px] text-blue-600">22:00–00:00 (2 hrs)</div>
                      </div>
                    </div>

                    <div className="relative mb-4">
                      <div className="absolute -left-[27px] bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600">00:00</div>
                      <div className="ml-4 border border-orange-200 bg-orange-50 p-2 rounded relative">
                        <div className="absolute -left-4 top-3 w-4 h-px bg-orange-300"></div>
                        <div className="text-[10px] font-bold text-orange-800 uppercase">S&T</div>
                        <div className="text-[11px] text-orange-900 font-medium">Signal Inspection</div>
                        <div className="text-[10px] text-orange-600">00:00–01:00 (1 hr)</div>
                      </div>
                    </div>

                    <div className="relative mb-4">
                      <div className="absolute -left-[27px] bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600">01:00</div>
                      <div className="ml-4 border border-green-200 bg-green-50 p-2 rounded relative">
                        <div className="absolute -left-4 top-3 w-4 h-px bg-green-300"></div>
                        <div className="text-[10px] font-bold text-green-800 uppercase">Traction</div>
                        <div className="text-[11px] text-green-900 font-medium">OHE Inspection</div>
                        <div className="text-[10px] text-green-600">01:00–03:00 (2 hrs)</div>
                      </div>
                    </div>
                    
                    <div className="absolute -left-2 bg-gray-100 px-1 py-0.5 rounded text-[10px] font-bold text-gray-600 mt-2">03:00</div>
                  </div>
                </div>
              )}

              {/* Available Block Windows */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Available Maintenance Windows</h2>
                
                <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-1 pl-16 pr-4">
                  <span>18:00</span><span>20:00</span><span>22:00</span><span>00:00</span><span>02:00</span><span>04:00</span><span>06:00</span>
                </div>
                
                <div className="space-y-3">
                  {availableWindows.map(window => {
                    const isSuitable = window.sectionId === 'KNP-04' && window.durationMinutes >= totalDuration;
                    const isPartially = window.sectionId === 'KNP-04' && window.durationMinutes < totalDuration;
                    
                    const label = isSuitable ? 'Suitable' : isPartially ? 'Partially Suitable' : 'Not Suitable';
                    const colorClass = isSuitable ? 'bg-green-100 text-green-700' : isPartially ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500';

                    // Very simple visual position approximation for demo
                    const leftMap = { 'AW-001': '16%', 'AW-002': '33%', 'AW-003': '54%' }
                    const widthMap = { 'AW-001': '12%', 'AW-002': '41%', 'AW-003': '12%' }

                    return (
                      <div key={window.id} className="flex items-center gap-3">
                        <div className="w-12 text-[11px] font-bold text-gray-700 shrink-0">{window.sectionId}</div>
                        <div className="flex-1 bg-gray-50 h-8 rounded border border-gray-100 relative">
                          <div 
                            className={`absolute top-0 bottom-0 rounded flex items-center justify-center text-[9px] font-bold uppercase transition-all
                              ${isSuitable ? 'bg-green-200 border border-green-300 text-green-800' : 'bg-gray-200 text-gray-600'}
                            `}
                            style={{ left: leftMap[window.id], width: widthMap[window.id] }}
                          >
                            {window.startTime}-{window.endTime}
                          </div>
                        </div>
                        <div className={`w-24 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded text-center uppercase tracking-wider ${colorClass}`}>
                          {label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Train Movement Check */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Train Movement Check</h2>
                  <div className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-600">
                    Window: KNP-04 (22:00 - 03:00)
                  </div>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 font-semibold">Train</th>
                      <th className="py-2 font-semibold">Scheduled Time</th>
                      <th className="py-2 font-semibold">Status</th>
                      <th className="py-2 font-semibold">Overlap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {windowTrainMovements.map(train => (
                      <tr key={train.trainId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 font-semibold text-gray-800 flex items-center gap-1.5">
                          <Train size={12} className="text-gray-400" />
                          {train.trainName}
                        </td>
                        <td className="py-2 font-medium text-gray-700">{train.scheduledTime}</td>
                        <td className="py-2 text-gray-600">{train.status}</td>
                        <td className="py-2">
                          {train.conflict ? (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <AlertTriangle size={10} /> CONFLICT
                            </span>
                          ) : (
                            <span className="text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={10} /> CLEAR
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          
          <div className="text-[10px] text-gray-500 italic mt-4 text-center pb-4">
            AI recommendations are advisory. Operational approval remains with the authorized controller.
          </div>
        </div>

        {/* Right Detail Panel */}
        {selectedBlock && (
          <BlockDetailPanel block={selectedBlock} onClose={() => setSelectedBlock(null)} />
        )}
      </div>
    </div>
  )
}
