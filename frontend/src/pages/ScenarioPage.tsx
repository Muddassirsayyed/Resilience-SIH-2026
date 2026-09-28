import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Play,
  Trash2,
  AlertTriangle,
  Clock,
  Ban,
  ShieldAlert,
  CalendarX,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';
import {
  ScenarioItem,
  WhatIfComparison,
  Disruption,
  DisruptionType,
} from '../types';
import {
  fetchScenarios,
  createScenario,
  runScenario,
  deleteScenario,
} from '../services/api';

export const ScenarioPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<WhatIfComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [scenarioName, setScenarioName] = useState<string>('Express Corridor Disruption');
  const [scenarioDesc, setScenarioDesc] = useState<string>('Simulating 45m train delay and emergency track inspection');
  const [disruptionType, setDisruptionType] = useState<DisruptionType>('train_delay');
  const [trainId, setTrainId] = useState<string>('CONF-801');
  const [delayMinutes, setDelayMinutes] = useState<number>(30);
  const [sectionCode, setSectionCode] = useState<string>('MTJ-NY-L1');
  const [location, setLocation] = useState<string>('Mathura Junction North Yard');
  const [startTime, setStartTime] = useState<string>('2026-09-28T04:00:00Z');
  const [endTime, setEndTime] = useState<string>('2026-09-28T05:30:00Z');
  const [windowId, setWindowId] = useState<string>('BP-2026-001');
  const [resourceType, setResourceType] = useState<'crew' | 'machine'>('crew');
  const [resourceTypeName, setResourceTypeName] = useState<string>('electrical');
  const [newCapacity, setNewCapacity] = useState<number>(1);

  // Staged disruptions in form
  const [stagedDisruptions, setStagedDisruptions] = useState<Disruption[]>([
    { type: 'train_delay', train_id: 'CONF-801', delay_minutes: 30 },
  ]);

  // Changed Tasks Filter
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
  const [taskSearchTerm, setTaskSearchTerm] = useState<string>('');

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScenarios();
      setScenarios(data || []);
      if (data && data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(data[0].scenario_id);
        if (data[0].result) {
          setActiveResult(data[0].result);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, [selectedScenarioId]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleAddStagedDisruption = () => {
    let newD: Disruption;
    if (disruptionType === 'train_delay') {
      newD = { type: 'train_delay', train_id: trainId, delay_minutes: Number(delayMinutes) };
    } else if (disruptionType === 'train_cancellation') {
      newD = { type: 'train_cancellation', train_id: trainId };
    } else if (disruptionType === 'emergency_blockage') {
      newD = {
        type: 'emergency_blockage',
        section_code: sectionCode,
        location,
        start_time: startTime,
        end_time: endTime,
        description: 'Emergency Track Fracture Defect',
      };
    } else if (disruptionType === 'window_closure') {
      newD = { type: 'window_closure', window_id: windowId, closure_type: 'full' };
    } else {
      newD = {
        type: 'resource_reduction',
        resource_type: resourceType,
        type_name: resourceTypeName,
        new_capacity: Number(newCapacity),
      };
    }
    setStagedDisruptions([...stagedDisruptions, newD]);
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'delay') {
      setScenarioName('Express Train Delay Simulation');
      setScenarioDesc('Kerala Express (CONF-801) delayed by 45 minutes');
      setStagedDisruptions([{ type: 'train_delay', train_id: 'CONF-801', delay_minutes: 45 }]);
    } else if (presetName === 'cancel') {
      setScenarioName('Shatabdi Cancellation Simulation');
      setScenarioDesc('Lucknow Shatabdi (CONF-802) cancelled on NDLS-GZB line');
      setStagedDisruptions([{ type: 'train_cancellation', train_id: 'CONF-802' }]);
    } else if (presetName === 'fracture') {
      setScenarioName('Emergency Rail Fracture Blockage');
      setScenarioDesc('Unexpected rail fissure detected on Mathura North Yard Line 1');
      setStagedDisruptions([
        {
          type: 'emergency_blockage',
          section_code: 'MTJ-NY-L1',
          location: 'Mathura Junction North Yard',
          start_time: '2026-09-28T05:30:00Z',
          end_time: '2026-09-28T07:30:00Z',
          description: 'Emergency Rail Fracture Ultrasonic Verification',
        },
      ]);
    } else if (presetName === 'closure') {
      setScenarioName('Catenary Window Cancellation');
      setScenarioDesc('Corridor maintenance window BP-2026-001 closed due to weather');
      setStagedDisruptions([{ type: 'window_closure', window_id: 'BP-2026-001', closure_type: 'full' }]);
    } else if (presetName === 'crew') {
      setScenarioName('Electrical Crew Depot Shortage');
      setScenarioDesc('Electrical TRD crew reduced from 3 to 1 due to emergency callout');
      setStagedDisruptions([
        {
          type: 'resource_reduction',
          resource_type: 'crew',
          type_name: 'electrical',
          new_capacity: 1,
        },
      ]);
    }
  };

  const handleCreateScenario = async () => {
    if (!scenarioName.trim()) {
      setError('Please provide a scenario name.');
      return;
    }
    if (stagedDisruptions.length === 0) {
      setError('Please add at least one operational disruption.');
      return;
    }

    setError(null);
    try {
      const res = await createScenario({
        name: scenarioName,
        description: scenarioDesc,
        disruptions: stagedDisruptions,
      });
      setSuccessMsg(`Scenario ${res.scenario_id} created successfully.`);
      setSelectedScenarioId(res.scenario_id);
      await loadScenarios();
      // Auto-run simulation
      await handleRunScenario(res.scenario_id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create scenario');
    }
  };

  const handleRunScenario = async (scenId: string) => {
    setRunningId(scenId);
    setError(null);
    try {
      const comp = await runScenario(scenId);
      setActiveResult(comp);
      setSelectedScenarioId(scenId);
      setSuccessMsg(`What-If simulation completed for ${scenId}. Base dataset remained 100% untouched.`);
      await loadScenarios();
    } catch (err: any) {
      setError(err?.message || 'Failed to execute What-If simulation');
    } finally {
      setRunningId(null);
    }
  };

  const handleDeleteScenario = async (scenId: string) => {
    if (!window.confirm(`Delete scenario ${scenId}?`)) return;
    try {
      await deleteScenario(scenId);
      if (selectedScenarioId === scenId) {
        setSelectedScenarioId(null);
        setActiveResult(null);
      }
      await loadScenarios();
      setSuccessMsg(`Scenario ${scenId} removed.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete scenario');
    }
  };

  const filteredChangedTasks = (activeResult?.changed_tasks || []).filter((task) => {
    const matchesFilter = taskStatusFilter === 'ALL' || task.status === taskStatusFilter;
    const matchesSearch =
      task.task_title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
      task.task_id.toLowerCase().includes(taskSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                What-If Scenario Simulation
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> CP-SAT Dynamic Re-Planner
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Simulate sudden train delays, emergency fractures, closures, and resource cuts with isolated mathematical re-optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-amber-400 animate-pulse bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Loading scenarios...
            </span>
          )}
          <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            Base Data Immutability: <strong className="text-emerald-400">Guaranteed</strong>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Presets and Simulation Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Dispatcher Disruption Scenarios */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Quick Disruption Presets
          </h2>
          <p className="text-xs text-slate-400">
            One-click presets simulating standard Indian Railways corridor contingency events:
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => handleApplyPreset('delay')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition group"
            >
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                Train Delay (+45m)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Kerala Express delayed on Mathura North Yard</p>
            </button>

            <button
              onClick={() => handleApplyPreset('cancel')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition group"
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Ban className="w-3.5 h-3.5" />
                Train Cancellation
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Shatabdi cancelled on NDLS-GZB Line 3 (frees slot)</p>
            </button>

            <button
              onClick={() => handleApplyPreset('fracture')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-red-500/40 transition group"
            >
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Emergency Rail Fracture Blockage
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Urgent broken rail inspection: Mathura Yard 05:30-07:30</p>
            </button>

            <button
              onClick={() => handleApplyPreset('closure')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 transition group"
            >
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <CalendarX className="w-3.5 h-3.5" />
                Maintenance Window Closure
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Cancel window BP-2026-001 due to overhead storms</p>
            </button>

            <button
              onClick={() => handleApplyPreset('crew')}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/40 transition group"
            >
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                Depot Crew Reduction (3 → 1)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Simulate electrical workforce cut to 1 team</p>
            </button>
          </div>
        </div>

        {/* Center / Right: Staged Scenario Builder & Submitter */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              Configure What-If Scenario
            </h2>
            <span className="text-xs text-slate-400">
              Staged Disruptions: <strong className="text-white">{stagedDisruptions.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scenario Name</label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
              <input
                type="text"
                value={scenarioDesc}
                onChange={(e) => setScenarioDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Add Disruption Row */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Add Operational Disruption
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Disruption Type</label>
                <select
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value as DisruptionType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="train_delay">Train Delay</option>
                  <option value="train_cancellation">Train Cancellation</option>
                  <option value="emergency_blockage">Emergency Track Blockage</option>
                  <option value="window_closure">Maintenance Window Closure</option>
                  <option value="resource_reduction">Resource Capacity Reduction</option>
                </select>
              </div>

              {disruptionType === 'train_delay' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Train ID / Number</label>
                    <input
                      type="text"
                      value={trainId}
                      onChange={(e) => setTrainId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. CONF-801 or 12626"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Delay (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {disruptionType === 'train_cancellation' && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Train ID to Cancel</label>
                  <input
                    type="text"
                    value={trainId}
                    onChange={(e) => setTrainId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    placeholder="e.g. CONF-802 or 12004"
                  />
                </div>
              )}

              {disruptionType === 'emergency_blockage' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Section Code</label>
                    <input
                      type="text"
                      value={sectionCode}
                      onChange={(e) => setSectionCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Location Details</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. Mathura Yard North"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Time (ISO)</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">End Time (ISO)</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {disruptionType === 'window_closure' && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Window ID to Close</label>
                  <input
                    type="text"
                    value={windowId}
                    onChange={(e) => setWindowId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    placeholder="e.g. BP-2026-001"
                  />
                </div>
              )}

              {disruptionType === 'resource_reduction' && (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resource Category</label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value as 'crew' | 'machine')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="crew">Crew Workforce</option>
                      <option value="machine">Track Machinery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resource / Trade</label>
                    <input
                      type="text"
                      value={resourceTypeName}
                      onChange={(e) => setResourceTypeName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="electrical or tamping_machine"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">New Capacity Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddStagedDisruption}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white rounded-lg transition"
              >
                + Stage Disruption
              </button>
            </div>
          </div>

          {/* Staged Disruptions Badges */}
          {stagedDisruptions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {stagedDisruptions.map((d, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5"
                >
                  <strong className="text-red-400 uppercase">{d.type.replace('_', ' ')}:</strong>{' '}
                  {d.train_id || d.section_code || d.window_id || d.type_name}
                  {d.delay_minutes && ` (+${d.delay_minutes}m)`}
                  {d.new_capacity !== undefined && ` (cap: ${d.new_capacity})`}
                  <button
                    onClick={() => setStagedDisruptions(stagedDisruptions.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-400 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Ready to run CP-SAT simulation against an isolated snapshot.
            </span>
            <button
              onClick={handleCreateScenario}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/40 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Create & Run Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios History Bar */}
      {scenarios.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Simulation Scenarios ({scenarios.length})
            </h3>
            <span className="text-xs text-slate-500">Select any scenario to view its What-If comparison</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((scen) => (
              <div
                key={scen.scenario_id}
                onClick={() => {
                  setSelectedScenarioId(scen.scenario_id);
                  if (scen.result) setActiveResult(scen.result);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedScenarioId === scen.scenario_id
                    ? 'bg-slate-800 border-red-500 shadow-md'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">{scen.scenario_id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      scen.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : scen.status === 'RUNNING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {scen.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-1 truncate">{scen.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{scen.description}</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunScenario(scen.scenario_id);
                    }}
                    disabled={runningId === scen.scenario_id}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    {runningId === scen.scenario_id ? 'Re-optimizing...' : 'Re-Run'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScenario(scen.scenario_id);
                    }}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What-If Comparison Scoreboard */}
      {activeResult && (
        <div className="space-y-6 pt-2">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Scheduled Tasks</div>
              <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
                {activeResult.tasks_scheduled_scenario}
                <span className="text-xs text-slate-400 font-normal">
                  (Base: {activeResult.tasks_scheduled_base})
                </span>
              </div>
              <div className="text-xs mt-1 text-slate-400 flex items-center gap-1">
                {activeResult.tasks_new.length > 0 && (
                  <span className="text-emerald-400 font-semibold">+{activeResult.tasks_new.length} new</span>
                )}
                {activeResult.tasks_removed.length > 0 && (
                  <span className="text-red-400 font-semibold ml-1">-{activeResult.tasks_removed.length} deferred</span>
                )}
                {activeResult.tasks_moved.length > 0 && (
                  <span className="text-amber-400 font-semibold ml-1">{activeResult.tasks_moved.length} moved</span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Conflicts Delta</div>
              <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
                {activeResult.conflicts_after}
                <span className="text-xs text-slate-400 font-normal">
                  (Before: {activeResult.conflicts_before})
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeResult.conflicts_resolved} Resolved in Simulation
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Optimization Efficiency</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {activeResult.optimization_score}
              </div>
              <div className="text-xs text-slate-400 mt-1">AI Priority + Capacity Fit</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Scheduler Engine</div>
              <div className="text-lg font-black text-white mt-1 flex items-center gap-1.5 uppercase font-mono">
                <Cpu className="w-4 h-4 text-purple-400" />
                {activeResult.scheduler_type}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {activeResult.scheduler_type === 'cp_sat'
                  ? 'Google OR-Tools CP-SAT'
                  : 'Deterministic Fallback'}
              </div>
            </div>
          </div>

          {/* Changed Tasks Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Task Re-Scheduling Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed transition status comparing baseline block plan vs What-If re-optimized plan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                    placeholder="Search task..."
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="MOVED">Moved</option>
                  <option value="NEW">New</option>
                  <option value="REMOVED">Removed / Deferred</option>
                  <option value="UNCHANGED">Unchanged</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700/80">
                    <th className="p-3">Task Details</th>
                    <th className="p-3">Base Window & Timing</th>
                    <th className="p-3">Scenario Window & Timing</th>
                    <th className="p-3 text-center">Simulation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredChangedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        No tasks matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredChangedTasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-white text-sm">{task.task_title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{task.task_id}</div>
                        </td>

                        <td className="p-3">
                          {task.base_window ? (
                            <div>
                              <span className="font-mono text-slate-300 font-semibold">{task.base_window}</span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {task.base_start?.slice(11, 16)} → {task.base_end?.slice(11, 16)} UTC
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Not scheduled in base</span>
                          )}
                        </td>

                        <td className="p-3">
                          {task.scenario_window ? (
                            <div>
                              <span className="font-mono text-red-300 font-semibold">{task.scenario_window}</span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {task.scenario_start?.slice(11, 16)} → {task.scenario_end?.slice(11, 16)} UTC
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Deferred due to constraints</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] uppercase ${
                              task.status === 'UNCHANGED'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : task.status === 'MOVED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : task.status === 'NEW'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {task.status === 'MOVED' && <ArrowRight className="w-3 h-3" />}
                            {task.status === 'NEW' && <CheckCircle2 className="w-3 h-3" />}
                            {task.status === 'REMOVED' && <Ban className="w-3 h-3" />}
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
