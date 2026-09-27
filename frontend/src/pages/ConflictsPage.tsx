import React, { useState } from 'react';
import { AlertTriangle, Clock, Train, Wrench, Search, MapPin, Eye, MoreVertical, RefreshCw, Info } from 'lucide-react';
import { ConflictAlertItem } from '../types';
import { GeneratePlanButton } from '../components/GeneratePlanButton';

interface ConflictsPageProps {
  conflicts: ConflictAlertItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const ConflictsPage: React.FC<ConflictsPageProps> = ({
  conflicts,
  loading,
  error,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredConflicts = conflicts.filter((c) => {
    const matchesSearch =
      (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.task || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.train || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'ALL' || (c.severity || '').toUpperCase() === severityFilter.toUpperCase();
    return matchesSearch && matchesSeverity;
  });

  const formatTimeRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const timeStart = s.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const timeEnd = e.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = s.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return { timeStart, timeEnd, dateStr };
    } catch {
      return { timeStart: startStr, timeEnd: endStr, dateStr: '' };
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb line */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span className="hover:text-slate-800 cursor-pointer">Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">Conflict Alerts</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="h-6 w-6 text-[#dc2626]" />
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Conflict Alerts</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#dc2626] text-white shadow-xs">
              {conflicts.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Real-time detection of track maintenance block overlaps with scheduled train passages.
          </p>
        </div>

        {/* Generate Plan Button */}
        <GeneratePlanButton onPlanGenerated={onRefresh} />
      </div>

      {/* 4 KPI Summary Cards Grid (Exact matching reference screenshot styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Conflicts */}
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#dc2626]">{conflicts.length}</div>
            <div className="text-xs font-black text-[#991b1b]">Active Conflicts</div>
            <div className="text-[10px] font-semibold text-[#b91c1c]/80">Require immediate attention</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-100/80 text-[#dc2626] flex items-center justify-center font-bold text-lg border border-red-200">
            !
          </div>
        </div>

        {/* Card 2: High Priority */}
        <div className="bg-[#fffbe6] border border-[#ffe58f] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#d97706]">2</div>
            <div className="text-xs font-black text-[#92400e]">High Priority</div>
            <div className="text-[10px] font-semibold text-[#b45309]/80">May cause train delays</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100/80 text-[#d97706] flex items-center justify-center border border-amber-200">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Affected Trains */}
        <div className="bg-[#e6f7ff] border border-[#91caff] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#0284c7]">5</div>
            <div className="text-xs font-black text-[#075985]">Affected Trains</div>
            <div className="text-[10px] font-semibold text-[#0369a1]/80">Scheduled services impacted</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-100/80 text-[#0284c7] flex items-center justify-center border border-sky-200">
            <Train className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Maintenance Tasks */}
        <div className="bg-[#f9f0ff] border border-[#d3ade6] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#9333ea]">3</div>
            <div className="text-xs font-black text-[#6b21a8]">Maintenance Tasks</div>
            <div className="text-[10px] font-semibold text-[#7e22ce]/80">In conflict with train schedule</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-100/80 text-[#9333ea] flex items-center justify-center border border-purple-200">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by train number, task, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs transition font-medium"
          />
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="ALL">All Conflict Types</option>
          </select>

          <select
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
          >
            <option value="ALL">All Locations</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSeverityFilter('ALL');
            }}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold">
          <strong>Error fetching conflicts:</strong> {error}
        </div>
      )}

      {/* Conflicts Operational Table Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626] animate-pulse"></span>
            <h3 className="text-sm font-extrabold text-slate-900">Active Conflicts ({conflicts.length})</h3>
          </div>

          <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#fef2f2] text-[#dc2626] border border-red-200">
            Showing {filteredConflicts.length} critical schedule collisions
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-semibold text-xs space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p>Loading operational conflicts...</p>
          </div>
        ) : filteredConflicts.length === 0 ? (
          /* All Resolved State Banner */
          <div className="p-10 text-center space-y-3 bg-emerald-50/50">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300 font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-slate-900">All Scheduling Conflicts Resolved!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              The AI Plan Generator successfully rescheduled all overlapping maintenance blocks and train passage slots. Zero conflicts detected.
            </p>
          </div>
        ) : (
          /* Dense Operational Conflicts Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-10">#</th>
                  <th className="py-3 px-4">Conflict ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Affected Task</th>
                  <th className="py-3 px-4">Conflicting Train</th>
                  <th className="py-3 px-4">Overlap Timing</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredConflicts.map((item, idx) => {
                  const timing = formatTimeRange(item.overlap_start, item.overlap_end);
                  const severityUpper = (item.severity || 'HIGH').toUpperCase();

                  let severityBadgeClass = 'bg-[#ff4d4f] text-white';
                  let typeBadgeClass = 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]';
                  let rowBgClass = 'hover:bg-red-50/30';

                  if (severityUpper === 'HIGH') {
                    severityBadgeClass = 'bg-[#faad14] text-white';
                    typeBadgeClass = 'bg-[#fffbe6] text-[#d48806] border border-[#ffe58f]';
                    rowBgClass = 'hover:bg-amber-50/30';
                  } else if (severityUpper === 'MEDIUM') {
                    severityBadgeClass = 'bg-[#1677ff] text-white';
                    typeBadgeClass = 'bg-[#e6f4ff] text-[#0958d9] border border-[#91caff]';
                    rowBgClass = 'hover:bg-sky-50/30';
                  }

                  return (
                    <tr key={item.id} className={`transition ${rowBgClass}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-500">{idx + 1}</td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${typeBadgeClass}`}>
                          {item.conflict_type || 'Block vs Train'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-extrabold text-slate-900 leading-snug">{item.task}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap max-w-xs">
                        <div className="font-extrabold text-slate-900">{item.train}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-bold font-mono text-[#dc2626]">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{timing.timeStart} – {timing.timeEnd}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold pl-5">{timing.dateStr}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start space-x-1 text-slate-800 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{item.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold font-mono shadow-2xs ${severityBadgeClass}`}>
                          {item.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate-700 font-semibold leading-snug">
                        {item.impact}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => alert(`Conflict Details:\n\nID: ${item.id}\nTask: ${item.task}\nTrain: ${item.train}\nLocation: ${item.location}\nSeverity: ${item.severity}\nImpact: ${item.impact}`)}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-blue-600 font-bold text-xs hover:bg-blue-50 transition shadow-2xs flex items-center space-x-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                          <button className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Bar */}
        <div className="bg-[#f8fafc] px-5 py-3 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500 font-semibold">
          <span>Showing 1 to {filteredConflicts.length} of {conflicts.length} conflicts</span>

          <div className="flex items-center space-x-1">
            <button className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-400 cursor-not-allowed">
              ‹
            </button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-400 cursor-not-allowed">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Operational Info Note Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2.5 font-medium">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> These conflicts are detected based on current maintenance block plans and scheduled train timings. Use the AI optimization engine to generate an updated plan with minimal conflicts.
        </span>
      </div>
    </div>
  );
};
