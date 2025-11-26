'use client'

import { useTransition, useState } from 'react'
import { sendWeeklyAnalyticsReport } from '@/actions/report/send-weekly-report'

const SendReportButton = () => {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleClick = () => {
    setStatus('idle')
    startTransition(async () => {
      try {
        const res = await sendWeeklyAnalyticsReport()
        if (res.ok) setStatus('success')
        else setStatus('error')
      } catch {
        setStatus('error')
      }
    })
  }

  const label =
    status === 'success'
      ? 'Report sent'
      : status === 'error'
      ? 'Try again'
      : 'Send report'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`relative inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed
      bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.55)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] hover:-translate-y-[1px]`}
    >
      <span
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-white/30 via-transparent to-white/10 opacity-0 blur-xl transition-opacity ${
          isPending ? 'opacity-70 animate-pulse' : ''
        }`}
      />
      <span className="relative flex items-center gap-1.5">
        {isPending && (
          <span className="h-3 w-3 rounded-full border-2 border-black/60 border-t-transparent animate-spin" />
        )}
        <span>{label}</span>
      </span>
    </button>
  )
}

export default SendReportButton
