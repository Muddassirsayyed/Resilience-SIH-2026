import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ListOrdered,
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers,
  Activity,
  ShieldAlert,
  SlidersHorizontal,
  Gauge,
} from 'lucide-react';
import { PrioritizedTask } from '../types';
import { fetchPrioritizedTasks } from '../services/api';
import { getPriorityConfig, getPriorityLevel, PRIORITY_THRESHOLDS } from '../utils/priority';


export const PrioritizedTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<PrioritizedTask[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Record<string, PrioritizedTask[]>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');

  const loadPrioritizedTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPrioritizedTasks();
      if (response && response.success) {
        setTasks(response.data || []);
        setGroupedTasks(response.grouped || {});
      } else {
        throw new Error('Invalid response received from prioritization service');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch AI prioritized maintenance tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrioritizedTasks();
  }, [loadPrioritizedTasks]);

  // Dynamic filter options derived from real API data
  const locations = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.location).filter(Boolean))).sort();
  }, [tasks]);

  const departments = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.department).filter(Boolean))).sort();
  }, [tasks]);

  // Filter evaluation logic
  const isTaskMatchingFilters = useCallback(
    (task: PrioritizedTask) => {
      const titleMatch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (task.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const locMatch = (task.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      const secMatch = (task.section_code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = titleMatch || idMatch || locMatch || secMatch || descMatch;

      const matchesLoc = locationFilter === 'ALL' || task.location === locationFilter;
      const matchesDept = departmentFilter === 'ALL' || task.department === departmentFilter;
      const matchesPriority =
        priorityFilter === 'ALL' || getPriorityLevel(task.priority_score) === priorityFilter;

      return matchesSearch && matchesLoc && matchesDept && matchesPriority;
    },
    [searchTerm, locationFilter, departmentFilter, priorityFilter]
  );

  // Filtered flat tasks (sorted descending by priority score)
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(isTaskMatchingFilters)
      .slice()
      .sort((a, b) => b.priority_score - a.priority_score);
  }, [tasks, isTaskMatchingFilters]);

  // Filtered grouped tasks (Location -> Department -> Tasks)
  const filteredGroupedTasks = useMemo(() => {
    const result: Record<string, Record<string, PrioritizedTask[]>> = {};

    Object.entries(groupedTasks).forEach(([loc, deptMap]) => {
      if (locationFilter !== 'ALL' && loc !== locationFilter) return;

      const matchingDepts: Record<string, PrioritizedTask[]> = {};

      Object.entries(deptMap).forEach(([dept, deptTaskList]) => {
        if (departmentFilter !== 'ALL' && dept !== departmentFilter) return;

        const matchingTasks = deptTaskList
          .filter(isTaskMatchingFilters)
          .slice()
          .sort((a, b) => b.priority_score - a.priority_score);

        if (matchingTasks.length > 0) {
          matchingDepts[dept] = matchingTasks;
        }
      });

      if (Object.keys(matchingDepts).length > 0) {
        result[loc] = matchingDepts;
      }
    });

    return result;
  }, [groupedTasks, locationFilter, departmentFilter, isTaskMatchingFilters]);

  // Summary Metrics
  const highestScore = tasks.length > 0 ? Math.max(...tasks.map((t) => t.priority_score)) : 0;
  const highPriorityCount = tasks.filter((t) => getPriorityLevel(t.priority_score) === 'HIGH').length;
  const mediumPriorityCount = tasks.filter((t) => getPriorityLevel(t.priority_score) === 'MEDIUM').length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb line */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span className="hover:text-slate-800 cursor-pointer">Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">AI Priority Engine</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-6 w-6 text-red-600 animate-pulse" />
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
              Maintenance Task Prioritization
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Algorithmic ranking across track sections based on safety, overdue duration, line density, and asset condition.
          </p>
        </div>

        {/* Controls: Mode Switcher & Refresh Button */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'flat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Priority List</span>
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === 'grouped'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Grouped by Location</span>
            </button>
          </div>

          <button
            onClick={loadPrioritizedTasks}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition disabled:opacity-50"
            title="Refresh priority scores from backend"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Total Tasks */}
        <div className="bg-[#e6f7ff] border border-[#91caff] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#0284c7]">{tasks.length}</div>
            <div className="text-xs font-black text-[#075985]">Total Tasks</div>
            <div className="text-[10px] font-semibold text-[#0369a1]/80">Active maintenance queue</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-100/80 text-[#0284c7] flex items-center justify-center border border-sky-200">
            <ListOrdered className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Highest Score */}
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-[#dc2626]">
              {highestScore > 0 ? highestScore.toFixed(2) : '0.00'}
            </div>
            <div className="text-xs font-black text-[#991b1b]">Top Priority Score</div>
            <div className="text-[10px] font-semibold text-[#dc2626]/80">Scale 0.0 - 10.0</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-100/80 text-[#dc2626] flex items-center justify-center border border-red-200">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: High Priority Level */}
        <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-red-700">{highPriorityCount}</div>
            <div className="text-xs font-black text-red-900">HIGH Priority (&ge; {PRIORITY_THRESHOLDS.HIGH})</div>
            <div className="text-[10px] font-semibold text-red-600/80">Immediate block required</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-100/80 text-red-700 flex items-center justify-center border border-red-200">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Medium Priority Level */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-amber-700">{mediumPriorityCount}</div>
            <div className="text-xs font-black text-amber-900">MEDIUM Priority (&ge; {PRIORITY_THRESHOLDS.MEDIUM})</div>
            <div className="text-[10px] font-semibold text-amber-700/80">Next block window</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center border border-amber-200">
            <Gauge className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, section, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs transition"
            />
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <div className="text-[11px] font-bold text-slate-500 shrink-0">Location:</div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-bold focus:outline-none truncate"
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <div className="text-[11px] font-bold text-slate-500 shrink-0">Dept:</div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-bold focus:outline-none truncate"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <div className="text-[11px] font-bold text-slate-500 shrink-0">Priority:</div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-bold focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">HIGH (&ge; {PRIORITY_THRESHOLDS.HIGH})</option>
              <option value="MEDIUM">MEDIUM (&ge; {PRIORITY_THRESHOLDS.MEDIUM})</option>
              <option value="LOW">LOW (&lt; {PRIORITY_THRESHOLDS.MEDIUM})</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchTerm || locationFilter !== 'ALL' || departmentFilter !== 'ALL' || priorityFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('ALL');
                setDepartmentFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error state display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>
              <strong>Error loading prioritized tasks:</strong> {error}
            </span>
          </div>
          <button
            onClick={loadPrioritizedTasks}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
          >
            Retry API
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 animate-pulse shadow-xs">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
              <div className="grid grid-cols-5 gap-2 pt-2">
                <div className="h-8 bg-slate-100 rounded"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <SlidersHorizontal className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Prioritized Tasks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No maintenance tasks match your current filter parameters. Try broadening your filter selection or resetting search terms.
          </p>
        </div>
      ) : viewMode === 'flat' ? (
        /* Ranked Priority List (Sorted descending) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task, index) => {
            const visual = getPriorityConfig(task.priority_score);
            const isTopRanked = index === 0;

            return (
              <div
                key={task.id}
                className={`bg-white p-4.5 rounded-xl border shadow-xs transition flex flex-col justify-between space-y-3.5 hover:shadow-md hover:border-slate-300 ${visual.borderAccent}`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Rank, Task ID, Section Code, Priority Badge & Score */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white bg-[#0a192f] px-2.5 py-1 rounded-md shadow-2xs">
                        #{index + 1} {task.id}
                      </span>
                      {task.section_code && (
                        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {task.section_code}
                        </span>
                      )}
                      {isTopRanked && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <span>TOP PRIORITY</span>
                        </span>
                      )}
                    </div>

                    {/* Centralized Priority Visual Badge */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono border flex items-center space-x-1 ${visual.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${visual.dotColor}`}></span>
                        <span>{visual.label}</span>
                      </span>
                      <div className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono font-extrabold text-xs shadow-2xs">
                        {task.priority_score.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Title & Department */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {task.department}
                      </span>
                      {task.status && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          {task.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Duration */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-start space-x-1.5 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-red-700 shrink-0 mt-0.5" />
                      <span className="font-semibold truncate" title={task.location}>
                        {task.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-700 justify-end">
                      <Clock className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                      <span className="font-semibold">
                        {task.duration_hours ? `${task.duration_hours} hrs required` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Description if present */}
                  {task.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {task.description}
                    </p>
                  )}

                  {/* Multi-Criteria Scoring Factors */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>Multi-Criteria Factors</span>
                      <span className="font-mono text-slate-400 lowercase">0.30•0.20•0.20•0.20•0.10</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <div className="p-1 rounded bg-slate-100 border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold">Crit (30%)</div>
                        <div className="text-xs font-mono font-extrabold text-slate-900">{task.criticality}</div>
                      </div>
                      <div className="p-1 rounded bg-slate-100 border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold">Safety (20%)</div>
                        <div className="text-xs font-mono font-extrabold text-slate-900">{task.safety}</div>
                      </div>
                      <div className="p-1 rounded bg-slate-100 border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold">Overdue (20%)</div>
                        <div className="text-xs font-mono font-extrabold text-slate-900">{task.overdue}</div>
                      </div>
                      <div className="p-1 rounded bg-slate-100 border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold">Train (20%)</div>
                        <div className="text-xs font-mono font-extrabold text-slate-900">{task.train_impact}</div>
                      </div>
                      <div className="p-1 rounded bg-slate-100 border border-slate-200">
                        <div className="text-[9px] text-slate-500 font-bold">Asset (10%)</div>
                        <div className="text-xs font-mono font-extrabold text-slate-900">{task.asset_impact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clustered Operational Area View (Location -> Department -> Tasks) */
        <div className="space-y-6">
          {Object.entries(filteredGroupedTasks).map(([location, deptMap]) => {
            const locTaskCount = Object.values(deptMap).reduce((acc, curr) => acc + curr.length, 0);

            return (
              <div key={location} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Location Section Header */}
                <div className="bg-[#0a192f] text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-4.5 w-4.5 text-red-400" />
                    <div>
                      <h2 className="text-sm font-black tracking-wide">{location}</h2>
                      <div className="text-[10px] text-slate-300 font-medium">Operational Track Sector</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-slate-100 border border-white/20">
                    {locTaskCount} {locTaskCount === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>

                {/* Department sub-sections */}
                <div className="p-5 space-y-5">
                  {Object.entries(deptMap).map(([dept, deptTasks]) => {
                    return (
                      <div key={dept} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-950">
                            <Layers className="h-4 w-4 text-blue-700" />
                            <span>{dept} Department</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {deptTasks.length} {deptTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {deptTasks.map((task) => {
                            const visual = getPriorityConfig(task.priority_score);

                            return (
                              <div
                                key={task.id}
                                className={`p-3.5 rounded-lg border bg-slate-50/80 hover:bg-slate-50 transition flex flex-col justify-between space-y-2.5 ${visual.borderAccent}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                        {task.id}
                                      </span>
                                      {task.section_code && (
                                        <span className="font-mono text-[10px] text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                                          {task.section_code}
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${visual.badgeClass}`}>
                                        {visual.label}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                      {task.title}
                                    </h4>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Score</div>
                                    <div className="text-base font-mono font-black text-slate-900">
                                      {task.priority_score.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                                  <span>Duration: <strong>{task.duration_hours || 'N/A'} hrs</strong></span>
                                  <span>Safety: <strong>{task.safety}</strong> • Overdue: <strong>{task.overdue}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
