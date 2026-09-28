import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, AlertTriangle, ListOrdered, Sliders, Network } from 'lucide-react';

interface SidebarProps {
  conflictCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ conflictCount }) => {
  const navItems = [
    {
      name: 'Block Plan',
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
      badgeColor: 'bg-white/20 text-white font-bold',
    },
  ];


  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0a192f] text-slate-100 flex flex-col justify-between shrink-0 relative overflow-hidden shadow-2xl">
      {/* User-provided Sidebar Train Image Background Layer */}
      <div 
        className="absolute inset-0 bg-[url('/images/railway_sidebar_bg.jpg')] bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none"
        aria-hidden="true"
      />
      {/* Lighter Gradient Overlay so train image shines through clearly */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/60 via-[#071527]/40 to-[#040e1a]/70 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 p-4 space-y-6">
        <nav className="space-y-2 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-150 backdrop-blur-xs ${
                    isActive
                      ? 'bg-[#dc2626] text-white shadow-lg shadow-red-900/50'
                      : 'text-slate-100 bg-[#0a192f]/70 hover:bg-[#0a192f]/90 border border-slate-700/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono shadow-xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Lower Sidebar Train Visual & Indian Railways Slogan */}
      <div className="relative z-10 p-4 mt-auto">
        {/* Train Background Graphic Overlay */}
        <div className="h-28 w-full rounded-xl bg-[url('/images/railway_sidebar_bg.jpg')] bg-cover bg-center border border-slate-700/60 relative overflow-hidden flex flex-col justify-end p-3 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/70 to-transparent pointer-events-none" />
          <div className="relative z-10 text-center space-y-1">
            <div className="text-xs font-black tracking-wider text-white uppercase">
              Safer Tracks
            </div>
            <div className="text-xs font-black tracking-wider text-amber-300 uppercase">
              Stronger India
            </div>
            {/* Tricolor Indicator Line */}
            <div className="flex h-1 w-16 mx-auto rounded-full overflow-hidden mt-1">
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
