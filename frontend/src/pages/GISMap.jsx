import React, { useState } from 'react'
import { Map, MapPin, Filter } from 'lucide-react'
import { DEMO_ASSETS_GIS } from '../data/demoData'
import StatusBadge from '../components/shared/StatusBadge'
import { useNavigate } from 'react-router-dom'

// Indian Railway Zone centers (approximate lat/lng)
const ZONE_CENTERS = {
  CR:   { lat: 19.0760, lng: 72.8777, name: 'Central (CR)' },
  WR:   { lat: 23.0225, lng: 72.5714, name: 'Western (WR)' },
  NR:   { lat: 28.7041, lng: 77.1025, name: 'Northern (NR)' },
  SR:   { lat: 13.0827, lng: 80.2707, name: 'Southern (SR)' },
  ER:   { lat: 22.5726, lng: 88.3639, name: 'Eastern (ER)' },
  SCR:  { lat: 17.3850, lng: 78.4867, name: 'South Central (SCR)' },
  SWR:  { lat: 12.9716, lng: 77.5946, name: 'South Western (SWR)' },
  NFR:  { lat: 26.2006, lng: 92.9376, name: 'Northeast Frontier (NFR)' },
  NCR:  { lat: 25.4358, lng: 81.8463, name: 'North Central (NCR)' },
  ECR:  { lat: 25.5941, lng: 85.1376, name: 'East Central (ECR)' },
  SECR: { lat: 22.0797, lng: 82.1391, name: 'South East Central (SECR)' },
  NWR:  { lat: 26.9124, lng: 75.7873, name: 'North Western (NWR)' },
  WCR:  { lat: 23.1815, lng: 79.9864, name: 'West Central (WCR)' },
  NER:  { lat: 26.7606, lng: 83.3732, name: 'North Eastern (NER)' },
  SER:  { lat: 22.5726, lng: 87.3119, name: 'South Eastern (SER)' },
}

// Map India bounding box roughly: lat 8-37, lng 68-97
const MAP_LAT_MIN = 8, MAP_LAT_MAX = 37
const MAP_LNG_MIN = 68, MAP_LNG_MAX = 97

function latLngToXY(lat, lng, width, height) {
  const x = ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * width
  const y = ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * height
  return { x, y }
}

function AssetDot({ asset, selected, onClick, width, height }) {
  const { x, y } = latLngToXY(asset.lat, asset.lng, width, height)
  const color = asset.risk_score >= 70 ? '#DC2626' : asset.risk_score >= 40 ? '#D97706' : '#16A34A'
  return (
    <g onClick={() => onClick(asset)} className="cursor-pointer" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <circle r={selected ? 9 : 7} fill={color} opacity={0.9} stroke={selected ? '#1E293B' : 'white'} strokeWidth={selected ? 2 : 1.5} />
      {asset.risk_score >= 70 && (
        <circle r={12} fill="none" stroke={color} strokeWidth={1} opacity={0.4}>
          <animate attributeName="r" values="7;14" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  )
}

export default function GISMap() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [filterZone, setFilterZone] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [filterRisk, setFilterRisk] = useState('ALL')

  const filtered = DEMO_ASSETS_GIS.filter(a => {
    if (filterZone !== 'ALL' && a.zone !== filterZone) return false
    if (filterType !== 'ALL' && a.asset_type !== filterType) return false
    if (filterRisk === 'HIGH' && a.risk_score < 70) return false
    if (filterRisk === 'MEDIUM' && (a.risk_score >= 70 || a.risk_score < 40)) return false
    if (filterRisk === 'LOW' && a.risk_score >= 40) return false
    return true
  })

  const types = ['ALL', ...new Set(DEMO_ASSETS_GIS.map(a => a.asset_type))]
  const zones = ['ALL', ...new Set(DEMO_ASSETS_GIS.map(a => a.zone))]

  const W = 520, H = 360

  return (
    <div className="p-4 space-y-3">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><Map size={18} className="text-blue-600" /> GIS Asset Map</h1>
        <p className="text-xs text-slate-500 mt-0.5">Indian Railways infrastructure health map · <span className="text-amber-600">Demo data — not live positions</span></p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded">
        <Filter size={13} className="text-slate-400" />
        {[
          { v: filterZone, set: setFilterZone, opts: zones, label: 'Zone' },
          { v: filterType, set: setFilterType, opts: types, label: 'Type' },
          { v: filterRisk, set: setFilterRisk, opts: ['ALL', 'HIGH', 'MEDIUM', 'LOW'], label: 'Risk' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold">{f.label}:</span>
            <select value={f.v} onChange={e => f.set(e.target.value)}
              className="text-xs border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-red-400">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} assets</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* SVG Map */}
        <div className="col-span-2 bg-slate-800 border border-slate-700 rounded overflow-hidden" style={{ minHeight: 400 }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', background: '#1E293B' }}>
            {/* India rough outline — simplified regions */}
            <rect x="80" y="20" width="380" height="320" rx="4" fill="#243044" stroke="#334155" strokeWidth="0.5" />
            {/* Zone labels */}
            {Object.entries(ZONE_CENTERS).map(([code, z]) => {
              const { x, y } = latLngToXY(z.lat, z.lng, W, H)
              return (
                <text key={code} x={x} y={y - 12} textAnchor="middle" fontSize="6" fill="#475569" fontFamily="monospace">
                  {code}
                </text>
              )
            })}
            {/* Asset dots */}
            {filtered.map(a => (
              <AssetDot key={a.asset_id} asset={a} selected={selected?.asset_id === a.asset_id}
                onClick={setSelected} width={W} height={H} />
            ))}
            {/* Legend */}
            {[['High Risk (≥70)', '#DC2626'], ['Medium Risk (40–69)', '#D97706'], ['Low Risk (<40)', '#16A34A']].map(([l, c], i) => (
              <g key={l} transform={`translate(8, ${20 + i * 16})`}>
                <circle r={5} fill={c} />
                <text x={10} y={4} fontSize="7" fill="#94A3B8">{l}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Asset Detail */}
        <div className="bg-white border border-slate-200 rounded flex flex-col">
          {selected ? (
            <>
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-700">Asset Details</div>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-red-500" />
                  <span className="font-semibold text-slate-800">{selected.asset_id}</span>
                </div>
                {[
                  ['Type', selected.asset_type], ['Location', selected.location],
                  ['Zone', selected.zone], ['Condition', selected.condition],
                  ['Status', selected.status],
                  ['Last Maintenance', selected.last_maintenance],
                  ['Next Maintenance', selected.next_maintenance],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
                <div>
                  <div className="text-slate-500 mb-1">Risk Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${selected.risk_score}%`, background: selected.risk_score >= 70 ? '#DC2626' : selected.risk_score >= 40 ? '#D97706' : '#16A34A' }} />
                    </div>
                    <span className="font-bold text-slate-800">{selected.risk_score}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={selected.condition} />
                  <StatusBadge status={selected.status} />
                </div>
                <button onClick={() => navigate('/maintenance-tasks')}
                  className="w-full py-1.5 text-xs font-semibold rounded text-white mt-2"
                  style={{ background: '#C0392B' }}>
                  View Maintenance Tasks
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs text-center p-4">
              <div>
                <MapPin size={32} className="mx-auto mb-2 text-slate-200" />
                Click an asset dot on the map to view details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
