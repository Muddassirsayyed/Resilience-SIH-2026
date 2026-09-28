import React from 'react'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { alerts as mockAlerts } from '../../data/mockData'

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400',
  },
}

export default function LiveAlerts() {
  return (
    <div className="flex flex-col gap-1.5 p-2 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-railway-muted uppercase tracking-wider">
          Live Alerts
        </span>
        <span className="text-[10px] text-railway-muted">{mockAlerts.length} active</span>
      </div>

      {mockAlerts.map((alert) => {
        const config = severityConfig[alert.severity] || severityConfig.info
        const Icon = config.icon
        return (
          <div
            key={alert.id}
            className={`${config.bg} border ${config.border} rounded p-2 flex items-start gap-2`}
          >
            <Icon size={12} className={`${config.text} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`status-badge ${config.badge}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-[11px] text-railway-text mt-0.5 truncate">
                {alert.message}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-railway-muted">{alert.location}</span>
                <span className="text-[10px] text-railway-border">•</span>
                <span className="text-[10px] text-railway-muted">{alert.time}</span>
              </div>
              {alert.detail && (
                <span className={`text-[10px] ${config.text} mt-0.5 block`}>{alert.detail}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
