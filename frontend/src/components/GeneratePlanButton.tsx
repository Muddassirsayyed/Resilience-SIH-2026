import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { generatePlan, resetPlan } from '../services/api';
import { PlanGenerateResponse } from '../types';

interface GeneratePlanButtonProps {
  onPlanGenerated: () => void;
}

export const GeneratePlanButton: React.FC<GeneratePlanButtonProps> = ({ onPlanGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PlanGenerateResponse | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call actual backend endpoint POST /api/plan/generate-plan
      const response = await generatePlan();
      setLastResult(response);
      setShowSummaryModal(true);
      // Trigger parent callback to refresh both Block Plan and Conflicts
      onPlanGenerated();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while generating the plan');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      await resetPlan();
      setLastResult(null);
      onPlanGenerated();
    } catch (err: any) {
      setError(err?.message || 'Failed to reset plan state');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-3">
        {lastResult && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition disabled:opacity-50"
            title="Reset to initial conflict state"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Demo State</span>
          </button>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Optimizing & Generating Plan...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Generate Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Error alert state */}
      {error && (
        <div className="w-full max-w-md p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Before vs After Conflict Count Summary Banner / Modal */}
      {showSummaryModal && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Plan Generation Complete</h3>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lastResult.message}
            </p>

            {/* Before vs After Conflict Count Metric */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Conflict Count (Before vs After)
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-500 mb-1">Before</div>
                  <div className="text-2xl font-bold font-mono text-red-400 bg-red-500/10 py-1.5 rounded-lg border border-red-500/20">
                    {lastResult.before_conflict_count} Conflicts
                  </div>
                </div>

                <div className="px-3 flex items-center justify-center text-slate-500">
                  <ArrowRight className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="text-center flex-1">
                  <div className="text-xs text-slate-500 mb-1">After</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                    {lastResult.after_conflict_count} Conflicts
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                <span>Conflicts Resolved: <strong className="text-emerald-400">{lastResult.conflicts_resolved}</strong></span>
                <span>AI Efficiency: <strong className="text-cyan-400">{lastResult.optimization_score}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition"
              >
                View Updated Schedules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
