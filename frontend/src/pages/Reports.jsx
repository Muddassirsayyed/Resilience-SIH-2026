import React, { useState } from 'react'
import {
  FileText, Download, Filter, Search, Brain, CheckCircle2, ShieldAlert
} from 'lucide-react'
import {
  performanceSummary, assetAvailabilityReport, reportTableData
} from '../data/mockData'

function Header() {
  const [exportMsg, setExportMsg] = useState('')

  const handleExport = () => {
    setExportMsg('Export service not connected yet.')
    setTimeout(() => setExportMsg(''), 3000)
  }

  return (
    <div className="flex flex-col bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Reports & Performance
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Maintenance, block utilization and railway asset availability performance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select className="text-[11px] border border-gray-200 rounded bg-white px-2 py-1.5 focus:outline-none focus:border-blue-400">
            <option>Agra Division</option>
            <option>Prayagraj Division</option>
          </select>

          <select className="text-[11px] border border-gray-200 rounded bg-white px-2 py-1.5 focus:outline-none focus:border-blue-400">
            <option>This Week</option>
            <option>Today</option>
            <option>This Month</option>
            <option>Custom</option>
          </select>

          <div className="text-[10px] text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-2 py-1.5 rounded">
            01 Sep – 08 Sep
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
          
          <div className="relative">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold rounded hover:bg-gray-50 transition-colors">
              <Download size={12} />
              Export
            </button>
            {exportMsg && (
              <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow z-50">
                {exportMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PerformanceSummary() {
  const cards = [
    { label: 'Asset Availability', value: `${performanceSummary.assetAvailability}%`, color: 'text-green-600' },
    { label: 'Maintenance Blocks', value: String(performanceSummary.maintenanceBlocks).padStart(2, '0'), color: 'text-blue-700' },
    { label: 'Completed Blocks', value: String(performanceSummary.completedBlocks).padStart(2, '0'), color: 'text-green-600' },
    { label: 'Cancelled Blocks', value: String(performanceSummary.cancelledBlocks).padStart(2, '0'), color: 'text-gray-500' },
    { label: 'Train Conflicts', value: String(performanceSummary.trainConflicts).padStart(2, '0'), color: 'text-orange-600' },
    { label: 'Resolved Conflicts', value: String(performanceSummary.resolvedConflicts).padStart(2, '0'), color: 'text-blue-600' },
    { label: 'Overdue Tasks', value: String(performanceSummary.overdueTasks).padStart(2, '0'), color: 'text-red-600' },
    { label: 'Tasks Completed', value: String(performanceSummary.tasksCompleted).padStart(2, '0'), color: 'text-green-700' },
  ]

  return (
    <div className="grid grid-cols-8 gap-2 mb-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col justify-center items-center shadow-sm h-16">
          <span className={`text-sm font-bold ${c.color}`}>{c.value}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider text-center mt-0.5 leading-tight">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function SectionPanels() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      
      {/* Asset Availability */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 col-span-1">
        <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Asset Availability</h2>
        <div className="space-y-4">
          {[
            { label: 'Track', val: assetAvailabilityReport.track },
            { label: 'Signal', val: assetAvailabilityReport.signal },
            { label: 'OHE', val: assetAvailabilityReport.ohe },
          ].map(a => (
            <div key={a.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-gray-600">{a.label}</span>
                <span className="font-bold text-gray-800">{a.val}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${a.val}%` }}></div>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-gray-900 text-[11px]">Overall</span>
              <span className="font-bold text-green-700 text-[14px]">{assetAvailabilityReport.overall}%</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
              <span>Previous Period</span>
              <span className="font-medium text-gray-700">93.8%</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
              <span>Change</span>
              <span className="font-bold text-green-600 flex items-center"><CheckCircle2 size={10} className="mr-0.5"/> +0.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Performance */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 col-span-1">
        <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Maintenance Performance</h2>
        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray-500">Total Tasks</span> <span className="font-bold text-gray-800">48</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Completed</span> <span className="font-bold text-green-600">38</span></div>
          <div className="flex justify-between"><span className="text-gray-500">In Progress</span> <span className="font-bold text-blue-600">05</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Overdue</span> <span className="font-bold text-red-600">05</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Critical Completed</span> <span className="font-bold text-gray-800">06</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Block Required</span> <span className="font-bold text-gray-800">31</span></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">79%</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Maintenance Completed</div>
        </div>
      </div>

      {/* Block Utilization */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 col-span-1">
        <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Block Utilization</h2>
        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray-500">Planned Blocks</span> <span className="font-bold text-gray-800">42</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Completed</span> <span className="font-bold text-green-600">35</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Cancelled</span> <span className="font-bold text-gray-400">02</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Modified</span> <span className="font-bold text-orange-600">05</span></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray-500">Avg Block Duration</span> <span className="font-bold text-gray-800">3h 12m</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Avg Planned Duration</span> <span className="font-bold text-gray-800">3h 25m</span></div>
        </div>
      </div>

      {/* Train Operation Impact */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 col-span-1">
        <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Train Operation Impact</h2>
        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray-500">Movements Reviewed</span> <span className="font-bold text-gray-800">420</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Affected Trains</span> <span className="font-bold text-orange-600">18</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delayed Trains</span> <span className="font-bold text-red-600">12</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Average Delay</span> <span className="font-bold text-red-600">8 min</span></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-gray-500">Conflicts Detected</span> <span className="font-bold text-orange-600">07</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Conflicts Resolved</span> <span className="font-bold text-green-600">05</span></div>
        </div>
      </div>

    </div>
  )
}

function AIPerformancePanels() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* AI Performance */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-sm p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 z-0"></div>
        <div className="relative z-10">
          <h2 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Brain size={14} className="text-blue-600" /> AI Planning Performance <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] rounded">DEMO</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-gray-500">Tasks Analyzed</span> <span className="font-bold text-gray-800">48</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Blocks Combined</span> <span className="font-bold text-blue-600">08</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Recommendations</span> <span className="font-bold text-gray-800">19</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Repeated Access Reduced</span> <span className="font-bold text-green-600">21 hrs</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Accepted</span> <span className="font-bold text-green-600">14</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Modified</span> <span className="font-bold text-orange-500">04</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Rejected</span> <span className="font-bold text-red-500">01</span></div>
          </div>
        </div>
      </div>

      {/* AI Impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4 relative">
        <h2 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">AI Planning Impact <span className="ml-2 px-1.5 py-0.5 bg-white text-gray-500 text-[8px] rounded border border-gray-200">ESTIMATED</span></h2>
        <p className="text-[11px] text-blue-800 font-medium mb-3 italic">
          "AI-assisted planning combined compatible maintenance activities into fewer corridor blocks."
        </p>
        <div className="grid grid-cols-2 gap-y-2 text-[11px] font-bold text-blue-900">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-blue-500"/> 8 blocks combined</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-blue-500"/> 21 hrs repeated access reduced</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-blue-500"/> 0.9% asset availability improvement</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-blue-500"/> 7 conflicts identified</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-blue-500"/> 5 conflicts resolved</div>
        </div>
      </div>
    </div>
  )
}

function ReportTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Operational Report</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search report..." 
              className="pl-8 pr-3 py-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-semibold rounded hover:bg-gray-50">
            <Filter size={12} /> Filters
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-[9px] uppercase tracking-wider text-gray-500 sticky top-0 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Section</th>
              <th className="px-4 py-2">Maintenance</th>
              <th className="px-4 py-2">Block</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Train Impact</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {reportTableData.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-600">{r.date}</td>
                <td className="px-4 py-3 font-bold text-blue-600">{r.section}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{r.maintenance}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{r.block}</td>
                <td className="px-4 py-3 text-gray-600">{r.duration}</td>
                <td className="px-4 py-3 text-gray-600">{r.trainImpact}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.status}
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

export default function Reports() {
  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      <Header />
      
      <div className="flex-1 p-5 overflow-y-auto flex flex-col min-h-0">
        <PerformanceSummary />
        <SectionPanels />
        <AIPerformancePanels />
        
        <ReportTable />
        
        <div className="mt-4 bg-gray-100 border border-gray-200 rounded p-3 text-center shrink-0">
          <p className="text-[10px] font-medium text-gray-600 flex justify-center items-center gap-1.5">
            <ShieldAlert size={12} />
            AI recommendations are advisory. Operational decisions remain with the authorized controller.
          </p>
        </div>
      </div>
    </div>
  )
}
