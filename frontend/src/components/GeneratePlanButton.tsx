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
    <div className="flex flex-col items-end space-y-1">
      <div className="flex items-center space-x-3">
        {lastResult && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition disabled:opacity-50"
            title="Reset to initial conflict state"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-sm shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Generate Plan</span>
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 font-medium">
        Run AI optimization to resolve conflicts
      </p>

      {/* Error alert state */}
      {error && (
        <div className="w-full max-w-md p-3 rounded bg-red-50 border border-red-300 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Before vs After Conflict Count Summary Banner / Modal */}
      {showSummaryModal && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 shadow-2xl space-y-5 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#002447] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-wide">Plan Generation Complete</h3>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-300 hover:text-white text-base font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lastResult.message}
              </p>

              {/* Before vs After Conflict Count Metric */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Conflict Resolution Metric (Before vs After)
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Before Optimization</div>
                    <div className="text-xl font-bold font-mono text-red-700 bg-red-50 py-1.5 rounded border border-red-200">
                      {lastResult.before_conflict_count} Conflicts
                    </div>
                  </div>

                  <div className="px-3 flex items-center justify-center text-slate-400">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">After Optimization</div>
                    <div className="text-xl font-bold font-mono text-emerald-700 bg-emerald-50 py-1.5 rounded border border-emerald-200">
                      {lastResult.after_conflict_count} Conflicts
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-600 font-mono">
                  <span>Resolved: <strong className="text-emerald-700">{lastResult.conflicts_resolved}</strong></span>
                  <span>AI Efficiency: <strong className="text-blue-700">{lastResult.optimization_score}</strong></span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 rounded bg-[#002447] hover:bg-[#073666] text-white font-semibold text-xs shadow-sm transition"
                >
                  View Updated Schedules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
