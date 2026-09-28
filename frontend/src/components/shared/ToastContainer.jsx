import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../store/appStore'

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-500 shrink-0" />,
  error: <AlertCircle size={16} className="text-red-500 shrink-0" />,
  info: <Info size={16} className="text-blue-500 shrink-0" />,
}

export default function ToastContainer() {
  const { state, dispatch } = useApp()
  if (!state.toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {state.toasts.map(t => (
        <div key={t.id} className="flex items-start gap-2.5 bg-white border border-slate-200 rounded shadow-lg px-4 py-3 min-w-[260px] max-w-sm text-sm text-slate-800">
          {ICONS[t.type] || ICONS.info}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })} className="text-slate-400 hover:text-slate-700">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
