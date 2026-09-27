import React from 'react';
import { ShieldAlert, Bell, Layers } from 'lucide-react';

interface NavbarProps {
  conflictCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ conflictCount }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-wide">RESILIENCE SIH-2026</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">v1.0-SIH</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">AI Scheduling Engine: <strong className="text-emerald-400">ONLINE</strong></span>
        </div>

        {/* Conflict alert indicator badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <ShieldAlert className={`h-4 w-4 ${conflictCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-300">Active Conflicts:</span>
          <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${conflictCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {conflictCount}
          </span>
        </div>

        <button className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
