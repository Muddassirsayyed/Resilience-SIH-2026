import React from 'react';
import { ShieldAlert, AlertCircle, Train, Wrench, Clock, MapPin, ShieldCheck } from 'lucide-react';
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
  const formatTimeRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const timeStart = s.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const timeEnd = e.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = s.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      return { timeStart, timeEnd, dateStr };
    } catch {
      return { timeStart: startStr, timeEnd: endStr, dateStr: '' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-red-400 mb-1">
            <ShieldAlert className="h-4 w-4 animate-pulse text-red-400" />
            <span>Resilience Module / Operational Risk & Conflict Detection</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Conflict Alerts</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
              {conflicts.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time detection of track maintenance block overlaps with scheduled train passages.
          </p>
        </div>

        {/* Generate Plan Button integration */}
        <GeneratePlanButton onPlanGenerated={onRefresh} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">
          <strong>Error fetching conflicts:</strong> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel-danger p-6 rounded-2xl animate-pulse space-y-3">
              <div className="h-4 bg-red-900/40 rounded w-1/4"></div>
              <div className="h-6 bg-red-900/40 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : conflicts.length === 0 ? (
        /* Zero conflicts state / All Resolved Banner */
        <div className="glass-panel-success p-10 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">All Scheduling Conflicts Resolved!</h3>
            <p className="text-xs text-emerald-300/80 max-w-md mx-auto">
              The AI Plan Generator successfully rescheduled all overlapping maintenance blocks and train passage slots. Zero conflicts detected.
            </p>
          </div>
        </div>
      ) : (
        /* Conflict Alerts List - Clearly highlighted in RED */
        <div className="space-y-5">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Showing <strong className="text-red-400">{conflicts.length}</strong> critical schedule collisions</span>
            <span className="text-[11px] text-red-400/80 font-mono">Highlighting Rule: Severity & Overlap Active</span>
          </div>

          {conflicts.map((item) => {
            const timing = formatTimeRange(item.overlap_start, item.overlap_end);

            return (
              <div
                key={item.id}
                className="glass-panel-danger p-6 rounded-2xl space-y-4 relative overflow-hidden transition hover:border-red-500/60 shadow-lg shadow-red-950/50"
              >
                {/* Red status bar indicator */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500"></div>

                {/* Top Badge header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/40 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-500/20 px-2.5 py-1 rounded-md border border-red-500/40">
                      {item.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30">
                      {item.conflict_type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-mono">Severity:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-red-600 text-white shadow-sm">
                      {item.severity}
                    </span>
                  </div>
                </div>

                {/* Main details: Task vs Train Overlap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-red-900/30 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                      <Wrench className="h-4 w-4 text-cyan-400" />
                      <span>Affected Task:</span>
                    </div>
                    <div className="text-sm font-bold text-white pl-6">
                      {item.task}
                    </div>
                  </div>

                  {/* Train details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-red-900/30 space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                      <Train className="h-4 w-4 text-amber-400" />
                      <span>Conflicting Train:</span>
                    </div>
                    <div className="text-sm font-bold text-white pl-6">
                      {item.train}
                    </div>
                  </div>
                </div>

                {/* Timing & Location Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-red-200 font-mono">
                    <Clock className="h-4 w-4 text-red-400 shrink-0" />
                    <span>
                      <strong>Overlap Timing:</strong> {timing.timeStart} - {timing.timeEnd} ({timing.dateStr})
                    </span>
                  </div>

                  {item.location && (
                    <div className="flex items-center space-x-2 text-slate-300">
                      <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                      <span>
                        <strong>Location:</strong> {item.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Impact assessment */}
                {item.impact && (
                  <div className="flex items-start space-x-2 text-xs text-red-300/90 pt-1">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Impact Assessment:</strong> {item.impact}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
