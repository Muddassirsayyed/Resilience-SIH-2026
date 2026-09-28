import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Radio, Wrench, CalendarRange, Brain,
  Zap, FlaskConical, CalendarDays, Map, BarChart3,
  CheckSquare, FileText, ClipboardList, Settings, Train,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/live-operations', icon: Radio, label: 'Live Operations' },
  { to: '/maintenance-tasks', icon: Wrench, label: 'Maintenance Tasks' },
  { to: '/block-planner', icon: CalendarRange, label: 'Block Planner' },
  { to: '/ai-recommendations', icon: Brain, label: 'AI Recommendations' },
  { to: '/events', icon: Zap, label: 'Real-Time Events' },
  { to: '/simulation', icon: FlaskConical, label: 'What-If Simulation' },
  { to: '/weekly-planning', icon: CalendarDays, label: 'Weekly Planning' },
  { to: '/gis-map', icon: Map, label: 'GIS Map' },
  { to: '/reports', icon: BarChart3, label: 'Analytics & Reports' },
  { to: '/approvals', icon: CheckSquare, label: 'Approvals' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/administration', icon: Settings, label: 'Administration' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-200 z-40 relative"
      style={{ width: collapsed ? 56 : 220, background: '#1A2332', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b" style={{ borderColor: '#243044' }}>
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#C0392B' }}>
          <Train size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-none tracking-tight">RAILOPT</div>
            <div className="text-[9px] mt-0.5" style={{ color: '#64748B' }}>Indian Railways</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAV_ITEMS.map(item => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-2.5 mx-1.5 my-0.5 px-2.5 py-2 rounded text-xs font-medium transition-colors group relative"
              style={{
                color: isActive ? '#fff' : '#94A3B8',
                background: isActive ? '#C0392B' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#243044' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-slate-800 text-white text-xs rounded px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-lg transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Demo mode + collapse */}
      <div className="shrink-0 border-t py-2 px-2" style={{ borderColor: '#243044' }}>
        {!collapsed && (
          <div className="flex items-center justify-center mb-2">
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded" style={{ background: '#D97706', color: '#fff' }}>
              ⬤ DEMO MODE
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center py-1.5 rounded text-xs transition-colors"
          style={{ color: '#64748B' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="ml-1">Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
