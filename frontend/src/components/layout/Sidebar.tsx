import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, GitCompare, Calendar, AlertTriangle, Database } from 'lucide-react';
import { Calendar, AlertTriangle, ListOrdered, Sliders, Network } from 'lucide-react';

interface SidebarProps {
  conflictCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ conflictCount }) => {
  const navItems = [
    {
      name: 'Overview Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Block Recommendations',
      path: '/recommendations',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40',
    },
    {
      name: 'Before vs After',
      path: '/before-after',
      icon: GitCompare,
      badge: null,
    },
    {
      name: 'Block Plan & Calendar',
      path: '/block-plan',
      icon: Calendar,
      badge: null,
    },
    {
      name: 'Priority Engine',
      path: '/prioritized-tasks',
      icon: ListOrdered,
      badge: null,
    },
    {
      name: 'What-If Simulation',
      path: '/scenarios',
      icon: Sliders,
      badge: null,
    },
    {
      name: 'Network Sync',
      path: '/network',
      icon: Network,
      badge: null,
    },
    {
      name: 'Conflict Alerts',
      path: '/conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? conflictCount : null,
      badgeColor: 'bg-red-600 text-white font-bold',
    },
    {
      name: 'Assets & Defects',
      path: '/assets',
      icon: Database,
      badge: null,
    },
  ];


  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0a192f] text-slate-100 flex flex-col justify-between shrink-0 relative overflow-hidden shadow-2xl">
      {/* Sidebar Train Image Background Layer */}
      <div 
        className="absolute inset-0 bg-[url('/images/railway_sidebar_bg.jpg')] bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none"
        aria-hidden="true"
      />
      {/* Lighter Gradient Overlay so train image shines through clearly */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/70 via-[#071527]/50 to-[#040e1a]/80 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 p-3 space-y-4">
        {/* Department Badge */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
            RAILOPT System Navigation
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold">
            v2.0 DEMO
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 backdrop-blur-xs ${
                    isActive
                      ? 'bg-[#b91c1c] text-white shadow-lg shadow-red-950/60 border border-red-500/30'
                      : 'text-slate-100 bg-[#0a192f]/70 hover:bg-[#0a192f]/90 border border-slate-700/50'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono shadow-xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Human-in-the-Loop Safeguard Notice */}
      <div className="relative z-10 p-3 mt-auto space-y-2">
        <div className="bg-[#0f172a]/95 border border-amber-500/40 rounded-xl p-2.5 shadow-md">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1">
            <span>⚠️ Safety & Approval Protocol</span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium leading-tight mt-1">
            RAILOPT provides AI recommendations. Final approval remains with authorized railway personnel.
          </p>
        </div>

        {/* Lower Sidebar Train Visual & Indian Railways Slogan */}
        <div className="h-24 w-full rounded-xl bg-[url('/images/railway_sidebar_bg.jpg')] bg-cover bg-center border border-slate-700/60 relative overflow-hidden flex flex-col justify-end p-2.5 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/70 to-transparent pointer-events-none" />
          <div className="relative z-10 text-center space-y-0.5">
            <div className="text-[10px] font-black tracking-wider text-white uppercase">
              Safer Tracks • Stronger India
            </div>
            {/* Tricolor Indicator Line */}
            <div className="flex h-1 w-14 mx-auto rounded-full overflow-hidden mt-1">
              <span className="w-1/3 bg-orange-500"></span>
              <span className="w-1/3 bg-white"></span>
              <span className="w-1/3 bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
