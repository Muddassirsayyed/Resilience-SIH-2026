import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, AlertTriangle } from 'lucide-react';

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
      name: 'Conflict Alerts',
      path: '/conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? conflictCount : null,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Core Modules
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Shared project footer info */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Resilience System Module</div>
        <div className="text-[11px] text-slate-500">Block Plan + Conflict Visualization</div>
      </div>
    </aside>
  );
};
