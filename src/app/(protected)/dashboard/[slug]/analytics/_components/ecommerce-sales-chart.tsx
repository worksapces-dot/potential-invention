'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis, Area } from 'recharts';

const chartConfig = {
    total_dm: {
        label: 'Total DM',
        color: 'hsl(var(--chart-1))',
    },
    auto_replies: {
        label: 'Auto Replies',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        dataKey: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const ChartLabel = ({ label, color }: { label: string; color: string }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
            <span className="text-muted-foreground text-xs font-medium">{label}</span>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                <div className="text-xs font-semibold text-foreground mb-2">{label}</div>
                <div className="space-y-2">
                    {payload.map((entry, index) => {
                        const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
                        return (
                            <div key={index} className="flex items-center justify-between gap-6 text-xs">
                                <ChartLabel label={config?.label} color={entry.color} />
                                <span className="font-bold text-foreground">{entry.value.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

const PERIODS = {
    '7d': { key: '7d', label: 'Last 7 days' },
    '30d': { key: '30d', label: 'Last 30 days' },
} as const;

type PeriodKey = keyof typeof PERIODS;

export type DailyActivityPoint = {
    date: string
    commentsReplied: number
    dmsSent: number
    deliveredCount: number
}

type GlobalStats = {
    totalCommentsReplied: number
    totalDmsSent: number
}

type Props = {
    data: DailyActivityPoint[]
    globalStats: GlobalStats
}

export default function EcommerceSalesChart({ data, globalStats }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('30d');

    const currentData = React.useMemo(() => {
        if (data.length === 0) return [];

        const now = new Date();
        const days = selectedPeriod === '7d' ? 7 : 30;
        const cutoff = new Date(now.setDate(now.getDate() - days));

        return data
            .filter(item => new Date(item.date) >= cutoff)
            .map(item => ({
                period: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total_dm: item.dmsSent,
                auto_replies: item.commentsReplied,
            }));
    }, [data, selectedPeriod]);

    const totalDMs = globalStats.totalDmsSent;
    const totalReplies = globalStats.totalCommentsReplied;

    return (
        <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-transparent to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-6 relative">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-chart-1 via-chart-2 to-chart-1 rounded-full" />
                        Total DM & Auto Replies
                    </CardTitle>
                    <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}>
                        <SelectTrigger className="w-[150px] h-9 bg-background/50 backdrop-blur-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {Object.values(PERIODS).map((period) => (
                                <SelectItem key={period.key} value={period.key}>
                                    {period.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 relative">
                {/* Stats Section */}
                <div className="flex items-center gap-10 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-chart-1 shadow-lg shadow-chart-1/50"></div>
                            <span className="text-sm font-medium text-muted-foreground">Total DM</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {totalDMs.toLocaleString()}
                            </span>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/20">
                                <TrendingUp className="size-3 mr-1" />
                                ~0%
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-chart-2 shadow-lg shadow-chart-2/50"></div>
                            <span className="text-sm font-medium text-muted-foreground">Auto Replies</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {totalReplies.toLocaleString()}
                            </span>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/20">
                                <TrendingUp className="size-3 mr-1" />
                                ~0%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {currentData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <ComposedChart
                            data={currentData}
                            margin={{
                                top: 20,
                                right: 12,
                                left: 12,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorDM" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--border))"
                                strokeOpacity={0.3}
                            />

                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                            />

                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                            />

                            <ChartTooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3', strokeOpacity: 0.3 }}
                            />

                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="total_dm"
                                fill="url(#colorDM)"
                                stroke="none"
                            />

                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="auto_replies"
                                fill="url(#colorReplies)"
                                stroke="none"
                            />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="total_dm"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: 'hsl(var(--chart-1))',
                                    strokeWidth: 2,
                                    stroke: 'hsl(var(--background))',
                                }}
                            />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="auto_replies"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: 'hsl(var(--chart-2))',
                                    strokeWidth: 2,
                                    stroke: 'hsl(var(--background))',
                                }}
                            />
                        </ComposedChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                        No activity data available yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
