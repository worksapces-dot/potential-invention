'use client'

import React from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'


type Props = {
  history?: { month: string; followers: number }[]
  currentFollowers?: number
}

const chartConfig = {
  followers: {
    label: 'Followers',
    color: '#8b5cf6',
  },
} satisfies ChartConfig

const FollowersChart = ({ history, currentFollowers }: Props) => {
  const data = history && history.length > 0
    ? history
    : currentFollowers
      ? Array(12).fill(0).map((_, i) => ({
          month: new Date(0, i).toLocaleString('en-US', { month: 'short' }).toUpperCase(),
          followers: currentFollowers
        }))
      : []

  const totalFollowers = currentFollowers ?? (data.at(-1)?.followers ?? 0)
  const last = data.at(-1)
  const prev = data.at(-2)
  const pctChange =
    last && prev
      ? ((last.followers - prev.followers) / Math.max(prev.followers, 1)) * 100
      : 0

  return (
    <Card className="w-full bg-gradient-to-br from-[#141321] via-[#050509] to-[#151520] border border-white/10 shadow-lg shadow-black/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <CardTitle className="text-base font-semibold text-white">
            Followers growth
          </CardTitle>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-secondary">
              Jan 01 - Dec 31, 2024
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {totalFollowers.toLocaleString()}
              </span>
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-none bg-emerald-500/15 text-emerald-300 text-xs px-2 py-0.5 rounded-full"
              >
                <TrendingUp className="h-3 w-3" />
                <span>
                  {pctChange >= 0 ? '+' : ''}
                  {pctChange.toFixed(2)}%
                </span>
              </Badge>
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-white/15 bg-white/5 text-[0.7rem] text-white px-3 py-1 rounded-full"
        >
          12 months
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={chartConfig}
          className="h-[260px] w-full ps-1.5 pe-3 overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
        >
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: 24,
              left: 0,
              bottom: 16,
            }}
          >
            <defs>
              <linearGradient
                id="followersGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartConfig.followers.color}
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.followers.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 12"
              stroke="var(--input)"
              strokeOpacity={1}
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              dy={4}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.65)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              domain={[0, 'dataMax + 1000']}
              tickMargin={12}
              tickCount={6}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.65)' }}
            />
            <ChartTooltip
              cursor={{
                stroke: chartConfig.followers.color,
                strokeWidth: 1,
                strokeDasharray: 'none',
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const value = payload[0].value as number
                return (
                  <div className="rounded-lg bg-zinc-950/95 text-white px-3 py-2 shadow-lg border border-white/10">
                    <div className="text-[0.65rem] text-text-secondary mb-1">
                      Followers
                    </div>
                    <div className="text-sm font-semibold">
                      {value.toLocaleString()}
                    </div>
                  </div>
                )
              }}
            />
            <Area
              type="linear"
              dataKey="followers"
              stroke="transparent"
              fill="url(#followersGradient)"
              strokeWidth={0}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="followers"
              stroke={chartConfig.followers.color}
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: chartConfig.followers.color,
                stroke: '#0b0b0f',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: chartConfig.followers.color,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default FollowersChart




