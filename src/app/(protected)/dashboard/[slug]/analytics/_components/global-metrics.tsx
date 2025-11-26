'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CountingNumber } from '@/components/ui/counting-number'
import { Badge } from '@/components/ui/badge'

type Props = {
  stats: {
    totalCommentsReplied: number
    totalDmsSent: number
  }
}

const GlobalMetrics = ({ stats }: Props) => {
  const total = stats.totalCommentsReplied + stats.totalDmsSent
  const commentsShare = total > 0 ? (stats.totalCommentsReplied / total) * 100 : 0
  const dmsShare = total > 0 ? (stats.totalDmsSent / total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-gradient-to-br from-[#141321] via-[#070711] to-[#151520] border border-white/10 shadow-lg shadow-black/40 transition-transform hover:-translate-y-[1px] hover:shadow-black/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-white text-sm">
              Total comments replied
            </CardTitle>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-[0.65rem] uppercase tracking-wide text-white"
            >
              Replies
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white leading-tight">
                <CountingNumber to={stats.totalCommentsReplied} />
              </span>
              <span className="text-[0.7rem] text-text-secondary">
                Last 30 days across all automations.
              </span>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between text-[0.65rem] text-text-secondary mb-1">
              <span>Share of total engagement</span>
              <span>{commentsShare.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#16a34a]"
                style={{ width: `${commentsShare}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#141321] via-[#070711] to-[#151520] border border-white/10 shadow-lg shadow-black/40 transition-transform hover:-translate-y-[1px] hover:shadow-black/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-white text-sm">
              Total DMs sent
            </CardTitle>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-[0.65rem] uppercase tracking-wide text-white"
            >
              DMs
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white leading-tight">
                <CountingNumber to={stats.totalDmsSent} />
              </span>
              <span className="text-[0.7rem] text-text-secondary">
                Conversations started by your automations.
              </span>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between text-[0.65rem] text-text-secondary mb-1">
              <span>Share of total engagement</span>
              <span>{dmsShare.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#6366f1]"
                style={{ width: `${dmsShare}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GlobalMetrics


