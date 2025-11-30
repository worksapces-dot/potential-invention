'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  DollarSign,
  Target,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
  MousePointer,
  Phone,
  Calendar,
  Percent,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

type AnalyticsData = {
  funnel: {
    total: number
    new: number
    contacted: number
    interested: number
    negotiating: number
    won: number
    lost: number
  }
  conversionRates: {
    contactedRate: number
    interestedRate: number
    wonRate: number
    overallConversion: number
  }
  outreach: {
    totalSent: number
    opened: number
    clicked: number
    replied: number
    openRate: number
    clickRate: number
    replyRate: number
  }
  revenue: {
    totalDeals: number
    paidDeals: number
    pendingDeals: number
    totalRevenue: number
    platformFees: number
    netRevenue: number
    avgDealSize: number
  }
  roi: {
    costPerLead: number
    costPerDeal: number
    revenuePerLead: number
    roi: number
  }
  websiteStats: {
    pageViews: number
    uniqueVisitors: number
    bookingClicks: number
    bookingsCreated: number
    phoneClicks: number
  }
  timeline: Array<{
    date: string
    leads: number
    won: number
    revenue: number
  }>
}

const FUNNEL_COLORS = {
  new: '#3b82f6',
  contacted: '#8b5cf6',
  interested: '#f59e0b',
  negotiating: '#ec4899',
  won: '#22c55e',
  lost: '#ef4444',
}

export default function ColdCallAnalyticsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cold-call/funnel-analytics?days=${period}`)
      const result = await response.json()
      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
            <Zap className="h-6 w-6 text-background animate-pulse" fill="currentColor" />
          </div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    )
  }

  const funnelData = [
    { name: 'New', value: data.funnel.new, color: FUNNEL_COLORS.new },
    { name: 'Contacted', value: data.funnel.contacted, color: FUNNEL_COLORS.contacted },
    { name: 'Interested', value: data.funnel.interested, color: FUNNEL_COLORS.interested },
    { name: 'Negotiating', value: data.funnel.negotiating, color: FUNNEL_COLORS.negotiating },
    { name: 'Won', value: data.funnel.won, color: FUNNEL_COLORS.won },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${slug}/cold-call`}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your conversion funnel and ROI</p>
          </div>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Leads"
          value={data.funnel.total.toString()}
          subtitle={`${data.funnel.won} won`}
          trend={data.conversionRates.wonRate}
          trendLabel="win rate"
        />
        <MetricCard
          icon={Mail}
          label="Emails Sent"
          value={data.outreach.totalSent.toString()}
          subtitle={`${data.outreach.replied} replies`}
          trend={data.outreach.replyRate}
          trendLabel="reply rate"
        />
        <MetricCard
          icon={DollarSign}
          label="Net Revenue"
          value={formatCurrency(data.revenue.netRevenue)}
          subtitle={`${data.revenue.paidDeals} deals`}
          trend={data.roi.roi}
          trendLabel="ROI"
          highlight
        />
        <MetricCard
          icon={Target}
          label="Avg Deal Size"
          value={formatCurrency(data.revenue.avgDealSize)}
          subtitle={formatCurrency(data.roi.revenuePerLead) + '/lead'}
          trend={data.conversionRates.overallConversion}
          trendLabel="conversion"
        />
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Conversion Funnel</h2>
              <p className="text-sm text-muted-foreground">Lead progression through stages</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-500">{formatPercent(data.conversionRates.overallConversion)}</p>
            <p className="text-xs text-muted-foreground">Overall conversion</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-3">
          {funnelData.map((stage, index) => {
            const percentage = data.funnel.total > 0 ? (stage.value / data.funnel.total * 100) : 0
            const prevStage = index > 0 ? funnelData[index - 1] : null
            const dropoff = prevStage && prevStage.value > 0 
              ? ((prevStage.value - stage.value) / prevStage.value * 100) 
              : 0

            return (
              <div key={stage.name} className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{stage.name}</div>
                  <div className="flex-1 relative">
                    <div className="h-10 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 2)}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <p className="font-semibold">{stage.value}</p>
                    <p className="text-xs text-muted-foreground">{formatPercent(percentage)}</p>
                  </div>
                  {index > 0 && dropoff > 0 && (
                    <div className="w-20 text-right">
                      <p className="text-xs text-red-500 flex items-center justify-end gap-1">
                        <TrendingDown className="h-3 w-3" />
                        -{formatPercent(dropoff)}
                      </p>
                    </div>
                  )}
                </div>
                {index < funnelData.length - 1 && (
                  <div className="ml-12 pl-4 border-l-2 border-dashed border-muted h-3" />
                )}
              </div>
            )
          })}
          
          {/* Lost leads */}
          {data.funnel.lost > 0 && (
            <div className="flex items-center gap-4 pt-2 border-t border-border mt-4">
              <div className="w-24 text-sm font-medium text-red-500">Lost</div>
              <div className="flex-1 relative">
                <div className="h-10 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-red-500/20"
                    style={{
                      width: `${Math.max((data.funnel.lost / data.funnel.total * 100), 2)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <p className="font-semibold text-red-500">{data.funnel.lost}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(data.funnel.total > 0 ? data.funnel.lost / data.funnel.total * 100 : 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Revenue Over Time</h2>
              <p className="text-sm text-muted-foreground">Daily revenue trend</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
                  className="text-xs"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="text-sm font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                          <p className="text-sm text-green-500">Revenue: {formatCurrency(payload[0].value as number)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leads Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Lead Activity</h2>
              <p className="text-sm text-muted-foreground">New leads vs deals won</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="text-sm font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                          <p className="text-sm text-blue-500">New Leads: {payload[0].value}</p>
                          <p className="text-sm text-green-500">Won: {payload[1]?.value || 0}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Outreach Performance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Email Performance</h2>
          </div>
          <div className="space-y-4">
            <StatRow label="Emails Sent" value={data.outreach.totalSent} />
            <StatRow label="Opened" value={data.outreach.opened} percent={data.outreach.openRate} />
            <StatRow label="Clicked" value={data.outreach.clicked} percent={data.outreach.clickRate} />
            <StatRow label="Replied" value={data.outreach.replied} percent={data.outreach.replyRate} highlight />
          </div>
        </Card>

        {/* Website Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Website Engagement</h2>
          </div>
          <div className="space-y-4">
            <StatRow label="Page Views" value={data.websiteStats.pageViews} icon={Globe} />
            <StatRow label="Unique Visitors" value={data.websiteStats.uniqueVisitors} icon={Users} />
            <StatRow label="Booking Clicks" value={data.websiteStats.bookingClicks} icon={MousePointer} />
            <StatRow label="Phone Clicks" value={data.websiteStats.phoneClicks} icon={Phone} highlight />
          </div>
        </Card>

        {/* ROI Metrics */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Percent className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">ROI Metrics</h2>
          </div>
          <div className="space-y-4">
            <StatRow label="Cost per Lead" value={formatCurrency(data.roi.costPerLead)} />
            <StatRow label="Cost per Deal" value={formatCurrency(data.roi.costPerDeal)} />
            <StatRow label="Revenue per Lead" value={formatCurrency(data.roi.revenuePerLead)} />
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Return on Investment</span>
                <span className={`text-xl font-bold ${data.roi.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.roi.roi >= 0 ? '+' : ''}{formatPercent(data.roi.roi)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: string
  subtitle: string
  trend: number
  trendLabel: string
  highlight?: boolean
}) {
  return (
    <Card className={`p-5 ${highlight ? 'ring-1 ring-green-500/20' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          highlight ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1 text-xs">
          {trend >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-green-500' : ''}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground/70">{subtitle}</p>
    </Card>
  )
}

// Stat Row Component
function StatRow({
  label,
  value,
  percent,
  icon: Icon,
  highlight,
}: {
  label: string
  value: number | string
  percent?: number
  icon?: React.ElementType
  highlight?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'pt-4 border-t border-border' : ''}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${highlight ? 'text-green-500' : ''}`}>{value}</span>
        {percent !== undefined && (
          <span className="text-xs text-muted-foreground">({percent.toFixed(1)}%)</span>
        )}
      </div>
    </div>
  )
}
