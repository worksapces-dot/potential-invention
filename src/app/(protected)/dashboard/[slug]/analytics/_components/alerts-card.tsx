'use client'

import { useEffect, useState } from 'react'
import type { PerAutomationStat } from '@/actions/automations/analytics'
import { STORAGE_DROP, STORAGE_HIGH } from './alerts-toggle'
import { AlertTriangle, TrendingUp } from 'lucide-react'

type Props = {
  dropPct: number
  prev7Avg: number
  lastTotal: number
  highPerformers: PerAutomationStat[]
}

const AlertsCard = ({ dropPct, prev7Avg, lastTotal, highPerformers }: Props) => {
  const [dropEnabled, setDropEnabled] = useState(true)
  const [highEnabled, setHighEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const load = () => {
      const d = window.localStorage.getItem(STORAGE_DROP)
      const h = window.localStorage.getItem(STORAGE_HIGH)
      if (d !== null) setDropEnabled(d === '1')
      if (h !== null) setHighEnabled(h === '1')
    }
    load()

    const handleStorage = () => load()
    window.addEventListener('analytics-alerts-changed', handleStorage)
    return () => window.removeEventListener('analytics-alerts-changed', handleStorage)
  }, [])

  if (!mounted) return null

  // Logic for "Alert on big drop"
  // Trigger if yesterday < avg and drop >= 40%
  const showDropAlert = dropEnabled && dropPct >= 40 && lastTotal < prev7Avg

  // Logic for "Highlight >10% automations"
  const showHighAlert = highEnabled && highPerformers.length > 0

  if (!showDropAlert && !showHighAlert) return null

  const top = highPerformers[0]

  return (
    <div className="w-full grid gap-4 lg:grid-cols-2">
      {showDropAlert && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-200">Engagement alert</p>
            <p className="text-xs text-amber-200/80">
              Daily activity dropped <strong>{dropPct.toFixed(0)}%</strong> vs your 7‑day average yesterday ({lastTotal} vs {Math.round(prev7Avg)}).
            </p>
          </div>
        </div>
      )}

      {showHighAlert && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-emerald-200">Top performance</p>
            <p className="text-xs text-emerald-200/80">
              {highPerformers.length} automation{highPerformers.length > 1 ? 's' : ''} are beating 10% engagement. Top: <strong>{top.name || 'Untitled'}</strong> at {top.engagementPercent.toFixed(1)}%.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertsCard
