import React from 'react'
import { Train, Construction, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { networkStats } from '../../data/mockData'

const counters = [
  { label: 'Active Trains', value: networkStats.activeTrains, icon: Train, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Blocks', value: String(networkStats.activeBlocks).padStart(2, '0'), icon: Construction, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Critical Sections', value: String(networkStats.criticalSections).padStart(2, '0'), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Delayed Trains', value: String(networkStats.delayedTrains).padStart(2, '0'), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Available Sections', value: `${networkStats.availableSections}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
]

export default function LiveStatusCounters() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {counters.map((c) => (
        <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
            <c.icon size={24} className={c.color} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 leading-none mb-1">{c.value}</span>
            <span className="text-[11px] font-medium text-gray-500 leading-none">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
