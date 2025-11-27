'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Activity } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Area } from 'recharts';
import { DailyActivityPoint } from './ecommerce-sales-chart';

const chartConfig = {
    engagement_rate: {
        label: 'Engagement Rate',
        color: 'hsl(var(--chart-4))',
    },
} satisfies ChartConfig;

const PERIODS = {
    '5D': { key: '5D', label: '5D' },
    '2W': { key: '2W', label: '2W' },
    '1M': { key: '1M', label: '1M' },
} as const;

type PeriodKey = keyof typeof PERIODS;

type Props = {
    data: DailyActivityPoint[]
}

export default function RevenuePerformanceChart({ data }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('5D');

    const currentData = React.useMemo(() => {
        if (data.length === 0) return [];

        const now = new Date();
        let days = 5;
        if (selectedPeriod === '2W') days = 14;
        if (selectedPeriod === '1M') days = 30;

        const cutoff = new Date(now.setDate(now.getDate() - days));

        return data
            .filter(item => new Date(item.date) >= cutoff)
            .map(item => {
                const interactions = item.commentsReplied + item.dmsSent;
                const rate = item.deliveredCount > 0 ? (interactions / item.deliveredCount) * 100 : 0;
                return {
                    period: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    engagement_rate: parseFloat(rate.toFixed(1)),
                };
            });
    }, [data, selectedPeriod]);

    const avgEngagement = currentData.length > 0
        ? currentData.reduce((sum, item) => sum + item.engagement_rate, 0) / currentData.length
        : 0;

    return (
        <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-6 relative">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                        Engagement Rate
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-9 bg-background/50 backdrop-blur-sm">Export</Button>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-6 relative">
                {/* Stats Section */}
                <div className="flex items-center gap-5 p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
                    <div className="size-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            AVG ENGAGEMENT RATE
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {avgEngagement.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Toggle Group */}
                <ToggleGroup
                    type="single"
                    value={selectedPeriod}
                    onValueChange={(value) => value && setSelectedPeriod(value as PeriodKey)}
                    className="w-full justify-start gap-2"
                >
                    {Object.values(PERIODS).map((period) => (
                        <ToggleGroupItem
                            key={period.key}
                            value={period.key}
                            className="flex-1 h-10 data-[state=on]:bg-gradient-to-r data-[state=on]:from-violet-500 data-[state=on]:to-purple-500 data-[state=on]:text-white font-medium data-[state=on]:shadow-lg data-[state=on]:shadow-violet-500/20"
                        >
                            {period.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                {/* Chart */}
                {currentData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[180px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={currentData}
                            margin={{
                                top: 10,
                                right: 12,
                                left: 12,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
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
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickMargin={10}
                                tickFormatter={(value) => `${value}%`}
                            />

                            <ChartTooltip
                                cursor={{
                                    stroke: 'hsl(var(--chart-4))',
                                    strokeWidth: 2,
                                    strokeDasharray: '3 3',
                                    strokeOpacity: 0.5,
                                }}
                                content={<ChartTooltipContent indicator="line" nameKey="engagement_rate" hideLabel className="bg-background/95 backdrop-blur-sm" />}
                            />

                            <Area
                                dataKey="engagement_rate"
                                type="monotone"
                                fill="url(#colorEngagement)"
                                stroke="none"
                            />

                            <Line
                                dataKey="engagement_rate"
                                type="monotone"
                                stroke="hsl(var(--chart-4))"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: 'hsl(var(--chart-4))',
                                    strokeWidth: 2,
                                    stroke: 'hsl(var(--background))',
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                        No engagement data available yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
