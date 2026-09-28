import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckSquare, Search, Filter, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { BlockPlanItem } from '../types';
import { GeneratePlanButton } from '../components/GeneratePlanButton';


interface BlockPlanPageProps {
  plans: BlockPlanItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const BlockPlanPage: React.FC<BlockPlanPageProps> = ({
  plans = [],
  loading,
  error,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter plans safely based on search and status
  const filteredPlans = (plans || []).filter((plan) => {
    const locationStr = plan.location || '';
    const tasksArr = plan.assigned_tasks || [];
    const sectionCodeStr = plan.section_code || '';
    const statusStr = plan.status || '';

    const matchesSearch =
      locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tasksArr.some((task) =>
        (task || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      sectionCodeStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || statusStr === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
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
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb line */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span className="hover:text-slate-800 cursor-pointer">Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">Block Plan</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <Calendar className="h-6 w-6 text-blue-800" />
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Track Maintenance Block Plans</h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Manage and view active maintenance block plans, track section codes, and assigned engineering tasks.
          </p>
        </div>

        {/* Actions: AI Priority Queue & Generate Plan Button */}
        <div className="flex items-center space-x-2.5">
          <Link
            to="/prioritized-tasks"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs shadow-xs transition"
            title="Inspect AI Prioritization Engine ranked tasks"
          >
            <Sparkles className="h-4 w-4 text-blue-700" />
            <span>AI Priority Queue</span>
          </Link>
          <GeneratePlanButton onPlanGenerated={onRefresh} />
        </div>
      </div>


      {/* Summary KPI Cards Row (Exact matching reference screenshot styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Total Block Plans */}
        <div className="bg-[#e6f7ff] border border-[#91caff] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#0284c7]">{plans.length}</div>
            <div className="text-xs font-black text-[#075985]">Total Block Plans</div>
            <div className="text-[10px] font-semibold text-[#0369a1]/80">Active maintenance schedules</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-100/80 text-[#0284c7] flex items-center justify-center border border-sky-200">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Filtered View */}
        <div className="bg-[#f8fafc] border border-slate-300 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-slate-800">{filteredPlans.length}</div>
            <div className="text-xs font-black text-slate-700">Filtered View</div>
            <div className="text-[10px] font-semibold text-slate-500">Matching current filter criteria</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center border border-slate-300">
            <Filter className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Optimization Status */}
        {(() => {
          const isOptimizedState = plans.some(p => (p.status || '').includes('OPTIMIZED'));
          return (
            <div className={`rounded-xl p-4 flex items-center justify-between shadow-xs border ${isOptimizedState ? 'bg-[#f6ffed] border-[#b7eb8f]' : 'bg-[#fffbe6] border-[#ffe58f]'}`}>
              <div className="space-y-0.5">
                <div className={`text-sm font-black font-mono ${isOptimizedState ? 'text-[#389e0d]' : 'text-[#d97706]'}`}>
                  {isOptimizedState ? 'OPTIMIZED' : 'INITIAL SCHEDULE'}
                </div>
                <div className={`text-xs font-black ${isOptimizedState ? 'text-[#135200]' : 'text-[#92400e]'}`}>Optimization Status</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {isOptimizedState ? 'All schedule conflicts resolved' : 'Conflicts pending resolution'}
                </div>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isOptimizedState ? 'bg-emerald-100/80 text-[#389e0d] border-emerald-200' : 'bg-amber-100/80 text-[#d97706] border-amber-200'}`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search location, task, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold">
          <strong>Error loading block plans:</strong> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 animate-pulse shadow-xs">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <ShieldCheck className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Block Plans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No block plans match your search filter criteria. Try clearing search filters or click Generate Plan.
          </p>
        </div>
      ) : (
        /* Block Plan Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => {
            const startFormatted = formatDateTime(plan.start_time);
            const endFormatted = formatDateTime(plan.end_time);
            const statusStr = plan.status || 'SCHEDULED';
            const isOptimized = statusStr.includes('OPTIMIZED');
            const tasksList = plan.assigned_tasks || [];

            // Semantic style mapping
            let cardBorder = 'border-l-4 border-l-blue-600 border-slate-200';
            let timingBoxClass = 'bg-sky-50/70 border border-sky-200';
            let badgeClass = 'bg-blue-100 text-blue-900 border border-blue-300';

            if (isOptimized) {
              cardBorder = 'border-l-4 border-l-emerald-600 border-slate-200';
              timingBoxClass = 'bg-emerald-50/70 border border-emerald-200';
              badgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
            } else if (statusStr === 'PENDING_OPTIMIZATION' || statusStr === 'CRITICAL') {
              cardBorder = 'border-l-4 border-l-amber-500 border-slate-200';
              timingBoxClass = 'bg-amber-50/70 border border-amber-200';
              badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300';
            } else if (statusStr === 'APPROVED') {
              cardBorder = 'border-l-4 border-l-indigo-600 border-slate-200';
              timingBoxClass = 'bg-indigo-50/70 border border-indigo-200';
              badgeClass = 'bg-indigo-100 text-indigo-900 border border-indigo-300';
            }

            return (
              <div
                key={plan.id}
                className={`bg-white p-4.5 rounded-xl border shadow-xs transition flex flex-col justify-between space-y-3.5 hover:shadow-md hover:border-slate-300 ${cardBorder}`}
              >
                <div className="space-y-3">
                  {/* Top bar: ID and Status */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white bg-[#0a192f] px-2.5 py-1 rounded-md shadow-2xs">
                        {plan.id}
                      </span>
                      {plan.section_code && (
                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {plan.section_code}
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono ${badgeClass}`}>
                      {statusStr}
                    </span>
                  </div>

                  {/* Location field */}
                  <div>
                    <div className="flex items-start space-x-2 text-slate-900 font-extrabold text-sm">
                      <MapPin className="h-4 w-4 text-blue-800 shrink-0 mt-0.5" />
                      <span>{plan.location || 'Location Not Specified'}</span>
                    </div>
                  </div>

                  {/* Timing fields: start_time and end_time */}
                  <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg ${timingBoxClass}`}>
                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 mb-0.5">
                        <Clock className="h-3 w-3 text-emerald-700" />
                        <span>Start Time</span>
                      </div>
                      <div className="font-mono text-xs text-slate-900 font-bold">
                        {startFormatted.time} <span className="text-[10px] text-slate-500 font-normal">({startFormatted.date})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 mb-0.5">
                        <Clock className="h-3 w-3 text-red-700" />
                        <span>End Time</span>
                      </div>
                      <div className="font-mono text-xs text-slate-900 font-bold">
                        {endFormatted.time} <span className="text-[10px] text-slate-500 font-normal">({endFormatted.date})</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned tasks array */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-800">
                      <CheckSquare className="h-3.5 w-3.5 text-blue-700" />
                      <span>Assigned Maintenance Tasks ({tasksList.length}):</span>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {tasksList.map((task, idx) => (
                        <li key={idx} className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-700 shrink-0"></span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card footer */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>Priority Level: <strong className="text-slate-900 font-bold">{plan.priority || 'NORMAL'}</strong></span>
                  </div>
                  <span className="font-mono text-slate-400">IR Track Registry</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
