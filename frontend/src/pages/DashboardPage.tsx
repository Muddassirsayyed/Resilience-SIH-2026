import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingDown,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-8">
      {/* Top Banner with RAILOPT Branding & Human-in-the-Loop Safeguard */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#1e293b] to-[#0f172a] text-white p-6 rounded-2xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('/images/railway_header_bg.png')] bg-cover bg-right opacity-20 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold tracking-wide">
              DEMO MODE • SIMULATED DATA
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
              OR-Tools CP-SAT Active
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white">
              RAILOPT Operations Control Dashboard
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-3xl">
              AI-assisted Automatic Block Planning and Optimization Layer integrating Track Management (TMS), Signal Maintenance (SMMS), Traction Distribution (TDMS), and Disconnection Management (BDMS).
            </p>
          </div>

          {/* Human in the loop banner */}
          <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 flex items-start space-x-3 text-xs text-amber-200">
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Human-in-the-Loop Protocol: </span>
              RAILOPT provides intelligent optimization recommendations. Final block authorization remains strictly with authorized Senior Divisional Operations Managers (Sr. DOM).
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Maintenance Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Maintenance Tasks</span>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats?.total_maintenance_tasks || 9}</span>
            <span className="text-xs text-slate-500 font-bold">across 3 depts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Engg, S&T, Traction Distribution</p>
        </div>

        {/* Card 2: Pending Defects & High Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Pending Defects</span>
            <div className="h-9 w-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-red-600">{stats?.pending_defects || 6}</span>
            <span className="text-xs text-red-700 font-bold">({stats?.high_risk_assets || 4} Critical)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Requiring block slot assignment</p>
        </div>

        {/* Card 3: Estimated Hours Saved */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Block-Hours Saved</span>
            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-700">{stats?.estimated_block_hours_saved || 14.5} hrs</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">Simulated prototype calculation</p>
        </div>

        {/* Card 4: Asset Downtime Reduction */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider">Downtime Reduction</span>
            <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-sky-700">{stats?.asset_downtime_reduction_percent || 38.4}%</span>
          </div>
          <p className="text-[11px] text-sky-800 font-semibold mt-1">Single corridor possession</p>
        </div>
      </div>

      {/* Block Statuses & Operational Impact Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block Status Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Calendar className="h-5 w-5 text-blue-700" />
            <h2 className="text-sm font-black text-slate-900 uppercase">Block Status Distribution</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <div className="text-xl font-black text-blue-700">{stats?.planned_blocks || 4}</div>
              <div className="text-[10px] font-bold text-blue-900">Planned</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <div className="text-xl font-black text-amber-700">{stats?.active_blocks || 1}</div>
              <div className="text-[10px] font-bold text-amber-900">Active</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <div className="text-xl font-black text-emerald-700">{stats?.completed_blocks || 2}</div>
              <div className="text-[10px] font-bold text-emerald-900">Completed</div>
            </div>
          </div>
        </div>

        {/* Train Operation Impact Indicator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase">Train Impact Indicator</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-900">Operation Disruption</div>
              <div className="text-lg font-black text-indigo-700">{stats?.train_operation_impact || 'LOW (Optimized)'}</div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
              MINIMIZED
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Coordinated multi-department blocks reduce repeated express train slowdowns.</p>
        </div>

        {/* Quick Action Navigation */}
        <div className="bg-gradient-to-br from-[#0a192f] to-[#1e293b] text-white border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>AI RECOMMENDATION ENGINE</span>
            </div>
            <h2 className="text-base font-black">Run Block Bundling Optimization</h2>
            <p className="text-xs text-slate-300">
              Generate optimal bundled maintenance blocks across Engg, S&T, and TRD.
            </p>
          </div>
          <button
            onClick={() => navigate('/recommendations')}
            className="mt-4 w-full bg-[#b91c1c] hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
          >
            <span>View Block Recommendations</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Department-Wise Workload Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-black text-slate-900">Department-Wise Workload Distribution</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">3 Departments Integrated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Engineering */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">1. Engineering (TMS)</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                {stats?.department_workload['Engineering'] || 4} Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Track ballast tamping, rail flaw detection (USFD), turnout crossing renewals, bridge inspection.</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-4/12" />
            </div>
          </div>

          {/* Traction Distribution */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">2. Traction Distribution (TDMS)</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-xs font-bold">
                {stats?.department_workload['Traction Distribution'] || 2} Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Overhead Catenary Line wire replacement, isolator switch repair, power block de-energization.</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-3/12" />
            </div>
          </div>

          {/* Signal & Telecommunication */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">3. Signal & Telecom (SMMS)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                {stats?.department_workload['Signal & Telecommunication'] || 3} Tasks
              </span>
            </div>
            <p className="text-[11px] text-slate-600">Relay box testing, point machine motor calibration, automatic signaling cable trenching.</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-3/12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
