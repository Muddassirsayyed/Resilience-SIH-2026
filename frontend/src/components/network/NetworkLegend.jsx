import React from 'react'
import { statusColors } from '../../data/mockData'

export default function NetworkLegend() {
  return (
    <div className="flex items-center gap-4 px-4 py-1.5 border-t border-railway-border bg-railway-panel/30">
      <span className="text-[10px] text-railway-muted uppercase tracking-wider font-semibold mr-1">Legend:</span>
      {Object.entries(statusColors).map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: val.bg }}
          />
          <span className="text-[10px] text-railway-muted">{val.label}</span>
        </div>
      ))}
    </div>
  )
}
