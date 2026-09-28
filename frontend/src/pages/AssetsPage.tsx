import React, { useEffect, useState } from 'react';
import { Database, Search } from 'lucide-react';
import { fetchAssetsDefects } from '../services/api';
import { AssetDefectItem } from '../types';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<AssetDefectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAssetsDefects()
      .then((data) => setAssets(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAssets = assets.filter((item) => {
    const matchesSearch =
      item.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.defect.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.corridor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || item.department === departmentFilter;
    const matchesRisk = riskFilter === 'ALL' || item.risk_level === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesDept && matchesRisk && matchesStatus;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 font-extrabold';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-8">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1.5">
        <span>Home</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">Assets & Defects</span>
      </div>

      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <Database className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Railway Maintenance Assets & Defect Register
          </h1>
        </div>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Integrated view of physical railway assets across TMS, SMMS, and TDMS databases requiring block planning.
        </p>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset, defect, corridor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering (TMS)</option>
              <option value="Traction Distribution">Traction Distribution (TDMS)</option>
              <option value="Signal & Telecommunication">Signal & Telecom (SMMS)</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE_DEFECT">Active Defect</option>
              <option value="SCHEDULED">Block Scheduled</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets & Defects Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
            Tracked Assets ({filteredAssets.length} Records)
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">DEMO DATA • LIVE SYNCHRONIZED</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-bold">
            Loading Asset & Defect Data...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-bold">
            No asset records match the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Asset ID / Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Corridor Location</th>
                  <th className="py-3 px-4">Defect Description</th>
                  <th className="py-3 px-4 text-center">Risk Level</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Recommended Block</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredAssets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{item.asset_id}</div>
                      <div className="text-[11px] text-slate-500">{item.asset_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{item.corridor}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs">{item.defect}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getRiskBadge(item.risk_level)}`}>
                        {item.risk_level} ({item.criticality_score})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-bold">{item.due_date}</td>
                    <td className="py-3 px-4">
                      {item.recommended_block_id ? (
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {item.recommended_block_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.status === 'SCHEDULED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
