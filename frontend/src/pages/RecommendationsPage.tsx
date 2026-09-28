import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  Check,
  Zap,
  XCircle,
} from 'lucide-react';
import {
  fetchRecommendations,
  runOptimization,
  approveRecommendation,
  rejectRecommendation,
} from '../services/api';
import { BlockRecommendation, OptimizationResult } from '../types';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<BlockRecommendation[]>([]);
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadRecs = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, []);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setActionMessage(null);
    try {
      const res = await runOptimization();
      setOptResult(res);
      await loadRecs();
      setActionMessage('OR-Tools CP-SAT Optimization Solver executed successfully!');
    } catch (err: any) {
      setActionMessage(`Optimization failed: ${err?.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await approveRecommendation(id);
      setActionMessage(res.message);
      await loadRecs();
    } catch (err: any) {
      setActionMessage(`Approval failed: ${err?.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await rejectRecommendation(id);
      setActionMessage(res.message);
      await loadRecs();
    } catch (err: any) {
      setActionMessage(`Rejection failed: ${err?.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-8">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span>Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">AI Block Recommendations</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
              AI Coordinated Block Recommendations
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            RAILOPT bundles compatible multi-department maintenance tasks into single corridor possessions to minimize disruption.
          </p>
        </div>

        {/* Action Button: Execute OR-Tools Solver */}
        <button
          onClick={handleRunOptimization}
          disabled={optimizing}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md transition cursor-pointer disabled:opacity-50"
        >
          {optimizing ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-white" />
          )}
          <span>{optimizing ? 'Solving CP-SAT Constraints...' : 'Run OR-Tools Optimization Engine'}</span>
        </button>
      </div>

      {/* Prominent Human-in-the-Loop Protocol Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start space-x-3 shadow-xs">
        <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-black text-amber-900 uppercase tracking-wide">
            HUMAN-IN-THE-LOOP APPROVAL PROTOCOL
          </div>
          <p className="text-xs text-amber-800 font-semibold">
            "RAILOPT provides optimization recommendations. Final approval remains with authorized railway personnel."
          </p>
          <p className="text-[11px] text-amber-700">
            The system does NOT automatically approve blocks. Approved recommendations are submitted directly to the Disconnection Management System (BDMS).
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* OR-Tools Execution Output Card */}
      {optResult && (
        <div className="bg-gradient-to-r from-[#0a192f] to-[#1e293b] text-white rounded-xl p-4 border border-slate-700 space-y-3 shadow-lg font-mono">
          <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Zap className="h-4 w-4" />
              <span>{optResult.algorithm} Engine Output</span>
            </div>
            <span className="text-slate-400">Score: {optResult.optimization_score}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-400 text-[10px]">Tasks Processed</div>
              <div className="text-lg font-bold">{optResult.total_tasks_processed}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Blocks Avoided</div>
              <div className="text-lg font-bold text-amber-300">{optResult.blocks_avoided} separate blocks</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Unbundled Hours</div>
              <div className="text-lg font-bold text-red-300">{optResult.original_total_hours} hrs</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Hours Saved</div>
              <div className="text-lg font-bold text-emerald-400">+{optResult.estimated_hours_saved} hrs</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-bold">
            Loading AI Block Recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-bold">
            No recommendations available. Click "Run OR-Tools Optimization Engine".
          </div>
        ) : (
          recommendations.map((rec) => {
            const isApproved = rec.status === 'APPROVED';
            const isRejected = rec.status === 'REJECTED';

            return (
              <div
                key={rec.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition ${
                  isApproved
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isRejected
                    ? 'border-slate-300 bg-slate-50/40 opacity-75'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                        Block ID: {rec.block_code}
                      </span>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Section: {rec.section_code}
                      </span>
                      {isApproved && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>APPROVED BY RAILWAY OFFICIAL</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                          REJECTED
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-black text-slate-900 mt-1">{rec.corridor}</h2>
                  </div>

                  {/* Operational Impact Badge */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400">Operational Impact</div>
                      <div className="text-xs font-black text-emerald-600">{rec.operational_impact}</div>
                    </div>
                  </div>
                </div>

                {/* Key Block Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold">Date & Time:</span>
                    <div className="font-bold text-slate-900">{rec.date} | {rec.time_window}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold">Coordinated Duration:</span>
                    <div className="font-bold text-slate-900 flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>{rec.duration_hours} Hours</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold">Departments Bundled:</span>
                    <div className="font-bold text-indigo-700">{rec.departments.join(' + ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold">Estimated Block-Hours Saved:</span>
                    <div className="font-black text-emerald-600">+{rec.estimated_savings_hours} Hours</div>
                  </div>
                </div>

                {/* Bundled Tasks Breakdown Table */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-700 flex items-center space-x-1.5 uppercase tracking-wide">
                    <Layers className="h-4 w-4 text-blue-700" />
                    <span>Bundled Maintenance Tasks ({rec.bundled_tasks.length} Departmental Tasks Combined)</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Task ID</th>
                          <th className="py-2 px-3">Department</th>
                          <th className="py-2 px-3">Maintenance Description</th>
                          <th className="py-2 px-3 text-right">Task Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {rec.bundled_tasks.map((task) => (
                          <tr key={task.task_id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{task.task_id}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                {task.department}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">{task.description}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{task.duration_hrs} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Safety Validation Message */}
                <div className="text-[11px] bg-sky-50 border border-sky-200 text-sky-900 rounded-lg p-2.5 font-medium flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
                  <span>{rec.safety_validation}</span>
                </div>

                {/* Human Approval Action Buttons */}
                {!isApproved && !isRejected && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 italic">
                      Action required by Senior Divisional Operations Manager
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(rec.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 text-slate-500" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(rec.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept Recommendation (Approve Block)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
