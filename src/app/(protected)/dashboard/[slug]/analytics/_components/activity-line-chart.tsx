'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import type { DailyActivityPoint } from '@/actions/automations/analytics'

type Props = {
  data: DailyActivityPoint[]
}

const chartConfig = {
  engagement: {
    label: 'Engagement',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const formatLabel = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short' })
}

const ActivityLineChart = ({ data }: Props) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        month: formatLabel(d.date),
        engagement: d.dmsSent + d.commentsReplied,
      })),
    [data]
  )

  const last = chartData.at(-1)
  const prev = chartData.at(-2)
  const change =
    last && prev
      ? ((last.engagement - prev.engagement) / Math.max(prev.engagement, 1)) *
        100
      : 0

  const firstLabel = chartData[0]?.month
  const lastLabel = chartData.at(-1)?.month

  return (
    <Card className="w-full bg-gradient-to-br from-[#141321] via-[#070711] to-[#151520] border border-white/10 shadow-lg shadow-black/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm text-white">
            Engagement over time
            <Badge
              variant="outline"
              className="ml-1 flex items-center gap-1 border-none bg-emerald-500/15 text-emerald-300 text-[0.7rem] px-2 py-0.5 rounded-full"
            >
              <TrendingUp className="h-3 w-3" />
              <span>
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary">
            {firstLabel && lastLabel
              ? `${firstLabel} - ${lastLabel}`
              : 'DMs sent + comment replies for your automations.'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full ps-1.5 pe-3 overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 8,
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} className="stroke-white/10" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.65)' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="engagement"
              type="linear"
              stroke="var(--color-engagement)"
              strokeWidth={2.2}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ActivityLineChart

