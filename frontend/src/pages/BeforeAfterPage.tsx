import React from 'react';
import { GitCompare, Layers } from 'lucide-react';

export const BeforeAfterPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-8">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span>Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">Before vs After RAILOPT</span>
      </div>

      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <GitCompare className="h-6 w-6 text-indigo-700" />
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Before vs After RAILOPT Optimization
          </h1>
        </div>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Visual comparative analysis illustrating the operational efficiency of bundling departmental maintenance tasks into single corridor block possessions.
        </p>
      </div>

      {/* Impact Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-black text-red-800 uppercase">Blocks Avoided</div>
          <div className="text-3xl font-black text-red-700 mt-1">3 Blocks → 1 Block</div>
          <p className="text-[11px] text-red-800 font-medium mt-1">66% reduction in corridor occupations</p>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-black text-emerald-800 uppercase">Block-Hours Saved</div>
          <div className="text-3xl font-black text-emerald-700 mt-1">+9.5 Hours</div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">Simulated prototype calculation</p>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-black text-blue-800 uppercase">Tasks Coordinated</div>
          <div className="text-3xl font-black text-blue-700 mt-1">6 Tasks</div>
          <p className="text-[11px] text-blue-800 font-medium mt-1">Engg + TRD + S&T combined</p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-black text-amber-800 uppercase">Express Train Delay</div>
          <div className="text-3xl font-black text-amber-700 mt-1">-42 Minutes</div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">Reduced passage slowdowns</p>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEFORE RAILOPT COLUMN */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
                ❌
              </div>
              <h2 className="text-base font-black text-red-950">BEFORE RAILOPT (Uncoordinated)</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-mono text-xs font-bold">
              3 Separate Corridor Blocks
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Each department requests separate corridor block possessions on the same section. Line is shut down repeatedly, causing massive downtime and express train delays.
          </p>

          {/* Unbundled Timeline Diagram */}
          <div className="space-y-3 font-mono text-xs">
            {/* Block 1 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              <div className="flex justify-between font-bold text-red-900">
                <span>Block 1 (Engineering): Track Inspection</span>
                <span>3.0 Hours</span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">01:30 - 04:30 | Track Line 3 closed for ballast tamping</p>
            </div>

            {/* Gap / Disruption */}
            <div className="text-center text-[11px] text-red-700 font-bold font-sans">
              ⬇ Line reopened, then closed AGAIN 2 hours later ⬇
            </div>

            {/* Block 2 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              <div className="flex justify-between font-bold text-red-900">
                <span>Block 2 (Traction): OHE Wire Replacement</span>
                <span>3.5 Hours</span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">06:00 - 09:30 | Power isolation on same section</p>
            </div>

            {/* Gap / Disruption */}
            <div className="text-center text-[11px] text-red-700 font-bold font-sans">
              ⬇ Line reopened, then closed a 3rd time ⬇
            </div>

            {/* Block 3 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              <div className="flex justify-between font-bold text-red-900">
                <span>Block 3 (S&T): Relay Box Testing</span>
                <span>2.0 Hours</span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">11:00 - 13:00 | Signal disconnection on same section</p>
            </div>
          </div>

          <div className="bg-red-100/60 border border-red-200 rounded-xl p-3 text-xs text-red-900 font-bold space-y-1">
            <div>Total Corridor Block Hours: 8.5 Hours</div>
            <div>Corridor Occupations: 3 Times Daily</div>
            <div className="text-red-700 font-semibold text-[11px]">Result: Inefficient block utilization & repeated operational disruption.</div>
          </div>
        </div>

        {/* AFTER RAILOPT COLUMN */}
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                ✅
              </div>
              <h2 className="text-base font-black text-emerald-950">AFTER RAILOPT (Coordinated)</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              1 Coordinated Bundled Block
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            RAILOPT bundles compatible tasks across Engineering, S&T, and Traction into ONE synchronized window, maximizing productivity while keeping safety highest.
          </p>

          {/* Bundled Coordinated Timeline Diagram */}
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex justify-between font-bold text-emerald-950 text-sm border-b border-emerald-200 pb-2">
                <span className="flex items-center space-x-1.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>SINGLE BUNDLED BLOCK (BLK-NDLS-001)</span>
                </span>
                <span className="text-emerald-700">3.5 Hours Total</span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="flex items-start space-x-2 bg-white p-2 rounded border border-emerald-200">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-[10px] rounded">ENGG</span>
                  <div>
                    <div className="font-bold text-slate-900">Track Ballast Tamping (3.0 hrs)</div>
                    <div className="text-[11px] text-slate-500">Track Line 3 possession</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 bg-white p-2 rounded border border-emerald-200">
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-mono font-bold text-[10px] rounded">TRD</span>
                  <div>
                    <div className="font-bold text-slate-900">OHE Catenary Wire Replacement (3.5 hrs)</div>
                    <div className="text-[11px] text-slate-500">Power isolation aligned during track window</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 bg-white p-2 rounded border border-emerald-200">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded">S&T</span>
                  <div>
                    <div className="font-bold text-slate-900">Relay Box & Track Circuit Test (2.0 hrs)</div>
                    <div className="text-[11px] text-slate-500">Completed simultaneously in parallel</div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 p-2 rounded font-bold text-center">
                Time Window: 01:30 - 05:00 UTC (3.5 Hours Single Shutdown)
              </div>
            </div>
          </div>

          <div className="bg-emerald-100/70 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 font-bold space-y-1">
            <div>Total Corridor Block Hours: 3.5 Hours (Saved 5.0 Hours)</div>
            <div>Corridor Occupations: 1 Single Coordinated Window</div>
            <div className="text-emerald-800 font-semibold text-[11px]">Result: 58% reduction in block hours & zero repeated train delays!</div>
          </div>
        </div>
      </div>
    </div>
  );
};
