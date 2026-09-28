import React from 'react'
import { AlertTriangle, Hash, MapPin, Clock, Train, ArrowRight } from 'lucide-react'

export default function TrainConflictWarning({ conflict, onReview }) {
  if (!conflict) return null

  return (
    <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
        <AlertTriangle size={20} className="text-red-600" />
        <h3 className="font-bold text-red-600">Train Conflict Detected</h3>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Train Alert Box */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-sm">
            <AlertTriangle size={16} />
            Train {conflict.trainNumber} ({conflict.trainType})
          </div>
          <p className="text-sm text-gray-700 pl-6 leading-relaxed">
            {conflict.impact || "is scheduled to enter the section during the maintenance block."}
          </p>
        </div>

        {/* Affected Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash size={16} className="text-gray-400" />
            <span className="font-bold text-gray-900 text-sm">Affected Section</span>
          </div>
          <div className="pl-6 space-y-2">
            <div className="font-bold text-gray-900">{conflict.sectionId}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400" />
              Tundla Jn — Mathura Jn
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="text-gray-400" />
              {conflict.blockStartTime} – {conflict.blockEndTime}
            </div>
            <div className="inline-block px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full mt-1">
              High Severity
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Train size={16} className="text-gray-400" />
            <span className="font-bold text-gray-900 text-sm">Recommended Actions</span>
          </div>
          <div className="pl-6 text-sm text-gray-700 space-y-2">
            <p>1. Reroute train {conflict.trainNumber} via alternative corridor</p>
            <p>2. Adjust train timing (delay/advance)</p>
            <p>3. Split maintenance block (if feasible)</p>
            <p>4. Controller approval required</p>
          </div>
        </div>

        {/* Maintenance Block Details Summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span className="font-bold text-gray-900 text-sm">Maintenance Block Details</span>
          </div>
          <div className="pl-6 grid grid-cols-[100px_1fr] gap-y-3 text-sm">
            <span className="text-gray-500">Tasks</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Track</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Signal</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">OHE</span>
            </div>
            <span className="text-gray-500">Block Time</span>
            <span className="text-gray-900 font-medium">{conflict.blockStartTime} – {conflict.blockEndTime} (5 hrs)</span>
            
            <span className="text-gray-500">Corridor</span>
            <span className="text-gray-900 font-medium">{conflict.sectionId}</span>
            
            <span className="text-gray-500">Reason</span>
            <span className="text-gray-900 font-medium">Bundled maintenance (max asset access)</span>
          </div>
        </div>
      </div>

      <div className="p-5 mt-auto">
        <button
          onClick={() => onReview && onReview(conflict)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          View Full Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
