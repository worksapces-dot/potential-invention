'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Activity, MessageSquare, Send } from 'lucide-react';

const chartConfig = {
    commentsReplied: {
        label: 'Comments Replied',
        color: 'hsl(var(--chart-1))',
    },
    dmsSent: {
        label: 'DMs Sent',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

export type PerAutomationStat = {
    automationId: string
    name: string
    commentsReplied: number
    dmsSent: number
    deliveredCount: number
    engagementPercent: number
}

type Props = {
    stats: PerAutomationStat[]
}

export default function AutomationPerformanceChart({ stats }: Props) {
    const topAutomations = stats
        .map(stat => ({
            name: stat.name.length > 12 ? stat.name.substring(0, 12) + '...' : stat.name,
            commentsReplied: stat.commentsReplied,
            dmsSent: stat.dmsSent,
            deliveredCount: stat.deliveredCount,
            engagementPercent: stat.engagementPercent,
        }))
        .sort((a, b) => (b.commentsReplied + b.dmsSent) - (a.commentsReplied + a.dmsSent))
        .slice(0, 5);

    const totalInteractions = stats.reduce((sum, stat) => sum + stat.commentsReplied + stat.dmsSent, 0);
    const avgEngagement = stats.length > 0
        ? stats.reduce((sum, stat) => sum + stat.engagementPercent, 0) / stats.length
        : 0;

    return (
        <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-6 relative">
                <div className="space-y-1.5">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full" />
                        Automation Performance
                    </CardTitle>
                    <CardDescription className="text-sm">Top performing automations by engagement</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 relative">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                        <div className="size-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold">{totalInteractions}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                        <div className="size-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">Avg Rate</div>
                            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                        <div className="size-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground">Active</div>
                            <div className="text-2xl font-bold">{stats.length}</div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {topAutomations.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                        <BarChart
                            data={topAutomations}
                            margin={{
                                top: 10,
                                right: 12,
                                left: 12,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--border))"
                                strokeOpacity={0.3}
                            />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                content={<ChartTooltipContent className="bg-background/95 backdrop-blur-sm" />}
                            />
                            <Bar
                                dataKey="commentsReplied"
                                fill="url(#barGradient1)"
                                radius={[8, 8, 0, 0]}
                            />
                            <Bar
                                dataKey="dmsSent"
                                fill="url(#barGradient2)"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                        No automation data available yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
