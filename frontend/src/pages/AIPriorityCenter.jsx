import React, { useState, useEffect } from 'react'
import {
  Brain, AlertTriangle, ShieldAlert, Wrench,
  Clock, MapPin, Activity, Train, Info,
  Search, Filter, ChevronRight, X
} from 'lucide-react'
import {
  priorityStats, aiRecommendation
} from '../data/mockData'
import API from '../services/API'

function Header() {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Brain size={18} className="text-blue-600" />
          AI Priority Center
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          AI-assisted maintenance prioritization for railway asset availability and safe train operations.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Engine Ready
        </div>
        <div className="text-[10px] text-gray-500 text-right">
          Last analysis: <br />
          <span className="font-semibold text-gray-700">{priorityStats.lastAnalysis}</span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors">
          <Play size={12} fill="currentColor" />
          Run Priority Analysis
        </button>
      </div>
    </div>
  )
}

function SummaryCards() {
  const cards = [
    { label: 'Critical', value: '04', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'High', value: '07', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Medium', value: '09', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Low', value: '04', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Immediate Attention', value: '04', color: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-200' },
    { label: 'Block Recommended', value: '08', color: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-200' },
  ]

  return (
    <div className="flex gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`flex-1 ${c.bg} border ${c.border} rounded-lg p-2.5 flex flex-col justify-center items-center`}>
          <span className={`text-xl font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[10px] text-gray-600 uppercase tracking-wider text-center mt-0.5">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function PriorityExplanation() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-3">
      <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
      <div>
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">How AI Prioritizes Maintenance</h3>
        <p className="text-[11px] text-blue-800 leading-relaxed mb-2">
          The AI engine analyzes operational data to recommend maintenance priority based on the following factors:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-blue-700">
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 1. Safety / Criticality</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 2. Urgency</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 3. Asset Availability Impact</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 4. Train Movement Impact</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 5. Maintenance Duration</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 6. Overdue Status</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> 7. Dept / Section Dependencies</span>
        </div>
      </div>
    </div>
  )
}

function AIRecommendationPanel() {
  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Recommendation</h2>
        </div>
        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Recommended
        </span>
      </div>
      
      <p className="text-sm font-bold text-gray-800 mb-2 relative z-10">
        Prioritize KNP-04 Track Defect
      </p>
      
      <div className="text-[11px] text-gray-600 mb-3 relative z-10">
        <span className="font-semibold text-gray-700 uppercase tracking-wider">Reason:</span><br/>
        Safety-related defect + immediate urgency + high corridor usage.
      </div>

      <div className="text-[11px] text-gray-600 mb-4 relative z-10">
        <span className="font-semibold text-gray-700 uppercase tracking-wider">Suggested action:</span><br/>
        Include in the next available maintenance block.
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <button className="px-3 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Add to Block Plan
        </button>
        <button className="px-3 py-1.5 text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </div>
    </div>
  )
}

function PriorityDetailPanel({ task, onClose }) {
    const [mlData, setMlData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (task) {
        setLoading(true);
        API.predictPriority(task).then(res => {
          if (res) setMlData(res);
          setLoading(false);
        });
      }
    }, [task]);

    if (!task) return null;
    
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{task.taskName || task.id}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{task.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
  
        <div className="p-4 space-y-4 flex-1">
          {/* Core Details */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Priority</span>
              <span className={`font-semibold ${task.priority === 'CRITICAL' ? 'text-red-600' : task.priority === 'HIGH' ? 'text-orange-600' : 'text-blue-600'}`}>{task.priority}</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Section</span>
              <span className="font-semibold text-gray-800">{task.sectionId}</span>
            </div>
          </div>

          {/* ML Advisory Panel */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4">
             <div className="flex items-center gap-1.5 mb-2">
               <Brain size={14} className="text-blue-600" />
               <span className="text-[11px] font-bold text-blue-900 tracking-tight uppercase">AI Priority Advisory</span>
             </div>
             {loading ? (
                <div className="text-[10px] text-gray-500">Running ML inference...</div>
             ) : mlData ? (
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rule Engine:</span>
                    <span className="font-semibold text-gray-800">{mlData.rule_engine_priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ML Model:</span>
                    <span className="font-semibold text-gray-800">{mlData.ml_priority || 'N/A'} (Conf: {(mlData.ml_confidence * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Agreement:</span>
                    <span className={`font-semibold ${mlData.agreement ? 'text-green-600' : 'text-red-600'}`}>
                      {mlData.agreement ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <span className="font-semibold text-blue-900 block mb-1">Why:</span>
                    <p className="text-gray-700 leading-snug">{mlData.reason}</p>
                  </div>
                </div>
             ) : (
                <div className="text-[10px] text-gray-500">ML Prediction Unavailable</div>
             )}
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Asset</span>
            <span className="font-semibold text-gray-800">{task.asset}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Department</span>
            <span className="font-semibold text-gray-800">{task.department}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Detected</span>
            <span className="font-semibold text-gray-800">{task.detectedTime}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Due</span>
            <span className="font-semibold text-gray-800">{task.urgency}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Est. Duration</span>
            <span className="font-semibold text-gray-800">{task.estimatedDuration}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Block Req.</span>
            <span className="font-semibold text-gray-800">{task.blockRequired ? 'YES' : 'NO'}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Why this task is high priority</h4>
          <div className="space-y-2 bg-gray-50 p-2.5 rounded border border-gray-100">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600">Criticality</span>
              <span className={`font-semibold ${task.criticality === 'HIGH' ? 'text-red-600' : 'text-gray-800'}`}>{task.criticality}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600">Urgency</span>
              <span className={`font-semibold ${task.urgency === 'Immediate' ? 'text-red-600' : 'text-gray-800'}`}>{task.urgency.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600">Asset Impact</span>
              <span className={`font-semibold ${task.assetImpact === 'HIGH' ? 'text-orange-600' : 'text-gray-800'}`}>{task.assetImpact}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600">Train Impact</span>
              <span className="font-semibold text-gray-800">{task.trainImpact} {task.trainImpact === 1 ? 'train' : 'trains'}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-600">Duration</span>
              <span className="font-semibold text-gray-800">{task.estimatedDuration}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Brain size={14} className="text-blue-600" />
            <h4 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">AI Recommendation</h4>
          </div>
          <p className="text-[11px] text-blue-900 bg-blue-50 p-2.5 rounded border border-blue-100 italic">
            "{task.aiRecommendationDetail}"
          </p>
        </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Add to Block Plan
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
          Review Maintenance
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">
          Dismiss Recommendation
        </button>
      </div>
    </div>
  )
}

export default function AIPriorityCenter() {
  const [selectedTask, setSelectedTask] = useState(null)
  
  const [priorityTasks, setPriorityTasks] = useState([])
  
  useEffect(() => {
    API.getMaintenanceTasks().then(data => setPriorityTasks(data || []))
  }, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')

  const getPriorityStyle = (prio) => {
    switch(prio) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  }

  const filteredTasks = useMemo(() => {
    return priorityTasks.filter(t => {
      const matchSearch = t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.sectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.asset.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = filterDept === 'All' || t.department === filterDept;
      const matchPrio = filterPriority === 'All' || t.priority === filterPriority;
      return matchSearch && matchDept && matchPrio;
    });
  }, [searchTerm, filterDept, filterPriority])

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <SummaryCards />
              <PriorityExplanation />
            </div>
            <div className="col-span-1">
              <AIRecommendationPanel />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-3 bg-white p-2 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search maintenance task..." 
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
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="S&T">S&T</option>
                  <option value="Traction">Traction</option>
                </select>
                
                <select 
                  className="text-[11px] border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500"
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                >
                  <option value="All">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 italic">
              AI recommendations are advisory. Controller approval is required for operational action.
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2.5 font-semibold w-12 text-center">Pri</th>
                  <th className="px-3 py-2.5 font-semibold">Priority</th>
                  <th className="px-3 py-2.5 font-semibold">Task</th>
                  <th className="px-3 py-2.5 font-semibold">Section & Asset</th>
                  <th className="px-3 py-2.5 font-semibold">Urgency</th>
                  <th className="px-3 py-2.5 font-semibold">Impact</th>
                  <th className="px-3 py-2.5 font-semibold w-64">AI Reason</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedTask?.id === task.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-3 py-3 text-center font-bold text-gray-700">{task.rank}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-800">{task.taskName}</div>
                      <div className="text-gray-500 text-[10px]">{task.department}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-800">{task.sectionId}</div>
                      <div className="text-gray-500 text-[10px]">{task.asset}</div>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {task.urgency}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-gray-800">{task.trainImpact} {task.trainImpact === 1 ? 'train' : 'trains'}</div>
                      <div className={`text-[9px] font-medium ${task.blockRequired ? 'text-orange-600' : 'text-gray-500'}`}>
                        {task.blockRequired ? 'Block Req.' : 'No Block'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 leading-snug">
                      {task.aiReason}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button 
                        className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 font-medium"
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500 text-[11px]">
                      No maintenance tasks match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Detail Panel */}
        {selectedTask && (
          <PriorityDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </div>
    </div>
  )
}
