import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckSquare, Search, Filter, ShieldCheck, Tag } from 'lucide-react';
import { BlockPlanItem } from '../types';
import { GeneratePlanButton } from '../components/GeneratePlanButton';

interface BlockPlanPageProps {
  plans: BlockPlanItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const BlockPlanPage: React.FC<BlockPlanPageProps> = ({
  plans,
  loading,
  error,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter plans based on search and status
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.assigned_tasks.some((task) =>
        task.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (plan.section_code && plan.section_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || plan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Calendar className="h-4 w-4" />
            <span>Resilience Module / Operational Scheduling</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Block Plan Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage and view active maintenance block plans, track locations, and assigned engineering tasks.
          </p>
        </div>

        {/* Generate Plan Button integration */}
        <GeneratePlanButton onPlanGenerated={onRefresh} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search location or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="OPTIMIZED & RESOLVED">Optimized & Resolved</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_OPTIMIZATION">Pending Optimization</option>
          </select>
        </div>
      </div>

      {/* Error state display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
          <strong>Error loading block plans:</strong> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-5 rounded-xl space-y-3 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-800 rounded w-3/4"></div>
              <div className="h-12 bg-slate-800/60 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-medium text-slate-300">No Block Plans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No block plans match your search filter criteria. Try clearing search filters or click Generate Plan.
          </p>
        </div>
      ) : (
        /* Block Plan List Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlans.map((plan) => {
            const startFormatted = formatDateTime(plan.start_time);
            const endFormatted = formatDateTime(plan.end_time);

            const isOptimized = plan.status.includes('OPTIMIZED');

            return (
              <div
                key={plan.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-200 hover:border-slate-700 flex flex-col justify-between space-y-4 ${
                  isOptimized ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top bar: ID and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                        {plan.id}
                      </span>
                      {plan.section_code && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {plan.section_code}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full font-mono ${
                        isOptimized
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : plan.status === 'CRITICAL' || plan.status === 'PENDING_OPTIMIZATION'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  {/* Location field */}
                  <div>
                    <div className="flex items-start space-x-2 text-slate-200 font-semibold text-sm">
                      <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{plan.location}</span>
                    </div>
                  </div>

                  {/* Timing fields: start_time and end_time */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-0.5">
                        <Clock className="h-3 w-3 text-emerald-400" />
                        <span>Start Time</span>
                      </div>
                      <div className="font-mono text-xs text-white font-medium">
                        {startFormatted.time} <span className="text-[10px] text-slate-400">({startFormatted.date})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-0.5">
                        <Clock className="h-3 w-3 text-red-400" />
                        <span>End Time</span>
                      </div>
                      <div className="font-mono text-xs text-white font-medium">
                        {endFormatted.time} <span className="text-[10px] text-slate-400">({endFormatted.date})</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned tasks array */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                      <CheckSquare className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Assigned Tasks ({plan.assigned_tasks.length}):</span>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {plan.assigned_tasks.map((task, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-slate-500" />
                    <span>Priority: <strong className="text-slate-200">{plan.priority || 'NORMAL'}</strong></span>
                  </div>
                  <span className="font-mono text-slate-500">ISO-8601 Timestamps</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
