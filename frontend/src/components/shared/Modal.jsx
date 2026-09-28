import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60" onClick={onClose}>
      <div
        className={`bg-white rounded border border-slate-200 shadow-2xl w-full mx-4 ${sizes[size] || sizes.md} flex flex-col max-h-[90vh]`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
