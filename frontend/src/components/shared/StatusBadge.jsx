import React from 'react'

const STATUS_STYLES = {
  // Priority
  HIGH: 'bg-red-50 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  LOW: 'bg-slate-100 text-slate-600 border border-slate-200',
  // Block/Approval status
  APPROVED: 'bg-green-50 text-green-700 border border-green-200',
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border border-blue-200',
  UNDER_REVIEW: 'bg-purple-50 text-purple-700 border border-purple-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
  EXECUTED: 'bg-slate-100 text-slate-600 border border-slate-200',
  DRAFT: 'bg-slate-100 text-slate-500 border border-slate-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
  // Task status
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
  SCHEDULED: 'bg-purple-50 text-purple-700 border border-purple-200',
  // Conflict status
  SAFE: 'bg-green-50 text-green-700 border border-green-200',
  WARNING: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFLICT: 'bg-red-50 text-red-700 border border-red-200',
  // Asset condition
  GOOD: 'bg-green-50 text-green-700 border border-green-200',
  FAIR: 'bg-amber-50 text-amber-700 border border-amber-200',
  POOR: 'bg-red-50 text-red-700 border border-red-200',
  CRITICAL: 'bg-red-100 text-red-800 border border-red-300',
  RESTRICTED: 'bg-orange-50 text-orange-700 border border-orange-200',
  MONITORING: 'bg-blue-50 text-blue-700 border border-blue-200',
  OPERATIONAL: 'bg-green-50 text-green-700 border border-green-200',
  BLOCKED: 'bg-red-100 text-red-800 border border-red-300',
  ACCEPTED: 'bg-green-50 text-green-700 border border-green-200',
  DISMISSED: 'bg-slate-100 text-slate-500 border border-slate-200',
  ACTIVE: 'bg-red-50 text-red-700 border border-red-200',
  ACKNOWLEDGED: 'bg-slate-100 text-slate-600 border border-slate-200',
}

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status?.toUpperCase?.()] || 'bg-slate-100 text-slate-500 border border-slate-200'
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${style} ${className}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
