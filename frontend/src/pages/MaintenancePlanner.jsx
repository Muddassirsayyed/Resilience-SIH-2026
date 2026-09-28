import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays, CalendarClock, RefreshCw, Play, Filter,
  Search, Brain, AlertTriangle, ShieldAlert, CheckCircle2,
  X, Plus, ChevronRight, Activity
} from 'lucide-react'
import {
  plannerStats, weeklyBlocks, monthlyWorkload, overdueWork, pendingMaintenanceTasks
} from '../data/mockData'

import API from '../services/API'

function Header({ view, setView }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDemoComplete, setShowDemoComplete] = useState(false)
  const [optResult, setOptResult] = useState(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    const result = await API.generateOptimization({ scope: view })
    setIsGenerating(false)
    setOptResult(result)
    setShowDemoComplete(true)
    setTimeout(() => setShowDemoComplete(false), 5000)
  }

  return (
    <div className="flex flex-col bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-600" />
            Maintenance Planning
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Weekly and monthly maintenance block planning for railway asset availability.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded p-1 bg-gray-50">
            <button 
              className={`px-3 py-1 text-[11px] font-semibold rounded ${view === 'week' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setView('week')}
            >
              WEEK
            </button>
            <button 
              className={`px-3 py-1 text-[11px] font-semibold rounded ${view === 'month' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setView('month')}
            >
              MONTH
            </button>
          </div>
          
          <select className="text-[11px] border border-gray-200 rounded bg-white px-2 py-1.5 focus:outline-none focus:border-blue-400">
            <option>Agra Division</option>
            <option>Prayagraj Division</option>
          </select>

          <input type="date" defaultValue="2026-09-07" className="text-[11px] border border-gray-200 rounded bg-white px-2 py-1.5 focus:outline-none focus:border-blue-400" />

          <button className="p-1.5 text-gray-500 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
          </button>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            {isGenerating ? 'Analyzing...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {showDemoComplete && (
        <div className="bg-green-50 border-b border-green-200 px-5 py-2 flex items-center justify-between text-[11px] animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle2 size={14} className="text-green-600" />
            {optResult?.message || 'Plan generated successfully.'}
          </div>
          <div className="flex gap-4 text-green-700 font-semibold">
            <span>Tasks: {optResult?.tasks || 24}</span>
            <span>Blocks: {optResult?.blocks || 12}</span>
            <span className="text-red-600">Conflicts: {optResult?.conflicts || 3}</span>
            <span className="text-orange-600">Pending Controller Review: {optResult?.pendingReview || 4}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanningSummary() {
  const cards = [
    { label: 'Planned Tasks', value: String(plannerStats.plannedTasks).padStart(2, '0'), color: 'text-gray-800' },
    { label: 'Planned Blocks', value: String(plannerStats.plannedBlocks).padStart(2, '0'), color: 'text-blue-600' },
    { label: 'Pending Approval', value: String(plannerStats.pendingApproval).padStart(2, '0'), color: 'text-orange-600' },
    { label: 'Critical Pending', value: String(plannerStats.criticalPending).padStart(2, '0'), color: 'text-red-700' },
    { label: 'Train Conflicts', value: String(plannerStats.trainConflicts).padStart(2, '0'), color: 'text-red-600' },
    { label: 'Overdue Work', value: String(plannerStats.overdueWork).padStart(2, '0'), color: 'text-orange-600' },
    { label: 'Asset Availability', value: `${plannerStats.assetAvailability}%`, color: 'text-green-600' },
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

function StatusBadge({ status }) {
  let color = 'bg-gray-100 text-gray-600 border-gray-200'
  if (status === 'APPROVED') color = 'bg-green-100 text-green-700 border-green-200'
  if (status === 'AI RECOMMENDED') color = 'bg-blue-100 text-blue-700 border-blue-200'
  if (status === 'CONTROLLER REVIEW') color = 'bg-orange-100 text-orange-700 border-orange-200'
  if (status === 'DRAFT') color = 'bg-gray-100 text-gray-600 border-gray-200'

  return <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border rounded ${color}`}>{status}</span>
}

function BlockDetailPanel({ block, onClose }) {
  if (!block) return null
  return (
    <div className="w-[350px] bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-200 z-10 shadow-xl">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">BLOCK {block.sectionId}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Status</span>
          <StatusBadge status={block.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Date</span>
            <span className="font-semibold text-gray-800">{block.day}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Section</span>
            <span className="font-semibold text-gray-800">{block.sectionId}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Start</span>
            <span className="font-semibold text-gray-800">{block.startTime}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">End</span>
            <span className="font-semibold text-gray-800">{block.endTime}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Duration</span>
            <span className="font-semibold text-gray-800">{block.durationMinutes / 60} hrs</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Tasks</span>
            <span className="font-semibold text-gray-800">{block.tasks.length}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Affected Trains</span>
            <span className="font-semibold text-orange-600">{block.affectedTrains}</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Conflicts</span>
            <span className={`font-semibold ${block.trainConflicts > 0 ? 'text-red-600' : 'text-gray-800'}`}>{block.trainConflicts}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <span className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Departments</span>
          <div className="space-y-1">
            {block.departments.map(d => <div key={d} className="text-[11px] font-semibold text-gray-800">{d}</div>)}
          </div>
        </div>

        {block.trainConflicts > 0 && (
          <div className="bg-red-50 border border-red-200 p-2.5 rounded flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-600 mt-0.5" />
            <div>
              <span className="block text-[10px] font-bold text-red-800 uppercase tracking-wider mb-0.5">TRAIN CONFLICT</span>
              <p className="text-[10px] text-red-700">Train movement overlaps planned block.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
          View Block
        </button>
        {block.trainConflicts > 0 && (
          <button className="w-full px-3 py-2 text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition-colors">
            Review Conflict
          </button>
        )}
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
          Modify
        </button>
        <button className="w-full px-3 py-2 text-[11px] font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Approve
        </button>
      </div>
    </div>
  )
}

function AddMaintenanceModal({ onClose }) {
  const [selected, setSelected] = useState([])

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Plus size={16} className="text-blue-600" />
            Add Maintenance to Plan
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="text-[11px] text-gray-500 mb-2">Select pending tasks to aggregate into a new block:</div>
          
          <div className="space-y-2 border border-gray-200 rounded p-2 max-h-60 overflow-y-auto">
            {pendingMaintenanceTasks.map(task => (
              <label key={task.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                <input type="checkbox" checked={selected.includes(task.id)} onChange={() => toggle(task.id)} className="mt-1" />
                <div className="flex-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">{task.id} - {task.task}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{task.priority}</span>
                  </div>
                  <div className="text-gray-500 mt-1">{task.sectionId} • {task.department} • {task.duration}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2">AI Suggested Planning</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-blue-900">
              <div><span className="text-blue-600/70 block">Date</span><span className="font-semibold">Tuesday</span></div>
              <div><span className="text-blue-600/70 block">Window</span><span className="font-semibold">22:00 – 03:00</span></div>
              <div><span className="text-blue-600/70 block">Section</span><span className="font-semibold">KNP-04</span></div>
              <div><span className="text-blue-600/70 block">Est. Duration</span><span className="font-semibold">5 hrs</span></div>
            </div>
          </div>

        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Add to Plan (Draft)
          </button>
        </div>
      </div>
    </div>
  )
}

function WeeklyView({ onBlockClick, onAdd }) {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THU', 'FRI', 'SAT', 'SUN']
  
  return (
    <div className="flex gap-4">
      {/* Main Board */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Weekly Planning Board</h2>
          <button onClick={onAdd} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800">
            <Plus size={12} /> Add Maintenance
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {days.map(day => {
            const blocks = weeklyBlocks.filter(b => b.day === day)
            return (
              <div key={day} className="relative pl-24">
                <div className="absolute left-0 top-2 w-20 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">{day}</div>
                {blocks.length === 0 ? (
                  <div className="h-8 border-b border-gray-100"></div>
                ) : (
                  <div className="space-y-2 border-l-2 border-gray-200 pl-4 pb-4">
                    {blocks.map(block => (
                      <div 
                        key={block.id} 
                        onClick={() => onBlockClick(block)}
                        className={`p-3 rounded border hover:shadow-md cursor-pointer transition-all ${
                          block.status === 'APPROVED' ? 'bg-green-50/50 border-green-200' :
                          block.status === 'CONTROLLER REVIEW' ? 'bg-orange-50/50 border-orange-200' :
                          block.status === 'AI RECOMMENDED' ? 'bg-blue-50/50 border-blue-200' :
                          'bg-gray-50/50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-bold text-gray-800 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                              {block.startTime}–{block.endTime}
                            </span>
                            <span className="text-[12px] font-bold text-blue-600">{block.sectionId}</span>
                          </div>
                          <StatusBadge status={block.status} />
                        </div>
                        
                        <div className="text-[10px] text-gray-600 mb-2">
                          <span className="font-semibold text-gray-700">{block.departments.join(' + ')}</span> • {block.tasks.join(', ')} • {block.durationMinutes / 60} hrs
                        </div>

                        {block.affectedTrains > 0 && (
                          <div className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${block.trainConflicts > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {block.trainConflicts > 0 ? <AlertTriangle size={10} /> : <Activity size={10} />}
                            {block.trainConflicts > 0 ? `${block.trainConflicts} Train Conflicts` : `${block.affectedTrains} Affected Trains`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right AI Panel */}
      <div className="w-80 shrink-0 space-y-4">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50 z-0"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-600" />
                <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">AI Weekly Recommendation</h2>
              </div>
            </div>

            <p className="text-[12px] font-bold text-gray-800 mb-2">
              "Move 3 KNP-04 maintenance activities to Tuesday 22:00–03:00."
            </p>

            <div className="text-[10px] text-gray-600 mb-3">
              <span className="font-semibold text-gray-700 uppercase block mb-0.5 text-[9px]">Reason:</span>
              Same corridor + Compatible maintenance activities + Available 5-hour window + Lower daytime train disruption.
            </div>

            <div className="text-[10px] text-green-700 bg-green-50 p-2 rounded border border-green-100 mb-4">
              <span className="font-semibold uppercase block mb-0.5 text-[9px]">Expected result:</span>
              3 tasks combined • 1 maintenance block • 2.5 hours reduced repeated access.
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700">Review Plan</button>
              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-[10px] font-bold rounded hover:bg-gray-50">Modify</button>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
          <p className="text-[10px] font-medium text-blue-800 flex justify-center items-center gap-1.5">
            <ShieldAlert size={12} />
            AI recommendations are advisory. Operational approval remains with the authorized controller.
          </p>
        </div>
      </div>
    </div>
  )
}

function MonthlyView() {
  const renderCalendar = () => {
    let days = []
    for(let i=1; i<=30; i++) {
      const hasBlock = [7,8,9,14,15,21,25,28].includes(i);
      const hasCritical = [7, 14, 28].includes(i);
      const hasConflict = [7].includes(i);

      days.push(
        <div key={i} className="aspect-square bg-white border border-gray-100 p-1 hover:bg-gray-50 cursor-pointer flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-gray-500">{i}</span>
          <div className="flex gap-0.5 justify-center mt-auto pb-1">
            {hasBlock && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
            {hasCritical && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
            {hasConflict && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
          </div>
        </div>
      )
    }
    return days;
  }

  return (
    <div className="flex gap-4">
      {/* Calendar Grid */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Monthly Maintenance Plan</h2>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
            <div key={d} className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{d}</div>
          ))}
          {renderCalendar()}
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 justify-center">
          <span className="flex items-center gap-1 text-[10px] text-gray-600"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Maintenance Block</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Critical Work</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> Conflict</span>
        </div>
      </div>

      {/* Right Data Panels */}
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        
        {/* Dept Workload */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-3">Department Workload</h2>
          <div className="space-y-3">
            {monthlyWorkload.departments.map(d => (
              <div key={d.name} className="flex justify-between items-center text-[10px]">
                <span className="font-semibold text-gray-700 w-28">{d.name}</span>
                <span className="text-gray-500">{d.tasks} Tasks</span>
                <span className="text-blue-600 font-medium">{d.blocks} Blocks</span>
                <span className={`${d.critical > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>{d.critical} Crit</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Workload */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-3">Section Workload</h2>
          <div className="space-y-3">
            {monthlyWorkload.sections.map(s => (
              <div key={s.sectionId} className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-gray-800 w-16">{s.sectionId}</span>
                <span className="text-gray-500">{s.blocks} Blocks</span>
                <span className="text-gray-500">{s.tasks} Tasks</span>
                <span className={`${s.conflicts > 0 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>{s.conflicts} Conf</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Work */}
        <div className="bg-white border border-red-200 rounded-lg shadow-sm p-3 border-t-4 border-t-red-500">
          <h2 className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Overdue Work Not Yet Planned
          </h2>
          <div className="space-y-2">
            {overdueWork.map(o => (
              <div key={o.id} className="bg-red-50 p-2 rounded border border-red-100">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[10px] text-gray-800">{o.task}</span>
                  <span className="text-[8px] font-bold bg-red-100 text-red-700 px-1 py-0.5 rounded uppercase">{o.priority}</span>
                </div>
                <div className="text-[10px] text-gray-600 mb-1">{o.sectionId} • {o.department}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-bold text-red-600">{o.overdueTime}</span>
                  <button className="text-[9px] font-bold uppercase text-blue-600 hover:text-blue-800">Plan Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function MaintenancePlanner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'month' ? 'month' : 'week'
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const setView = (newView) => {
    setSearchParams({ view: newView })
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden relative">
      <Header view={view} setView={setView} />
      
      {showAddModal && <AddMaintenanceModal onClose={() => setShowAddModal(false)} />}

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col">
          <PlanningSummary />
          
          <div className="flex-1 flex flex-col min-h-0">
            {view === 'week' ? (
              <WeeklyView 
                onBlockClick={setSelectedBlock} 
                onAdd={() => setShowAddModal(true)} 
              />
            ) : (
              <MonthlyView />
            )}
          </div>
        </div>

        {selectedBlock && view === 'week' && (
          <BlockDetailPanel block={selectedBlock} onClose={() => setSelectedBlock(null)} />
        )}
      </div>
    </div>
  )
}
