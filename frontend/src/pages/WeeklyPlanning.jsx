import React, { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useApp } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const BASE_DATE = new Date('2024-09-16')

function getWeekDates(base) {
  const dates = []
  const day = base.getDay()
  const mon = new Date(base)
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1))
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function WeeklyPlanning() {
  const { state } = useApp()
  const [week, setWeek] = useState(0)

  const base = new Date(BASE_DATE)
  base.setDate(base.getDate() + week * 7)
  const dates = getWeekDates(base)

  const byDate = (dateStr) => state.tasks.filter(t => t.preferred_date === dateStr)
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><CalendarDays size={18} className="text-blue-500" /> Weekly Planning</h1>
          <p className="text-xs text-slate-500 mt-0.5">Weekly maintenance schedule view</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeek(w => w - 1)} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50">← Prev</button>
          <span className="text-xs font-semibold text-slate-700">{dates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {dates[6].toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <button onClick={() => setWeek(w => w + 1)} className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50">Next →</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const dateStr = formatDate(date)
          const tasks = byDate(dateStr)
          const isToday = dateStr === '2024-09-17'
          return (
            <div key={i} className={`bg-white border rounded min-h-[200px] ${isToday ? 'border-red-400' : 'border-slate-200'}`}>
              <div className={`px-2 py-2 border-b text-center ${isToday ? 'bg-red-600 border-red-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-white' : 'text-slate-500'}`}>{DAYS[i]}</div>
                <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>{date.getDate()}</div>
              </div>
              <div className="p-1.5 space-y-1">
                {tasks.map(t => (
                  <div key={t.id} className="text-[9px] rounded p-1.5 leading-tight border"
                    style={{ background: t.risk_score >= 70 ? '#FEF2F2' : t.risk_score >= 40 ? '#FFFBEB' : '#F0FDF4', borderColor: t.risk_score >= 70 ? '#fca5a5' : t.risk_score >= 40 ? '#fde68a' : '#bbf7d0' }}>
                    <div className="font-bold text-slate-800">{t.task_id}</div>
                    <div className="text-slate-600 truncate">{t.location}</div>
                    <div className="text-slate-500">{t.department} · {Math.round(t.estimated_duration / 60 * 10) / 10}h</div>
                  </div>
                ))}
                {tasks.length === 0 && <div className="text-[9px] text-slate-300 text-center pt-4">—</div>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded p-4">
        <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">All Scheduled Tasks This Period</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Task ID', 'Date', 'Location', 'Zone', 'Dept', 'Duration', 'Crew', 'Status'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.tasks.filter(t => t.preferred_date >= formatDate(dates[0]) && t.preferred_date <= formatDate(dates[6])).map(t => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-semibold text-slate-800">{t.task_id}</td>
                <td className="px-3 py-2 text-slate-600">{t.preferred_date}</td>
                <td className="px-3 py-2 text-slate-600 max-w-[160px] truncate">{t.location}</td>
                <td className="px-3 py-2 font-semibold text-slate-700">{t.zone}</td>
                <td className="px-3 py-2 text-slate-600">{t.department}</td>
                <td className="px-3 py-2 text-slate-600">{t.estimated_duration} min</td>
                <td className="px-3 py-2 text-slate-600">{t.crew_required}</td>
                <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
