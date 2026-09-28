import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { stations, sections, trains, statusColors } from '../../data/mockData'

// ============================================================
// SVG-based operational railway schematic
// ============================================================

// Layout constants — schematic coordinates, NOT geographic
const PADDING = 60
const SVG_WIDTH = 1000
const SVG_HEIGHT = 380

// Status color for corridor lines
function getSectionColor(status) {
  const c = statusColors[status]
  return c ? c.bg : '#334155'
}

function getSectionColorDim(status) {
  const map = {
    available: '#22c55e44',
    maintenance: '#f59e0b44',
    critical: '#ef444444',
    movement: '#3b82f644',
    restricted: '#f9731644',
  }
  return map[status] || '#33415544'
}

// Get station position by id
function getStationPos(id) {
  const s = stations.find((st) => st.id === id)
  return s ? { x: s.x, y: s.y } : { x: 0, y: 0 }
}

// ── Station Node ──
function StationNode({ station, isSelected, onClick }) {
  return (
    <g
      className="cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onClick(station.id, 'station') }}
    >
      {/* Outer ring */}
      <circle
        cx={station.x}
        cy={station.y}
        r={isSelected ? 16 : 14}
        fill={isSelected ? '#eff6ff' : '#ffffff'}
        stroke={isSelected ? '#2563eb' : '#94a3b8'}
        strokeWidth={isSelected ? 3 : 2}
      />
      {/* Inner dot */}
      <circle
        cx={station.x}
        cy={station.y}
        r={5}
        fill={isSelected ? '#2563eb' : '#64748b'}
      />
      {/* Station name */}
      <text
        x={station.x}
        y={station.y - 22}
        textAnchor="middle"
        className="fill-gray-900"
        style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}
      >
        {station.name}
      </text>
      {/* Station code */}
      <text
        x={station.x}
        y={station.y + 28}
        textAnchor="middle"
        className="fill-railway-muted"
        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}
      >
        {station.code}
      </text>
    </g>
  )
}

// ── Section Corridor Line ──
function SectionLine({ section, isSelected, onClick }) {
  const from = getStationPos(section.from)
  const to = getStationPos(section.to)
  const color = getSectionColor(section.status)
  const colorDim = getSectionColorDim(section.status)

  // Midpoint for section label
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2

  // Line angle
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI)

  return (
    <g
      className="cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onClick(section.id, 'section') }}
    >
      {/* Corridor background (wide, dimmed) */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={colorDim}
        strokeWidth={isSelected ? 16 : 12}
        strokeLinecap="round"
      />
      {/* Corridor line (main) */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={isSelected ? 4 : 3}
        strokeLinecap="round"
        strokeDasharray={section.status === 'maintenance' ? '8 4' : section.status === 'restricted' ? '4 4' : 'none'}
      />

      {/* Section ID label */}
      <g transform={`translate(${mx}, ${my})`}>
        <rect
          x={-30}
          y={-12}
          width={60}
          height={24}
          rx={12}
          fill={section.status === 'available' ? '#dcfce7' : section.status === 'maintenance' ? '#fef3c7' : '#fee2e2'}
          stroke={color}
          strokeWidth={1}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          style={{ fontSize: '10px', fontWeight: 700, fill: color, letterSpacing: '0.05em' }}
        >
          {section.id}
        </text>
      </g>

      {/* Maintenance block marker */}
      {section.block && (
        <g transform={`translate(${mx}, ${my + 22})`}>
          <rect
            x={-45}
            y={-10}
            width={90}
            height={32}
            rx={4}
            fill={section.status === 'critical' ? '#ef444433' : '#f59e0b33'}
            stroke={section.status === 'critical' ? '#ef4444' : '#f59e0b'}
            strokeWidth={1}
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontWeight: 800,
              fill: section.status === 'critical' ? '#ef4444' : '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            {section.status === 'critical' ? 'CRITICAL BLOCK' : 'MAINT. BLOCK'}
          </text>
          <text
            x={0}
            y={16}
            textAnchor="middle"
            style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}
          >
            {section.block.startTime} – {section.block.endTime}
          </text>
        </g>
      )}
    </g>
  )
}

// ── Train Indicator ──
function TrainIndicator({ train, onClick }) {
  const section = sections.find((s) => s.id === train.currentSection)
  if (!section) return null

  const from = getStationPos(section.from)
  const to = getStationPos(section.to)

  // Position along the section based on progress
  const progress = train.progress || 0.5
  const actualProgress = train.direction === 'down' ? 1 - progress : progress
  const tx = from.x + (to.x - from.x) * actualProgress
  const ty = from.y + (to.y - from.y) * actualProgress

  // Train color based on status
  const trainColor =
    train.status === 'delayed' ? '#f59e0b' :
    train.status === 'halted' ? '#ef4444' :
    train.type === 'Goods' ? '#a78bfa' :
    '#3b82f6'

  const dirArrow = train.direction === 'up' ? '→' : '←'

  return (
    <g
      className="cursor-pointer train-pulse"
      onClick={(e) => { e.stopPropagation(); onClick(train.id, 'train') }}
    >
      {/* Train marker */}
      <rect
        x={tx - 40}
        y={ty - 45}
        width={80}
        height={32}
        rx={6}
        fill={train.status === 'delayed' ? '#fef3c7' : train.status === 'halted' ? '#fee2e2' : '#eff6ff'}
        stroke={trainColor}
        strokeWidth={1.5}
      />
      {/* Train number + direction */}
      <text
        x={tx}
        y={ty - 30}
        textAnchor="middle"
        style={{ fontSize: '10px', fontWeight: 800, fill: trainColor }}
      >
        {train.type === 'Goods' ? 'GOODS' : 'EXP'} {train.number}
      </text>
      <text
        x={tx}
        y={ty - 18}
        textAnchor="middle"
        style={{ fontSize: '10px', fontWeight: 600, fill: train.status === 'delayed' ? '#d97706' : train.status === 'halted' ? '#dc2626' : '#2563eb' }}
      >
        {dirArrow} {train.speed > 0 ? `${train.speed} km/h` : train.status === 'halted' ? 'HALTED' : 'STOPPED'}
      </text>

      {/* Delay badge */}
      {train.status === 'delayed' && (
        <g>
          <rect
            x={tx + 26}
            y={ty - 52}
            width={34}
            height={14}
            rx={3}
            fill="#f59e0b44"
            stroke="#f59e0b"
            strokeWidth={1}
          />
          <text
            x={tx + 43}
            y={ty - 42}
            textAnchor="middle"
            style={{ fontSize: '9px', fontWeight: 700, fill: '#fcd34d' }}
          >
            +{train.delay}m
          </text>
        </g>
      )}

      {/* Halted badge */}
      {train.status === 'halted' && (
        <g>
          <rect
            x={tx + 18}
            y={ty - 35}
            width={30}
            height={10}
            rx={2}
            fill="#ef444433"
            stroke="#ef4444"
            strokeWidth={0.5}
          />
          <text
            x={tx + 33}
            y={ty - 27}
            textAnchor="middle"
            style={{ fontSize: '6px', fontWeight: 600, fill: '#ef4444' }}
          >
            HALT
          </text>
        </g>
      )}

      {/* Position dot on track */}
      <circle
        cx={tx}
        cy={ty}
        r={3.5}
        fill={trainColor}
        stroke="#0f172a"
        strokeWidth={1}
      />
    </g>
  )
}

// ============================================================
// Main Railway Network Map Component
// ============================================================
export default function RailwayNetworkMap({ onSelect, selectedId }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.2, 2.5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.2, 0.5))
  }, [])

  const handleFit = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((z) => Math.min(Math.max(z + delta, 0.5), 2.5))
  }, [])

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.getAttribute('data-bg') === 'true') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  const handleClick = useCallback((id, type) => {
    onSelect && onSelect(id, type)
  }, [onSelect])

  return (
    <div className="relative flex-1 bg-railway-dark overflow-hidden" ref={containerRef}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 bg-railway-panel border border-railway-border rounded flex items-center justify-center text-railway-muted hover:text-railway-text hover:bg-railway-hover transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 bg-railway-panel border border-railway-border rounded flex items-center justify-center text-railway-muted hover:text-railway-text hover:bg-railway-hover transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleFit}
          className="w-7 h-7 bg-railway-panel border border-railway-border rounded flex items-center justify-center text-railway-muted hover:text-railway-text hover:bg-railway-hover transition-colors"
          title="Fit Network"
        >
          <Maximize2 size={14} />
        </button>
        <span className="text-[9px] text-railway-muted text-center mt-0.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* SVG Network */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`-${PADDING} -${PADDING} ${SVG_WIDTH + PADDING * 2} ${SVG_HEIGHT + PADDING * 2}`}
        className="select-none"
        style={{
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        <rect
          data-bg="true"
          x={-PADDING}
          y={-PADDING}
          width={SVG_WIDTH + PADDING * 2}
          height={SVG_HEIGHT + PADDING * 2}
          fill="#0a0f1a"
        />

        {/* Grid pattern for operational feel */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b22" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect
          x={-PADDING}
          y={-PADDING}
          width={SVG_WIDTH + PADDING * 2}
          height={SVG_HEIGHT + PADDING * 2}
          fill="url(#grid)"
        />

        {/* Apply zoom and pan */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Section corridor lines (below stations) */}
          {sections.map((section) => (
            <SectionLine
              key={section.id}
              section={section}
              isSelected={selectedId === section.id}
              onClick={handleClick}
            />
          ))}

          {/* Station nodes (above lines) */}
          {stations.map((station) => (
            <StationNode
              key={station.id}
              station={station}
              isSelected={selectedId === station.id}
              onClick={handleClick}
            />
          ))}

          {/* Train indicators (topmost) */}
          {trains.map((train) => (
            <TrainIndicator
              key={train.id}
              train={train}
              onClick={handleClick}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
