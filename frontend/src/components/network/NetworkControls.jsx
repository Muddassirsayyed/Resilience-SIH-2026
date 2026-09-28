import React from 'react'
import { MapPin, Hash, Calendar, Clock, Circle } from 'lucide-react'
import { divisions, sectionFilters } from '../../data/mockData'

export default function NetworkControls({ onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Division Select */}
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm">
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Section Select */}
        <div className="relative">
          <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm">
            {sectionFilters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Date Picker */}
        <div className="relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 focus-within:border-blue-500 hover:border-gray-300 transition-colors cursor-pointer">
          <Calendar size={14} className="text-gray-400 mr-2" />
          <input
            type="date"
            className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            defaultValue="2026-09-08"
          />
        </div>

        {/* Time Range */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 hover:border-gray-300 transition-colors">
          <Clock size={14} className="text-gray-400 mr-2" />
          <input type="time" className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none w-[72px]" defaultValue="22:00" />
          <span className="text-[10px] font-bold text-gray-400 mx-2 uppercase">to</span>
          <input type="time" className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none w-[72px]" defaultValue="06:00" />
        </div>
      </div>

      <div className="flex items-center gap-4 border border-gray-200 bg-white rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" />
          <span className="text-sm font-bold text-gray-800">Live Data</span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span className="text-[11px] font-medium text-gray-500">Last updated: 10:15 AM</span>
      </div>
    </div>
  )
}
