'use client'

import { useEffect, useState } from 'react'

export const STORAGE_DROP = 'analytics-alert-drop-enabled'
export const STORAGE_HIGH = 'analytics-alert-high-enabled'

const AlertsToggle = () => {
  const [dropEnabled, setDropEnabled] = useState(true)
  const [highEnabled, setHighEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const d = window.localStorage.getItem(STORAGE_DROP)
    const h = window.localStorage.getItem(STORAGE_HIGH)
    if (d !== null) setDropEnabled(d === '1')
    if (h !== null) setHighEnabled(h === '1')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_DROP, dropEnabled ? '1' : '0')
    window.localStorage.setItem(STORAGE_HIGH, highEnabled ? '1' : '0')
    
    // Dispatch a custom event so the AlertsCard can listen
    window.dispatchEvent(new Event('analytics-alerts-changed'))
  }, [dropEnabled, highEnabled])

  return (
    <div className="flex flex-col items-end gap-1.5 mt-1">
      <label className="flex items-center gap-1.5 cursor-pointer group">
        <div className={`w-3 h-3 rounded border transition-colors flex items-center justify-center ${dropEnabled ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
          {dropEnabled && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-[1px]" />}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={dropEnabled}
          onChange={(e) => setDropEnabled(e.target.checked)}
        />
        <span className="text-[0.65rem] text-text-secondary group-hover:text-white transition-colors">Alert on drop</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer group">
        <div className={`w-3 h-3 rounded border transition-colors flex items-center justify-center ${highEnabled ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
          {highEnabled && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-[1px]" />}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={highEnabled}
          onChange={(e) => setHighEnabled(e.target.checked)}
        />
        <span className="text-[0.65rem] text-text-secondary group-hover:text-white transition-colors">High performers</span>
      </label>
    </div>
  )
}

export default AlertsToggle
