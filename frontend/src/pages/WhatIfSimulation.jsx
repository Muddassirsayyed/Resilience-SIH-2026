import React, { useState } from 'react'
import { FlaskConical, ArrowUp, ArrowDown, Minus, RotateCcw } from 'lucide-react'
import { useToast } from '../store/appStore'

const DEFAULT_PARAMS = {
  duration: 240, blockStart: '22:00', blockEnd: '03:00',
  crewAvailable: true, machineAvailable: true, trainDelayMinutes: 0,
}

function computeResult(params) {
  let conflicts = 2, util = 72
  if (!params.crewAvailable) { conflicts += 1; util -= 15 }
  if (!params.machineAvailable) { conflicts += 2; util -= 20 }
  if (params.duration > 240) { conflicts += 1; util += 10 }
  if (params.trainDelayMinutes > 30) conflicts += 1
  return {
    original: { duration: DEFAULT_PARAMS.duration, conflicts: 2, utilization: 72, affectedTrains: 3 },
    modified: { duration: params.duration, conflicts: Math.max(0, conflicts), utilization: Math.max(0, Math.min(100, util)), affectedTrains: Math.min(3 + (conflicts > 2 ? 1 : 0), 8) },
  }
}

function DiffCell({ orig, modified, suffix = '' }) {
  const diff = modified - orig
  const color = diff > 0 ? '#DC2626' : diff < 0 ? '#16A34A' : '#64748B'
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus
  return (
    <div className="text-center">
      <div className="font-bold text-slate-800">{modified}{suffix}</div>
      {diff !== 0 && (
        <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold" style={{ color }}>
          <Icon size={10} />{Math.abs(diff)}{suffix}
        </div>
      )}
    </div>
  )
}

export default function WhatIfSimulation() {
  const toast = useToast()
  const [params, setParams] = useState({ ...DEFAULT_PARAMS })
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const handleRun = () => {
    setRunning(true)
    setTimeout(() => {
      setResult(computeResult(params))
      setRunning(false)
      toast.success('Simulation complete')
    }, 1200)
  }

  const handleReset = () => {
    setParams({ ...DEFAULT_PARAMS })
    setResult(null)
    toast.info('Simulation reset')
  }

  const P = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800 flex items-center gap-2"><FlaskConical size={18} className="text-blue-500" /> What-If Simulation</h1>
        <p className="text-xs text-slate-500 mt-0.5">Model the impact of parameter changes on block schedule before committing</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Parameters */}
        <div className="bg-white border border-slate-200 rounded p-4 space-y-4">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Simulation Parameters</h2>

          <P label={`Maintenance Duration: ${params.duration} min (${Math.round(params.duration / 60 * 10) / 10}h)`}>
            <input type="range" min={60} max={480} step={30} value={params.duration}
              onChange={e => setParams(p => ({ ...p, duration: Number(e.target.value) }))}
              className="w-full accent-red-600" />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>1h</span><span>8h</span></div>
          </P>

          <div className="grid grid-cols-2 gap-3">
            <P label="Block Start">
              <input type="time" value={params.blockStart} onChange={e => setParams(p => ({ ...p, blockStart: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400" />
            </P>
            <P label="Block End">
              <input type="time" value={params.blockEnd} onChange={e => setParams(p => ({ ...p, blockEnd: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-red-400" />
            </P>
          </div>

          <P label={`Train Delay Buffer: ${params.trainDelayMinutes} min`}>
            <input type="range" min={0} max={120} step={5} value={params.trainDelayMinutes}
              onChange={e => setParams(p => ({ ...p, trainDelayMinutes: Number(e.target.value) }))}
              className="w-full accent-amber-500" />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0 min</span><span>120 min</span></div>
          </P>

          <div className="space-y-2.5">
            {[
              { label: 'Crew Available', key: 'crewAvailable' },
              { label: 'Machine Available', key: 'machineAvailable' },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-700">{label}</span>
                <button
                  onClick={() => setParams(p => ({ ...p, [key]: !p[key] }))}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  style={{ background: params[key] ? '#16A34A' : '#CBD5E1' }}
                >
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: `translateX(${params[key] ? 20 : 3}px)` }} />
                </button>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleRun} disabled={running}
              className="flex-1 py-2 text-xs font-semibold rounded text-white disabled:opacity-60"
              style={{ background: '#C0392B' }}>
              {running ? 'Running...' : 'Run Simulation'}
            </button>
            <button onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-white border border-slate-200 rounded">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Simulation Results — Before vs After</h2>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Parameter', 'Original', 'Modified', 'Change'].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Duration (min)', orig: result.original.duration, mod: result.modified.duration, unit: ' min' },
                      { label: 'Conflicts', orig: result.original.conflicts, mod: result.modified.conflicts },
                      { label: 'Utilization', orig: result.original.utilization, mod: result.modified.utilization, unit: '%' },
                      { label: 'Trains Affected', orig: result.original.affectedTrains, mod: result.modified.affectedTrains },
                    ].map(row => {
                      const diff = row.mod - row.orig
                      const isGood = (row.label === 'Utilization' && diff > 0) || (row.label !== 'Utilization' && diff <= 0)
                      return (
                        <tr key={row.label} className="border-b border-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{row.label}</td>
                          <td className="px-4 py-2.5 text-slate-600">{row.orig}{row.unit || ''}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">{row.mod}{row.unit || ''}</td>
                          <td className="px-4 py-2.5">
                            <span className="flex items-center gap-1 text-xs font-semibold"
                              style={{ color: diff === 0 ? '#64748B' : isGood ? '#16A34A' : '#DC2626' }}>
                              {diff > 0 ? <ArrowUp size={11} /> : diff < 0 ? <ArrowDown size={11} /> : <Minus size={11} />}
                              {diff > 0 ? '+' : ''}{diff}{row.unit || ''}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Impact summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded p-4">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Risk Assessment</h3>
                  <div className="space-y-2 text-xs">
                    {!params.crewAvailable && <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded"><span>⚠</span> Crew unavailable — consider postponing block</div>}
                    {!params.machineAvailable && <div className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded"><span>✗</span> Machine unavailable — block cannot proceed</div>}
                    {params.trainDelayMinutes > 30 && <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded"><span>⚠</span> Train delay {params.trainDelayMinutes} min may cause block overrun</div>}
                    {params.crewAvailable && params.machineAvailable && params.trainDelayMinutes <= 30 && <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded"><span>✓</span> Block can proceed with current parameters</div>}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded p-4">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Recommendation</h3>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    {result.modified.conflicts > result.original.conflicts ? (
                      <div className="text-red-700">More conflicts than original. Consider adjusting time window or reducing scope.</div>
                    ) : (
                      <div className="text-green-700">Modified plan has same or fewer conflicts. Proceed to block planning.</div>
                    )}
                    <div className="text-slate-500">Block utilization: <strong>{result.modified.utilization}%</strong></div>
                    <div className="text-slate-500">Trains affected: <strong>{result.modified.affectedTrains}</strong></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded flex items-center justify-center" style={{ minHeight: 300 }}>
              <div className="text-center text-slate-400">
                <FlaskConical size={40} className="mx-auto mb-3 text-slate-200" />
                <div className="text-sm font-medium">Configure parameters and run simulation</div>
                <div className="text-xs mt-1">Results will appear here</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
