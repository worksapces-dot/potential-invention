'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PerAutomationStat } from '@/actions/automations/analytics'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'

type Props = {
  stats: PerAutomationStat[]
}

const chartConfig = {
  engagement: {
    label: 'Engagement %',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const AutomationStatsTable = ({ stats }: Props) => {
  const sorted = [...stats].sort(
    (a, b) => b.engagementPercent - a.engagementPercent
  )

  const topChartData = sorted.slice(0, 5).map((item) => ({
    name: item.name || 'Untitled',
    engagement: Number(item.engagementPercent.toFixed(1)),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Per-automation performance
          </h2>
          <p className="text-xs text-text-secondary">
            Spot your best flows and where engagement is dropping off.
          </p>
        </div>
        {sorted.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-text-secondary">
            <span className="text-xs uppercase tracking-wide text-text-secondary/80">
              Top signals
            </span>
            <Badge
              variant="outline"
              className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            >
              High engagement
            </Badge>
            <Badge
              variant="outline"
              className="border-sky-400/40 bg-sky-400/10 text-sky-200"
            >
              Most activity
            </Badge>
          </div>
        )}
      </div>

      {topChartData.length > 0 && (
        <ChartContainer
          config={chartConfig}
          className="w-full max-w-3xl bg-gradient-to-br from-[#141321] via-[#050509] to-[#151520] border border-white/10 rounded-xl px-4 py-6 shadow-lg shadow-black/40"
        >
          <BarChart data={topChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-white/5"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              unit="%"
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="engagement" radius={4} />
          </BarChart>
        </ChartContainer>
      )}

      <div className="rounded-xl border border-white/10 bg-[#050509]/95 overflow-hidden shadow-lg shadow-black/40">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-xs text-text-secondary">
                Automation
              </TableHead>
              <TableHead className="text-xs text-text-secondary">
                Comments replied
              </TableHead>
              <TableHead className="text-xs text-text-secondary">
                DMs sent
              </TableHead>
              <TableHead className="text-xs text-text-secondary">
                Delivered
              </TableHead>
              <TableHead className="text-xs text-text-secondary text-right">
                Engagement %
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-xs text-text-secondary"
                >
                  No automation activity yet. Turn on an automation and start
                  capturing comments and DMs.
                </TableCell>
              </TableRow>
            )}
            {sorted.map((row, index) => {
              const isTop = index === 0
              const engagement = row.engagementPercent
              const clamped = Math.max(0, Math.min(engagement, 100))

              return (
                <TableRow
                  key={row.automationId}
                  className="border-white/5 hover:bg-white/5 transition-colors"
                >
                  <TableCell className="text-sm text-white max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[0.7rem] text-text-secondary">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate">
                          {row.name || 'Untitled automation'}
                        </span>
                        {isTop && (
                          <span className="text-[0.65rem] text-emerald-300">
                            Top performer
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white">
                    {row.commentsReplied}
                  </TableCell>
                  <TableCell className="text-sm text-white">
                    {row.dmsSent}
                  </TableCell>
                  <TableCell className="text-sm text-white">
                    {row.deliveredCount}
                  </TableCell>
                  <TableCell className="text-xs text-right text-white align-middle">
                    <div className="flex flex-col items-end gap-1">
                      <span>{engagement.toFixed(1)}%</span>
                      <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400"
                          style={{ width: `${clamped}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AutomationStatsTable


