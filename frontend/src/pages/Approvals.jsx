import React, { useState } from 'react'
import { CheckSquare, Check, X, Eye, ChevronRight } from 'lucide-react'
import { useApp, useToast } from '../store/appStore'
import StatusBadge from '../components/shared/StatusBadge'
import Modal from '../components/shared/Modal'

const PIPELINE_STEPS = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED']

function ApprovalDetail({ apr, onClose }) {
  const related = null
  return (
    <div className="p-4 text-xs space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Approval ID', apr.id], ['Block ID', apr.block_id || 'N/A'],
          ['Task ID', apr.task_id], ['Status', apr.status],
          ['Submitted By', apr.submitted_by], ['Reviewed By', apr.reviewed_by || '—'],
          ['Submitted At', apr.submitted_at ? new Date(apr.submitted_at).toLocaleString('en-IN') : '—'],
          ['Reviewed At', apr.reviewed_at ? new Date(apr.reviewed_at).toLocaleString('en-IN') : '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded p-2">
            <div className="text-[9px] font-semibold text-slate-400 uppercase">{k}</div>
            <div className="font-medium text-slate-800 mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      {apr.comments && <div className="p-2 bg-blue-50 border border-blue-100 rounded text-slate-700"><span className="font-semibold">Comments:</span> {apr.comments}</div>}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-2">Approval Pipeline</h3>
        <div className="flex items-center gap-1">
          {PIPELINE_STEPS.map((step, i) => {
            const stepIdx = PIPELINE_STEPS.indexOf(apr.status)
            const done = i <= stepIdx
            const active = i === stepIdx
            return (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold ${active ? 'ring-2 ring-offset-1' : ''}`}
                  style={{ background: done ? '#16A34A' : '#E2E8F0', color: done ? 'white' : '#94A3B8', ringColor: '#16A34A' }}>
                  {done ? <Check size={10} /> : i + 1}
                </div>
                {i < PIPELINE_STEPS.length - 1 && <div className="flex-1 h-0.5" style={{ background: i < stepIdx ? '#16A34A' : '#E2E8F0' }} />}
              </React.Fragment>
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          {PIPELINE_STEPS.map(s => <span key={s} className="text-[8px] text-slate-400 uppercase">{s.replace('_', ' ')}</span>)}
        </div>
      </div>
      <button onClick={onClose} className="w-full py-1.5 border border-slate-200 rounded text-slate-600 text-xs">Close</button>
    </div>
  )
}

export default function Approvals() {
  const { state, dispatch } = useApp()
  const toast = useToast()
  const [viewApr, setViewApr] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [commentOpen, setCommentOpen] = useState(null)

  const handleAction = (apr, newStatus, comments = '') => {
    dispatch({ type: 'UPDATE_APPROVAL', payload: {
      ...apr, status: newStatus,
      reviewed_by: newStatus !== 'SUBMITTED' ? state.currentUser.name : apr.reviewed_by,
      reviewed_at: newStatus !== 'SUBMITTED' ? new Date().toISOString() : apr.reviewed_at,
      submitted_at: newStatus === 'SUBMITTED' ? new Date().toISOString() : apr.submitted_at,
      comments: comments || apr.comments,
    }})
    toast.success(`Approval ${apr.id} updated to ${newStatus.replace('_', ' ')}`)
    setCommentOpen(null)
    setCommentText('')
  }

  const stats = {
    draft: state.approvals.filter(a => a.status === 'DRAFT').length,
    submitted: state.approvals.filter(a => a.status === 'SUBMITTED').length,
    review: state.approvals.filter(a => a.status === 'UNDER_REVIEW').length,
    approved: state.approvals.filter(a => a.status === 'APPROVED').length,
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><CheckSquare size={18} className="text-green-600" /> Approvals</h1>
        <p className="text-xs text-slate-500 mt-0.5">Block authorization workflow — DRAFT → SUBMITTED → UNDER REVIEW → APPROVED → EXECUTED</p>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-4 gap-3">
        {[['Draft', stats.draft, '#64748B'], ['Submitted', stats.submitted, '#2563EB'], ['Under Review', stats.review, '#7C3AED'], ['Approved', stats.approved, '#16A34A']].map(([l, v, c]) => (
          <div key={l} className="bg-white border border-slate-200 rounded p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Approval ID', 'Block ID', 'Task ID', 'Submitted By', 'Status', 'Submitted At', 'Reviewed By', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase text-[10px] tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.approvals.map(apr => (
              <tr key={apr.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{apr.id}</td>
                <td className="px-3 py-2.5 font-mono text-slate-600">{apr.block_id || '—'}</td>
                <td className="px-3 py-2.5 font-mono text-slate-600">{apr.task_id}</td>
                <td className="px-3 py-2.5 text-slate-700">{apr.submitted_by}</td>
                <td className="px-3 py-2.5"><StatusBadge status={apr.status} /></td>
                <td className="px-3 py-2.5 text-slate-500">{apr.submitted_at ? new Date(apr.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                <td className="px-3 py-2.5 text-slate-500">{apr.reviewed_by || '—'}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewApr(apr)} title="View" className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye size={13} /></button>
                    {apr.status === 'DRAFT' && (
                      <button onClick={() => handleAction(apr, 'SUBMITTED')} className="px-2 py-0.5 text-[10px] font-semibold rounded text-white bg-blue-600 hover:bg-blue-700">SUBMIT</button>
                    )}
                    {(apr.status === 'SUBMITTED' || apr.status === 'UNDER_REVIEW') && (
                      <>
                        <button onClick={() => handleAction(apr, 'APPROVED')} className="px-2 py-0.5 text-[10px] font-semibold rounded text-white bg-green-600 hover:bg-green-700">APPROVE</button>
                        <button onClick={() => setCommentOpen(apr)} className="px-2 py-0.5 text-[10px] font-semibold rounded text-white bg-red-600 hover:bg-red-700">REJECT</button>
                      </>
                    )}
                    {apr.status === 'APPROVED' && (
                      <button onClick={() => handleAction(apr, 'EXECUTED')} className="px-2 py-0.5 text-[10px] font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50">EXECUTED</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!viewApr} onClose={() => setViewApr(null)} title={`Approval: ${viewApr?.id}`} size="md">
        {viewApr && <ApprovalDetail apr={viewApr} onClose={() => setViewApr(null)} />}
      </Modal>

      {/* Reject with comment */}
      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded border border-slate-200 shadow-xl p-5 max-w-md w-full mx-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Reject Approval — {commentOpen.id}</h3>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Reason for rejection (required)..." rows={3}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400 resize-none" />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setCommentOpen(null); setCommentText('') }} className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-700">Cancel</button>
              <button onClick={() => { if (!commentText.trim()) { toast.error('Enter reason'); return }; handleAction(commentOpen, 'REJECTED', commentText) }}
                className="px-3 py-1.5 text-xs font-semibold rounded text-white bg-red-600 hover:bg-red-700">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
