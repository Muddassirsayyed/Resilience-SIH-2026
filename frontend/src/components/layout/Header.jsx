import React from 'react'
import { Circle, Bell, Calendar, User } from 'lucide-react'

export default function Header({ title, subtitle, rightContent }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {rightContent}

        {/* Global Controls / Status */}
        <div className="flex items-center gap-4">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
            <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700">Live</span>
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* Date/Time Placeholder */}
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar size={18} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-tight">09 Aug 2026</span>
              <span className="text-[10px] font-medium leading-tight text-gray-500">10:00 - 06:00</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* Notifications */}
          <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-tight flex items-center gap-1">
                Control Room
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Railway Operations</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
