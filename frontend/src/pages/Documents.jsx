import React from 'react'
import { FileText, Download, Eye } from 'lucide-react'
import { useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'

const DOCS = [
  { id: 'DOC-001', name: 'Block Plan Report — 16 Sep 2024', type: 'Block Plan', zone: 'CR', date: '2024-09-16', status: 'APPROVED', size: '1.2 MB' },
  { id: 'DOC-002', name: 'Maintenance Inspection Report Q3', type: 'Inspection', zone: 'WR', date: '2024-09-15', status: 'APPROVED', size: '3.4 MB' },
  { id: 'DOC-003', name: 'Emergency Event Report — EVT-002', type: 'Incident', zone: 'NFR', date: '2024-09-16', status: 'SUBMITTED', size: '0.8 MB' },
  { id: 'DOC-004', name: 'Weekly Planning Schedule — Wk 38', type: 'Planning', zone: 'ALL', date: '2024-09-15', status: 'APPROVED', size: '2.1 MB' },
  { id: 'DOC-005', name: 'Bridge Inspection Report — BRG-NFR-GHY-002', type: 'Inspection', zone: 'NFR', date: '2024-09-14', status: 'SUBMITTED', size: '5.7 MB' },
  { id: 'DOC-006', name: 'AI Optimization Run Log — 16 Sep 2024', type: 'System Log', zone: 'ALL', date: '2024-09-16', status: 'DRAFT', size: '0.3 MB' },
  { id: 'DOC-007', name: 'Track Maintenance SOP v2.3', type: 'SOP', zone: 'ALL', date: '2024-08-01', status: 'APPROVED', size: '1.8 MB' },
  { id: 'DOC-008', name: 'Annual Safety Audit Report 2024', type: 'Audit', zone: 'ALL', date: '2024-07-31', status: 'APPROVED', size: '12.4 MB' },
]

export default function Documents() {
  const toast = useToast()
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-slate-600" /> Documents</h1>
        <p className="text-xs text-slate-500 mt-0.5">System-generated reports, plans, and operational documents</p>
      </div>
      <div className="bg-white border border-slate-200 rounded overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Document Name', 'Type', 'Zone', 'Date', 'Size', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS.map(doc => (
              <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-800 font-medium">{doc.name}</td>
                <td className="px-3 py-2.5 text-slate-500">{doc.type}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-700">{doc.zone}</td>
                <td className="px-3 py-2.5 text-slate-500">{doc.date}</td>
                <td className="px-3 py-2.5 text-slate-500">{doc.size}</td>
                <td className="px-3 py-2.5"><StatusBadge status={doc.status} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.info('Document preview (Demo — no actual file)')}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
                      <Eye size={10} /> View
                    </button>
                    <button onClick={() => toast.success(`Download started: ${doc.name} (Demo)`)}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
                      <Download size={10} /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
