import React from 'react'
import { Settings } from 'lucide-react'
import { useToast } from '../store/appStore'

const USERS = [
  { id: 'U-001', name: 'Sr. DOM Bhusawal', role: 'DIVISIONAL OPERATIONS MANAGER', zone: 'CR', division: 'Bhusawal', status: 'ACTIVE' },
  { id: 'U-002', name: 'SSE/BH', role: 'SR. SECTION ENGINEER', zone: 'CR', division: 'Bhusawal', status: 'ACTIVE' },
  { id: 'U-003', name: 'DEN/NFR', role: 'DIVISIONAL ENGINEER', zone: 'NFR', division: 'Katihar', status: 'ACTIVE' },
  { id: 'U-004', name: 'SSE/Vadodara', role: 'SR. SECTION ENGINEER', zone: 'WR', division: 'Vadodara', status: 'ACTIVE' },
  { id: 'U-005', name: 'DOM/Kharagpur', role: 'DIVISIONAL OPERATIONS MANAGER', zone: 'SER', division: 'Kharagpur', status: 'ACTIVE' },
  { id: 'U-006', name: 'System Admin', role: 'SYSTEM ADMIN', zone: 'ALL', division: 'HQ', status: 'ACTIVE' },
]

export default function Administration() {
  const toast = useToast()
  const notice = (label) => toast.info(`${label}: Feature available in production deployment`)
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><Settings size={18} className="text-slate-600" /> Administration</h1>
        <p className="text-xs text-slate-500 mt-0.5">User management, system settings, and configuration</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700">
        ⚠ Administration features are restricted in the prototype demo. All buttons show a production notice.
      </div>

      {/* Users */}
      <div className="bg-white border border-slate-200 rounded">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">User Management</h2>
          <button onClick={() => notice('Add User')} className="px-3 py-1.5 text-xs font-semibold rounded text-white" style={{ background: '#C0392B' }}>+ Add User</button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['User ID', 'Name', 'Role', 'Zone', 'Division', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-mono text-slate-600">{u.id}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{u.name}</td>
                <td className="px-3 py-2.5 text-slate-600 text-[10px]">{u.role}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-700">{u.zone}</td>
                <td className="px-3 py-2.5 text-slate-600">{u.division}</td>
                <td className="px-3 py-2.5"><span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">{u.status}</span></td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <button onClick={() => notice('Edit User')} className="px-2 py-0.5 text-[10px] border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Edit</button>
                    <button onClick={() => notice('Reset Password')} className="px-2 py-0.5 text-[10px] border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Reset PW</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Settings */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Zone & Division Config', desc: 'Manage operational zones and divisions', actions: ['Edit Zones', 'Add Division'] },
          { title: 'Notification Settings', desc: 'Configure alerts and notification rules', actions: ['Edit Rules', 'Test Notification'] },
          { title: 'Integration Config', desc: 'TMS, SMMS, TDMS, COA endpoint settings', actions: ['Test Connection', 'View Logs'] },
          { title: 'AI Engine Settings', desc: 'ML model parameters and thresholds', actions: ['View Model', 'Retrain Model'] },
        ].map(s => (
          <div key={s.title} className="bg-white border border-slate-200 rounded p-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-1">{s.title}</h3>
            <p className="text-[11px] text-slate-500 mb-3">{s.desc}</p>
            <div className="flex gap-2">
              {s.actions.map(a => (
                <button key={a} onClick={() => notice(a)} className="px-2 py-1 text-[10px] font-semibold border border-slate-300 rounded text-slate-600 hover:bg-slate-50">{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
