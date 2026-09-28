import React, { useState, useMemo } from 'react'
import { ClipboardList, Download, Search } from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const ACTION_COLORS = {
  TASK_CREATED: '#16A34A', TASK_UPDATED: '#2563EB', TASK_DELETED: '#DC2626',
  BLOCK_CREATED: '#16A34A', BLOCK_UPDATED: '#2563EB', BLOCK_DELETED: '#DC2626',
  APPROVAL_APPROVED: '#16A34A', APPROVAL_SUBMITTED: '#2563EB', APPROVAL_REJECTED: '#DC2626',
  APPROVAL_CREATED: '#64748B', APPROVAL_EXECUTED: '#7C3AED',
  PRIORITY_CALCULATED: '#7C3AED', OPTIMIZATION_RUN: '#0891B2',
  EVENT_SIMULATED: '#D97706', EVENT_DETECTED: '#D97706',
  RECOMMENDATION_ACCEPTED: '#16A34A', RECOMMENDATION_DISMISSED: '#64748B',
  SYSTEM_STARTUP: '#64748B', DATA_REFRESHED: '#64748B', PLAN_SELECTED: '#0891B2',
  CONFLICT_CHECK: '#D97706', REPLAN_EXECUTED: '#0891B2',
}

export default function AuditLogs() {
  const { state } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterUser, setFilterUser] = useState('ALL')

  const actions = ['ALL', ...new Set(state.auditLog.map(l => l.action))]
  const users = ['ALL', ...new Set(state.auditLog.map(l => l.user))]

  const filtered = useMemo(() => state.auditLog.filter(l => {
    if (filterAction !== 'ALL' && l.action !== filterAction) return false
    if (filterUser !== 'ALL' && l.user !== filterUser) return false
    if (search && !l.object_id.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.user.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [state.auditLog, filterAction, filterUser, search])

  const handleExport = () => {
    const csv = ['Timestamp,User,Role,Action,Object Type,Object ID,Old Value,New Value',
      ...filtered.map(l => `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.object_type}","${l.object_id}","${l.old_value || ''}","${l.new_value || ''}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `railopt-audit-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit log exported as CSV')
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={18} className="text-slate-600" /> Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} entries · full system action history</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-7 pr-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-red-400 w-48" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-red-400 max-w-[200px]">
          {actions.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-red-400">
          {users.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Timestamp', 'User', 'Role', 'Action', 'Object', 'ID', 'Old Value', 'New Value'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">{log.user}</td>
                <td className="px-3 py-2 text-slate-500 text-[10px] max-w-[120px] truncate">{log.role}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: (ACTION_COLORS[log.action] || '#64748B') + '15', color: ACTION_COLORS[log.action] || '#64748B' }}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{log.object_type}</td>
                <td className="px-3 py-2 font-mono text-slate-700">{log.object_id}</td>
                <td className="px-3 py-2 text-slate-500 max-w-[120px] truncate">{log.old_value || '—'}</td>
                <td className="px-3 py-2 text-slate-600 max-w-[120px] truncate">{log.new_value || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">No audit log entries match filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
