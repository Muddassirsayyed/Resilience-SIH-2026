import React, { useState, useCallback } from 'react'
import { RefreshCw, Activity, Wrench } from 'lucide-react'
import Header from '../components/layout/Header'
import NetworkControls from '../components/network/NetworkControls'
import LiveStatusCounters from '../components/network/LiveStatusCounters'
import RailwayNetworkMap from '../components/network/RailwayNetworkMap'
import SectionInfoPanel from '../components/network/SectionInfoPanel'
import TrainConflictWarning from '../components/network/TrainConflictWarning'
import { conflicts } from '../data/mockData'

export default function LiveRailwayNetwork() {
  // Selection state
  const [selectedId, setSelectedId] = useState(null)
  const [selectionType, setSelectionType] = useState(null) // 'section' | 'train' | 'station'

  // Handle selection from the network map
  const handleSelect = useCallback((id, type) => {
    if (selectedId === id && selectionType === type) {
      // Deselect if same item clicked
      setSelectedId(null)
      setSelectionType(null)
    } else {
      setSelectedId(id)
      setSelectionType(type)
    }
  }, [selectedId, selectionType])

  const handleClosePanel = useCallback(() => {
    setSelectedId(null)
    setSelectionType(null)
  }, [])

  const handleRefresh = useCallback(() => {
    // Visual feedback
    setSelectedId(null)
    setSelectionType(null)
  }, [])

  const handleReviewConflict = useCallback((conflict) => {
    // Open the section panel for the conflict's section
    setSelectedId(conflict.sectionId)
    setSelectionType('section')
  }, [])

  return (
    <div className="flex flex-col h-full bg-slate-50 text-gray-800">
      <Header
        title="Live Railway Network"
        subtitle="Real-time view of train movements, maintenance blocks and affected railway sections."
        rightContent={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm font-semibold text-sm"
          >
            <RefreshCw size={16} />
            Refresh Network
          </button>
        }
      />
      
      <div className="p-6 max-w-[1600px] mx-auto w-full flex-1 overflow-y-auto space-y-6">
        
        {/* Filter controls */}
        <NetworkControls onRefresh={handleRefresh} />

        {/* Status counters */}
        <LiveStatusCounters />

        {/* Main Grid Area */}
        <div className="flex gap-6 items-start">
          
          {/* Left Panel: Conflicts */}
          <div className="w-[320px] flex flex-col gap-4 shrink-0">
            <h3 className="text-sm font-bold text-gray-900 px-1">Active Conflicts</h3>
            {conflicts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {conflicts.map((conflict) => (
                  <TrainConflictWarning
                    key={conflict.id}
                    conflict={conflict}
                    onReview={handleReviewConflict}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm">
                No active conflicts
              </div>
            )}
          </div>

          {/* Center: Map */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-[600px] relative overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 mb-4 px-2">Railway Section View - KNP-04 (Kanpur Division)</h3>
            <div className="flex-1 relative border border-gray-100 rounded-lg bg-white overflow-hidden">
               <RailwayNetworkMap
                  onSelect={handleSelect}
                  selectedId={selectedId}
               />
            </div>
          </div>

          {/* Right Panel: Selection Info */}
          {selectedId && (
            <div className="w-[360px] shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm h-[600px]">
              <SectionInfoPanel
                selectedId={selectedId}
                selectionType={selectionType}
                onClose={handleClosePanel}
              />
            </div>
          )}
        </div>

        {/* Bottom Area: Placeholders to match screenshot */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Activity size={16} className="text-gray-400" /> Recent Activity</h3>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>
            <div className="text-sm text-gray-500 italic py-4 text-center">Activity feed data will be loaded here.</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Wrench size={16} className="text-gray-400" /> Top Maintenance Tasks</h3>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>
            <div className="text-sm text-gray-500 italic py-4 text-center">Maintenance tasks will be loaded here.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
