import React from 'react'
import { X, MapPin, Clock, Users, Layers, BarChart3, Eye, FileText, Wrench, Train, AlertTriangle } from 'lucide-react'
import { sectionDetails, sections, trains, statusColors } from '../../data/mockData'

export default function SectionInfoPanel({ selectedId, selectionType, onClose }) {
  if (!selectedId) return null

  // Section selected
  if (selectionType === 'section') {
    const detail = sectionDetails[selectedId]
    const section = sections.find((s) => s.id === selectedId)
    if (!detail || !section) return null

    const statusColor = statusColors[detail.status] || statusColors.available
    const sectionTrains = trains.filter((t) => t.currentSection === selectedId)

    return (
      <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Section {selectedId}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{detail.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1">
            <X size={14} />
          </button>
        </div>

        {/* Status */}
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Status</span>
            <span
              className="status-badge"
              style={{ backgroundColor: statusColor.bg + '22', color: statusColor.bg }}
            >
              {statusColor.label}
            </span>
          </div>

          {/* Block info */}
          {detail.block && (
            <div className="bg-orange-50 border border-orange-100 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Block</span>
              </div>
              <p className="text-sm text-gray-900 font-medium">
                {detail.block.startTime} – {detail.block.endTime}
              </p>
              <div className="mt-2">
                {detail.block.tasks.map((task, i) => (
                  <span key={i} className="text-xs text-gray-500 block mb-1">• {task}</span>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {detail.departments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Departments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.departments.map((dept) => (
                  <span key={dept} className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-medium">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Affected Trains */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Train size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Affected Trains: {detail.affectedTrains}
              </span>
            </div>
            {sectionTrains.length > 0 && (
              <div className="space-y-2">
                {sectionTrains.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-md border border-gray-200">
                    <span className="text-gray-900 font-bold">{t.number}</span>
                    <span className="text-gray-500">{t.type}</span>
                    <span className={`font-semibold ${
                      t.status === 'delayed' ? 'text-orange-500' :
                      t.status === 'halted' ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      {t.status === 'delayed' ? `+${t.delay}m` : t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assets */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Assets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.assets.map((asset) => (
                <span key={asset} className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-medium">
                  {asset}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Availability</span>
            </div>
            <span className={`text-sm font-bold ${
              detail.availability >= 95 ? 'text-green-600' :
              detail.availability >= 85 ? 'text-orange-500' :
              'text-red-600'
            }`}>
              {detail.availability}%
            </span>
          </div>

          {/* Distance & Speed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Distance</span>
              <span className="text-sm text-gray-900 font-bold">{section.distance} km</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Max Speed</span>
              <span className="text-sm text-gray-900 font-bold">{section.maxSpeed} km/h</span>
            </div>
          </div>

          {/* Last Inspection */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Last Inspection</span>
            <span className="text-gray-900 font-bold">{detail.lastInspection}</span>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-200 mt-2">
            <button className="railway-btn-primary w-full flex items-center justify-center gap-2">
              <Eye size={14} /> View Details
            </button>
            {detail.block && (
              <button className="railway-btn w-full flex items-center justify-center gap-2">
                <FileText size={14} /> Review Block
              </button>
            )}
            <button className="railway-btn w-full flex items-center justify-center gap-2">
              <Wrench size={14} /> Open Maintenance
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Train selected
  if (selectionType === 'train') {
    const train = trains.find((t) => t.id === selectedId)
    if (!train) return null

    return (
      <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Train {train.number}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{train.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Type</span>
              <span className="text-sm text-gray-900 font-bold">{train.type}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Direction</span>
              <span className="text-sm text-gray-900 font-bold">
                {train.direction === 'up' ? '↑ Up' : '↓ Down'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Section</span>
              <span className="text-sm text-gray-900 font-bold">{train.currentSection}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Speed</span>
              <span className="text-sm text-gray-900 font-bold">{train.speed} km/h</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">Status</span>
            <span className={`status-badge ${
              train.status === 'delayed' ? 'bg-orange-50 text-orange-600' :
              train.status === 'halted' ? 'bg-red-50 text-red-600' :
              'bg-green-50 text-green-600'
            }`}>
              {train.status === 'delayed' ? `Delayed ${train.delay} min` :
               train.status === 'halted' ? 'Halted' :
               train.status === 'on-time' ? 'On Time' :
               'On Route'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Scheduled</span>
            <span className="text-gray-900 font-bold">{train.scheduledTime}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Route</span>
            <span className="text-gray-900 font-bold">{train.fromStation} → {train.toStation}</span>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-200 mt-2">
            <button className="railway-btn-primary w-full flex items-center justify-center gap-2">
              <Eye size={14} /> View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Station selected
  if (selectionType === 'station') {
    const stationTrains = trains.filter(
      (t) => t.fromStation === selectedId || t.toStation === selectedId
    )
    const stationSections = sections.filter(
      (s) => s.from === selectedId || s.to === selectedId
    )

    return (
      <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              Station {selectedId}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Connected Sections</span>
            <div className="space-y-2 mt-2">
              {stationSections.map((s) => {
                const color = statusColors[s.status] || statusColors.available
                return (
                  <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-md border border-gray-200">
                    <span className="text-gray-900 font-bold">{s.id}</span>
                    <span className="font-semibold" style={{ color: color.bg }}>{color.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {stationTrains.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Trains</span>
              <div className="space-y-2 mt-2">
                {stationTrains.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-md border border-gray-200">
                    <span className="text-gray-900 font-bold">{t.number}</span>
                    <span className="text-gray-500">{t.direction === 'up' ? '→' : '←'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-gray-200 mt-2">
            <button className="railway-btn-primary w-full flex items-center justify-center gap-2">
              <Eye size={14} /> View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
