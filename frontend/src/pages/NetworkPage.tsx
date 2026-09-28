import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Network,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  NetworkTopologyResponse,
  NetworkSection,
  NetworkImpactData,
  BlockPlanItem,
  ConflictAlertItem,
} from '../types';
import {
  fetchNetwork,
  calculateNetworkImpact,
  fetchBlockPlans,
  fetchConflicts,
} from '../services/api';

export const NetworkPage: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkTopologyResponse | null>(null);
  const [plans, setPlans] = useState<BlockPlanItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlertItem[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<NetworkSection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Impact Analysis Form State
  const [impactSectionId, setImpactSectionId] = useState<string>('AGC-TDL-UP');
  const [impactStartTime, setImpactStartTime] = useState<string>('2026-09-28T04:00:00Z');
  const [impactEndTime, setImpactEndTime] = useState<string>('2026-09-28T06:00:00Z');
  const [impactRadius, setImpactRadius] = useState<number>(1);
  const [analyzingImpact, setAnalyzingImpact] = useState<boolean>(false);
  const [impactResult, setImpactResult] = useState<NetworkImpactData | null>(null);
  const [impactError, setImpactError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [network, planData, conflictData] = await Promise.all([
        fetchNetwork(),
        fetchBlockPlans().catch(() => []),
        fetchConflicts().catch(() => []),
      ]);
      setNetworkData(network);
      setPlans(planData);
      setConflicts(conflictData);

      // Default select first section
      const firstCorridor = network.corridors && network.corridors[0];
      if (firstCorridor && firstCorridor.sections.length > 0) {
        setSelectedSection(firstCorridor.sections[0]);
        setImpactSectionId(firstCorridor.sections[0].section_id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load network topology data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique sections list across all corridors
  const uniqueSections = useMemo(() => {
    const map = new Map<string, NetworkSection>();
    (networkData?.corridors || []).forEach((c) => {
      c.sections.forEach((s) => {
        if (!map.has(s.section_id)) {
          map.set(s.section_id, s);
        }
      });
    });
    return Array.from(map.values());
  }, [networkData]);

  // Compute live dynamic status of a section
  const getSectionOperationalStatus = (
    sectionId: string
  ): { status: 'CONFLICT' | 'MAINTENANCE' | 'TRAIN_OCCUPIED' | 'CLEAR'; label: string; badgeClass: string } => {
    // Check conflicts
    const hasConflict = conflicts.some(
      (c) =>
        (c.location && c.location.toLowerCase().includes(sectionId.toLowerCase())) ||
        (c.task && c.task.includes(sectionId))
    );
    if (hasConflict) {
      return {
        status: 'CONFLICT',
        label: 'CONFLICT DETECTED',
        badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40',
      };
    }

    // Check active scheduled maintenance
    const hasMaintenance = plans.some(
      (p) =>
        (p.section_code === sectionId || (p.location && p.location.includes(sectionId))) &&
        (p.status === 'scheduled' || p.status === 'in_progress')
    );
    if (hasMaintenance) {
      return {
        status: 'MAINTENANCE',
        label: 'MAINTENANCE ACTIVE',
        badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
      };
    }

    return {
      status: 'CLEAR',
      label: 'CLEAR / OPERATIONAL',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    };
  };

  const handleRunImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impactSectionId) return;
    setAnalyzingImpact(true);
    setImpactError(null);
    try {
      const res = await calculateNetworkImpact({
        section_id: impactSectionId,
        start_time: impactStartTime,
        end_time: impactEndTime,
        radius_hops: impactRadius,
      });
      setImpactResult(res.data);
    } catch (err: any) {
      setImpactError(err?.message || 'Failed to analyze network impact');
    } finally {
      setAnalyzingImpact(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm font-medium">Synchronizing Multi-Corridor Railway Topology...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-6 text-center text-red-300">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-2" />
          <h2 className="text-lg font-bold">Network Synchronization Error</h2>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Retry Synchronization
          </button>
        </div>
      </div>
    );
  }

  const corridors = networkData?.corridors || [];
  const junctions = uniqueSections.filter((s) => s.adjacent_sections.length > 1 || s.is_junction);

  const filteredSections =
    selectedCorridorId === 'ALL'
      ? uniqueSections
      : uniqueSections.filter((s) => s.corridor_id === selectedCorridorId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Multi-Corridor Network Topology & Synchronization
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  LIVE SYNC
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Indian Railways high-density network graph, section boundaries, and ripple impact analysis
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Graph</span>
          </button>
        </div>
      </div>

      {/* Network Overview Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Corridors</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{corridors.length}</p>
          <p className="text-xs text-slate-500 mt-1">Multi-section trunk routes</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sections</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{uniqueSections.length}</p>
          <p className="text-xs text-slate-500 mt-1">Topology block sections</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Junctions</span>
            <Share2 className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{junctions.length}</p>
          <p className="text-xs text-slate-500 mt-1">Multi-corridor crossover nodes</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Conflicts</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-400">{conflicts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Immediate clearance required</p>
        </div>
      </div>

      {/* Corridors Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Synchronized Corridors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {corridors.map((c) => {
            const isSelected = selectedCorridorId === c.corridor_id;
            return (
              <div
                key={c.corridor_id}
                onClick={() => setSelectedCorridorId(isSelected ? 'ALL' : c.corridor_id)}
                className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-[#0f172a] hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c.corridor_id}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {c.zone || 'NCR'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{c.line_classification || 'Mainline'}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-2">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.description || 'Indian Railways trunk section'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Corridor Status</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      SYNCHRONIZED
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Sections: <strong className="text-white">{c.sections.length}</strong>
                    </span>
                  </div>
                  <span className="text-blue-400 font-semibold hover:underline">
                    {isSelected ? 'Showing Corridor Sections (Click to show all)' : 'Filter by this corridor →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections Table & Topology Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                Network Sections
                {selectedCorridorId !== 'ALL' && (
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    (Filtered by {selectedCorridorId})
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click a section to inspect adjacent blocks and network neighbors
              </p>
            </div>
            {selectedCorridorId !== 'ALL' && (
              <button
                onClick={() => setSelectedCorridorId('ALL')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Section ID</th>
                  <th className="py-3 px-4">Name / Location</th>
                  <th className="py-3 px-4">Corridor</th>
                  <th className="py-3 px-4">Tracks</th>
                  <th className="py-3 px-4 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-xs">
                {filteredSections.map((sec) => {
                  const statusInfo = getSectionOperationalStatus(sec.section_id);
                  const isSelected = selectedSection?.section_id === sec.section_id;

                  return (
                    <tr
                      key={sec.section_id}
                      onClick={() => {
                        setSelectedSection(sec);
                        setImpactSectionId(sec.section_id);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-950/40 text-white font-semibold'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{sec.section_id}</span>
                          {(sec.is_junction || sec.adjacent_sections.length > 1) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              JUNCTION
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs">
                        {sec.section_name || sec.location}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{sec.corridor_id}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans">
                        {sec.tracks === 2 ? 'Double Track' : `${sec.tracks} Tracks`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Detail & Adjacent Blocks */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-5 flex flex-col justify-between space-y-4">
          {selectedSection ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">{selectedSection.section_id}</span>
                  {selectedSection.adjacent_sections.length > 1 ? (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      INTER-CORRIDOR JUNCTION
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
                      Standard Section
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {selectedSection.section_name}
                </h4>
                <p className="text-xs text-slate-400">{selectedSection.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
                  <span className="text-slate-500 block">Sequence</span>
                  <span className="text-white font-semibold font-mono">Block {selectedSection.sequence}</span>
                </div>
                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
                  <span className="text-slate-500 block">Tracks</span>
                  <span className="text-white font-semibold font-mono">{selectedSection.tracks}</span>
                </div>
                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
                  <span className="text-slate-500 block">Corridor</span>
                  <span className="text-white font-semibold">{selectedSection.corridor_id}</span>
                </div>
                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
                  <span className="text-slate-500 block">Electrification</span>
                  <span className="text-white font-semibold">{selectedSection.electrified ? '25 kV AC OHE' : 'Non-elec'}</span>
                </div>
              </div>

              {/* Adjacent Topology Neighbors */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Direct Topology Neighbors ({selectedSection.adjacent_sections.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedSection.adjacent_sections.map((adj) => (
                    <span
                      key={adj}
                      onClick={() => {
                        const sec = uniqueSections.find((s) => s.section_id === adj);
                        if (sec) {
                          setSelectedSection(sec);
                          setImpactSectionId(sec.section_id);
                        }
                      }}
                      className="cursor-pointer px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 flex items-center gap-1 transition"
                    >
                      <ArrowRight className="h-3 w-3 text-blue-400" />
                      {adj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Select a section from the table to inspect details.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (selectedSection) {
                  setImpactSectionId(selectedSection.section_id);
                  const el = document.getElementById('impact-analyzer');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow"
            >
              Analyze Ripple Impact for this Section ↓
            </button>
          </div>
        </div>
      </div>

      {/* Network Ripple Impact Analysis Tool */}
      <div id="impact-analyzer" className="rounded-xl border border-slate-800 bg-[#0f172a] p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            Network Ripple Impact Analysis Tool
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate a blockage or maintenance event at any section and evaluate cascading ripple impact across adjacent corridors
          </p>
        </div>

        {/* Impact Request Form */}
        <form onSubmit={handleRunImpact} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Section ID</label>
            <select
              value={impactSectionId}
              onChange={(e) => setImpactSectionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            >
              {uniqueSections.map((s) => (
                <option key={s.section_id} value={s.section_id}>
                  {s.section_id} ({s.section_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Event Start Time (UTC)</label>
            <input
              type="text"
              value={impactStartTime}
              onChange={(e) => setImpactStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              placeholder="2026-09-28T04:00:00Z"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Event End Time (UTC)</label>
            <input
              type="text"
              value={impactEndTime}
              onChange={(e) => setImpactEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              placeholder="2026-09-28T06:00:00Z"
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="w-1/2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Radius (Hops)</label>
              <select
                value={impactRadius}
                onChange={(e) => setImpactRadius(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1 Hop (Direct)</option>
                <option value={2}>2 Hops (Expanded)</option>
                <option value={3}>3 Hops (Network Wide)</option>
              </select>
            </div>
            <div className="w-1/2">
              <button
                type="submit"
                disabled={analyzingImpact}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {analyzingImpact ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Run Analysis</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {impactError && (
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{impactError}</span>
          </div>
        )}

        {/* Impact Results */}
        {impactResult && (
          <div className="space-y-4 pt-2">
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400 block">Direct Section</span>
                <span className="text-base font-bold text-white font-mono mt-1 block">
                  {impactResult.target_section_id || impactResult.section_id}
                </span>
                <span className="text-xs text-slate-500">Target of disruption</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400 block">Adjacent Impacted Sections</span>
                <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
                  {(impactResult.adjacent_sections_impacted || []).length}
                </span>
                <span className="text-xs text-slate-500">Within {impactResult.radius_hops || 1} network hop(s)</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400 block">Impacted Tasks</span>
                <span className="text-xl font-black text-blue-400 mt-1 block font-mono">
                  {impactResult.total_impacted_tasks}
                </span>
                <span className="text-xs text-slate-500">Conflicting maintenance</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400 block">Impacted Trains</span>
                <span className="text-xl font-black text-red-400 mt-1 block font-mono">
                  {impactResult.total_impacted_trains}
                </span>
                <span className="text-xs text-slate-500">Movements requiring caution</span>
              </div>
            </div>

            {/* Impact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adjacent Sections */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Adjacent Corridor Sections Affected
                </h4>
                {(impactResult.adjacent_sections_impacted || []).length > 0 ? (
                  <div className="space-y-1.5">
                    {impactResult.adjacent_sections_impacted!.map((adj) => (
                      <div
                        key={adj}
                        className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700/60 text-xs font-mono text-slate-200 flex items-center justify-between"
                      >
                        <span>{adj}</span>
                        <span className="text-[10px] text-amber-400 font-sans font-bold">MONITOR HEADWAY</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No adjacent sections within radius.</p>
                )}
              </div>

              {/* Rerouting Options */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Alternative Rerouting / Bypass Options
                </h4>
                {(impactResult.rerouting_options || []).length > 0 ? (
                  <div className="space-y-2">
                    {impactResult.rerouting_options!.map((opt, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300"
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{opt.alternative_route_id}</span>
                        </div>
                        <p className="text-slate-300 mt-1 font-mono text-[11px]">
                          Path: {opt.alternative_sections.join(' → ')}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-1">{opt.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No parallel loop available; section requires track speed restriction (TSR) or time-gated block.
                  </p>
                )}
              </div>
            </div>

            {/* Affected Blocks Table */}
            {(impactResult.affected_blocks || []).length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Directly Affected Maintenance Blocks
                </h4>
                <div className="space-y-2">
                  {impactResult.affected_blocks!.map((b) => (
                    <div
                      key={b.task_id}
                      className="p-3 rounded bg-slate-800 border border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold font-mono text-white">{b.task_id}</span>
                        <span className="text-slate-400 ml-2">({b.department} - {b.work_type})</span>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Window: {b.scheduled_start} → {b.scheduled_end}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          NEEDS RESCHEDULE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
