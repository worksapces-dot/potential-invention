'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { AiAccountScore } from '@/actions/analytics/ai-score'
import { Badge } from '@/components/ui/badge'

const chartConfig = {
  score: {
    label: 'Score',
    color: '#22c55e',
  },
} satisfies ChartConfig

type Props = {
  score: AiAccountScore
}

const AccountScoreCard = ({ score }: Props) => {
  const data = score.dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
  }))

  const overallLabel =
    score.overall >= 80 ? 'Excellent' : score.overall >= 60 ? 'Good' : 'Needs work'

  return (
    <Card className="w-full bg-gradient-to-br from-[#141321] via-[#050509] to-[#151520] border border-white/10 shadow-lg shadow-black/40">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-white">
            AI account score
          </CardTitle>
          <p className="text-xs text-text-secondary max-w-xs">
            AI review of your Instagram automations across growth, engagement and funnel quality.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {Math.round(score.overall)}
            </span>
            <span className="text-xs text-text-secondary">/ 100</span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-400/60 bg-emerald-400/10 text-emerald-300 text-[0.7rem] px-2 py-0.5 rounded-full"
          >
            {overallLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-center">
        <div className="text-xs text-text-secondary space-y-2">
          <p>{score.summary}</p>
          <ul className="space-y-1.5">
            {score.dimensions.map((dim) => (
              <li key={dim.key} className="flex items-start justify-between gap-3">
                <span className="text-[0.7rem] text-text-secondary/90">
                  {dim.label}
                </span>
                <span className="text-[0.7rem] text-white">
                  {Math.round(dim.score)} / 100
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full ps-2 pe-4 [&_.recharts-polar-angle-axis-tick_text]:fill-[rgba(255,255,255,0.7)]"
        >
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(148, 163, 184, 0.35)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={2}
              fill="#22c55e"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default AccountScoreCard
