'use client'

import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PerAutomationStat } from '@/actions/automations/analytics'

type Props = {
  stats: PerAutomationStat[]
}

const STORAGE_KEY = 'analytics-goal-total-engagement'

const GoalTracker = ({ stats }: Props) => {
  const current = stats.reduce(
    (sum, stat) => sum + stat.commentsReplied + stat.dmsSent,
    0
  )
  const hasActivity = current > 0

  const [goal, setGoal] = useState<number>(hasActivity ? Math.round(current * 1.2) : 0)
  const [preset, setPreset] = useState<'custom' | '120' | '150' | '200'>('120')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = Number(stored)
      if (!Number.isNaN(parsed) && parsed > 0) {
        setGoal(parsed)
        setPreset('custom')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!goal || goal <= 0) return
    window.localStorage.setItem(STORAGE_KEY, String(goal))
  }, [goal])

  const clampedGoal = goal > 0 ? goal : 0
  const progress =
    hasActivity && clampedGoal > 0 ? Math.min(100, (current / clampedGoal) * 100) : 0
  const remaining = clampedGoal > 0 ? Math.max(0, clampedGoal - current) : 0
  const hit = hasActivity && clampedGoal > 0 && current >= clampedGoal

  return (
    <Card className="w-full bg-[#050509] border border-white/10 shadow-md shadow-black/30">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-white">
            Goal tracker
          </CardTitle>
          <p className="text-xs text-text-secondary">
            Set a total engagement target for your automations.
          </p>
        </div>
        {hit && (
          <Badge
            variant="outline"
            className="border-emerald-400/50 bg-emerald-500/10 text-emerald-200 text-[0.7rem] px-2 py-0.5 rounded-full"
          >
            Goal reached
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] text-text-secondary uppercase tracking-wide">
              Current engagement
            </p>
            <p className="text-2xl font-semibold text-white">
              {current.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[0.7rem] text-text-secondary uppercase tracking-wide">
              Goal
            </p>
            <div className="flex items-center gap-2 justify-end">
              <input
                type="number"
                min={1}
                className="h-8 w-28 rounded-lg border border-white/10 bg-black/40/80 px-2 text-right text-xs text-white outline-none focus:border-emerald-400/70 focus:ring-1 focus:ring-emerald-400/40"
                value={goal > 0 ? goal : ''}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    setGoal(0)
                    setPreset('custom')
                    return
                  }
                  const value = Number(raw)
                  if (Number.isNaN(value) || value <= 0) return
                  setGoal(Math.round(value))
                  setPreset('custom')
                }}
              />
              <span className="text-[0.65rem] text-text-secondary">total</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1">
              <button
                type="button"
                disabled={!hasActivity}
                onClick={() => {
                  if (!hasActivity) return
                  const next = Math.round(current * 1.2)
                  setGoal(next)
                  setPreset('120')
                }}
                className={`rounded-full border px-2 py-0.5 text-[0.65rem] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  preset === '120'
                    ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/15 bg-transparent text-text-secondary hover:border-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                +20%
              </button>
              <button
                type="button"
                disabled={!hasActivity}
                onClick={() => {
                  if (!hasActivity) return
                  const next = Math.round(current * 1.5)
                  setGoal(next)
                  setPreset('150')
                }}
                className={`rounded-full border px-2 py-0.5 text-[0.65rem] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  preset === '150'
                    ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/15 bg-transparent text-text-secondary hover:border-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                +50%
              </button>
              <button
                type="button"
                disabled={!hasActivity}
                onClick={() => {
                  if (!hasActivity) return
                  const next = Math.round(current * 2)
                  setGoal(next)
                  setPreset('200')
                }}
                className={`rounded-full border px-2 py-0.5 text-[0.65rem] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  preset === '200'
                    ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/15 bg-transparent text-text-secondary hover:border-emerald-400/50 hover:text-emerald-200'
                }`}
              >
                2x
              </button>
              <button
                type="button"
                onClick={() => {
                  if (hasActivity) {
                    const base = Math.round(current * 1.2)
                    setGoal(base)
                    setPreset('120')
                  } else {
                    setGoal(0)
                    setPreset('custom')
                  }
                }}
                className="rounded-full border border-white/10 bg-transparent px-2 py-0.5 text-[0.65rem] text-text-secondary/80 hover:border-white/40 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.7rem] text-text-secondary">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {!hasActivity && (
            <p className="text-[0.7rem] text-text-secondary">
              No engagement yet. Once your automations start sending DMs or replies,
              progress toward this goal will appear here.
            </p>
          )}
          {hasActivity && !hit && clampedGoal > 0 && (
            <p className="text-[0.7rem] text-text-secondary">
              {remaining.toLocaleString()} more actions to hit your goal.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default GoalTracker
