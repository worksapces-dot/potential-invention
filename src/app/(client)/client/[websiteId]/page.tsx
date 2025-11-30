'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Phone,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  CalendarDays,
  BarChart3,
  Zap,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Daily analytics record from API
type DailyAnalytics = {
  id: string
  websiteId: string
  date: string
  pageViews: number
  uniqueVisitors: number
  bookingClicks: number
  bookingsCreated: number
  chatOpens: number
  chatMessages: number
  phoneClicks: number
}

type Analytics = {
  analytics: DailyAnalytics[]
  totals: {
    pageViews: number
    uniqueVisitors: number
    bookingClicks: number
    bookingsCreated: number
    chatOpens: number
    chatMessages: number
    phoneClicks: number
  }
  bookingStats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  period: {
    start: string
    end: string
    days: number
  }
}

// Generate placeholder data for last N days with optional total to distribute
function generatePlaceholderDays(days: number = 7, total: number = 0) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: 0,
    })
  }
  
  // If there's a total value, put it on the most recent day to show activity
  if (total > 0 && data.length > 0) {
    data[data.length - 1].value = total
  }
  
  return data
}

// Generate booking trend data from actual bookings when analytics is empty
function generateBookingTrendFromBookings(bookings: Booking[], days: number = 7) {
  const data = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(now.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: 0,
      fullDate: date.getTime(),
    })
  }
  
  // If there are bookings, put them on today (last day) since we don't have createdAt
  if (bookings.length > 0 && data.length > 0) {
    data[data.length - 1].value = bookings.length
  }
  
  return data.map(({ date, value }) => ({ date, value }))
}

// Extract trend data from real analytics for a specific metric
function extractTrendData(
  analytics: DailyAnalytics[],
  metric: keyof Pick<DailyAnalytics, 'pageViews' | 'uniqueVisitors' | 'bookingClicks' | 'bookingsCreated' | 'chatMessages' | 'phoneClicks'>,
  days: number = 7,
  fallbackTotal: number = 0
) {
  // If no analytics data, return placeholder with fallback total on last day
  if (!analytics || analytics.length === 0) {
    return generatePlaceholderDays(days, fallbackTotal)
  }
  
  // Get last N days of data
  const recentData = analytics.slice(-days)
  
  // If we have less data than requested days, pad with zeros at the start
  if (recentData.length < days) {
    const padding = generatePlaceholderDays(days - recentData.length)
    const realData = recentData.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: day[metric] || 0,
    }))
    return [...padding, ...realData]
  }
  
  return recentData.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: day[metric] || 0,
  }))
}

// Calculate percentage change between first half and second half of data
function calculateChange(data: { value: number }[]): { percent: number; isUp: boolean } {
  if (data.length < 2) return { percent: 0, isUp: true }
  
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  // If there's any data at all, show 100% up (new activity)
  if (total > 0) {
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint).reduce((sum, d) => sum + d.value, 0)
    const secondHalf = data.slice(midpoint).reduce((sum, d) => sum + d.value, 0)
    
    if (firstHalf === 0 && secondHalf > 0) return { percent: 100, isUp: true }
    if (firstHalf === 0) return { percent: 0, isUp: true }
    
    const change = ((secondHalf - firstHalf) / firstHalf) * 100
    return { percent: Math.abs(Math.round(change)), isUp: change >= 0 }
  }
  
  return { percent: 0, isUp: true }
}

type Booking = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  date: string
  startTime: string
  endTime: string
  status: string
  confirmationCode: string
  BookingService: { name: string; duration: number } | null
}

export default function ClientDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const websiteId = params.websiteId as string

  const [isLoading, setIsLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/cold-call/client-auth')
      const data = await response.json()

      if (!data.authenticated || data.websiteId !== websiteId) {
        router.push(`/client/${websiteId}/login`)
        return
      }

      setBusinessName(data.businessName)
      await Promise.all([fetchAnalytics(), fetchBookings()])
    } catch (error) {
      router.push(`/client/${websiteId}/login`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/cold-call/analytics?websiteId=${websiteId}&days=30`)
      const data = await response.json()
      if (response.ok) setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/cold-call/bookings?websiteId=${websiteId}`)
      const data = await response.json()
      if (response.ok) setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings')
    }
  }

  const handleUpdateBooking = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/cold-call/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success('Booking updated')
        // Refresh both bookings and analytics to update stats
        await Promise.all([fetchBookings(), fetchAnalytics()])
      }
    } catch (error) {
      toast.error('Failed to update booking')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/cold-call/client-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push(`/client/${websiteId}/login`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
            <Zap className="h-6 w-6 text-background animate-pulse" fill="currentColor" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const upcomingBookings = bookings
    .filter((b) => ['PENDING', 'CONFIRMED'].includes(b.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
                <Zap className="h-4 w-4 text-background" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{businessName}</h1>
                <p className="text-xs text-muted-foreground">Business Dashboard</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-full hover:bg-muted"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/50 bg-background/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative py-4 px-4 font-medium text-sm transition-colors rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </span>
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`relative py-4 px-4 font-medium text-sm transition-colors rounded-t-lg ${
                activeTab === 'bookings'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Bookings
                {analytics?.bookingStats.pending ? (
                  <Badge className="ml-1 h-5 px-1.5 bg-foreground text-background text-xs">
                    {analytics.bookingStats.pending}
                  </Badge>
                ) : null}
              </span>
              {activeTab === 'bookings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid with Charts */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCardWithChart
                icon={Eye}
                label="Page Views"
                value={analytics.totals.pageViews}
                color="blue"
                chartColor="#3b82f6"
                trendData={extractTrendData(analytics.analytics, 'pageViews', 7, analytics.totals.pageViews)}
              />
              <StatCardWithChart
                icon={Users}
                label="Visitors"
                value={analytics.totals.uniqueVisitors}
                color="green"
                chartColor="#22c55e"
                trendData={extractTrendData(analytics.analytics, 'uniqueVisitors', 7, analytics.totals.uniqueVisitors)}
              />
              <StatCardWithChart
                icon={Calendar}
                label="Bookings"
                value={analytics.bookingStats.total}
                color="purple"
                chartColor="#a855f7"
                trendData={
                  analytics.analytics.length > 0 
                    ? extractTrendData(analytics.analytics, 'bookingsCreated', 7, analytics.bookingStats.total)
                    : generateBookingTrendFromBookings(bookings)
                }
              />
              <StatCardWithChart
                icon={Phone}
                label="Phone Clicks"
                value={analytics.totals.phoneClicks}
                color="orange"
                chartColor="#f97316"
                trendData={extractTrendData(analytics.analytics, 'phoneClicks', 7, analytics.totals.phoneClicks)}
              />
            </div>

            {/* Engagement Card with Chart */}
            <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Engagement Overview</h2>
                    <p className="text-sm text-muted-foreground">Last 30 days performance</p>
                  </div>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-1.5 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Main Chart */}
              <EngagementChart analytics={analytics} bookingsCount={bookings.length} />

              {/* Stats Row */}
              <div className="grid gap-4 sm:grid-cols-3 mt-6 pt-6 border-t border-border">
                <EngagementStat
                  icon={MessageSquare}
                  label="Chat Messages"
                  value={analytics.totals.chatMessages}
                  trendData={extractTrendData(analytics.analytics, 'chatMessages', 7, analytics.totals.chatMessages)}
                />
                <EngagementStat
                  icon={TrendingUp}
                  label="Booking Clicks"
                  value={analytics.totals.bookingClicks}
                  trendData={extractTrendData(analytics.analytics, 'bookingClicks', 7, analytics.totals.bookingClicks)}
                />
                <EngagementStat
                  icon={CheckCircle2}
                  label="Completed"
                  value={analytics.bookingStats.completed}
                  trendData={extractTrendData(analytics.analytics, 'bookingsCreated', 7, analytics.bookingStats.completed)}
                />
              </div>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
                    <p className="text-sm text-muted-foreground">{upcomingBookings.length} scheduled</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border font-semibold text-sm">
                          {booking.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(booking.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            <span className="text-muted-foreground/50">•</span>
                            {booking.startTime}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-3 py-1 ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {booking.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for no upcoming bookings */}
            {upcomingBookings.length === 0 && (
              <div className="rounded-3xl border border-border bg-background p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  When customers schedule appointments, they&apos;ll appear here
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">All Bookings</h2>
                <p className="text-sm text-muted-foreground">{bookings.length} total appointments</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-3xl border border-border bg-background p-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-2">No bookings yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Bookings will appear here when customers schedule appointments through your website
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="rounded-2xl border border-border bg-background p-5 hover:border-border/80 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background font-semibold shrink-0">
                          {booking.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{booking.customerEmail}</p>
                          {booking.customerPhone && (
                            <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          {booking.BookingService && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                                {booking.BookingService.name} • {booking.BookingService.duration} min
                              </span>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-2 font-mono">
                            #{booking.confirmationCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:flex-col sm:items-end">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBooking(booking.id, 'CONFIRMED')}
                              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBooking(booking.id, 'CANCELLED')}
                              className="rounded-full"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Cancel
                            </Button>
                          </>
                        )}

                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBooking(booking.id, 'COMPLETED')}
                            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold text-foreground">Slide</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

// Stat Card with Mini Chart Component
function StatCardWithChart({ 
  icon: Icon, 
  label, 
  value, 
  color,
  chartColor,
  trendData,
}: { 
  icon: React.ElementType
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'orange'
  chartColor: string
  trendData: { date: string; value: number }[]
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  }

  const change = useMemo(() => calculateChange(trendData), [trendData])

  return (
    <div className="group rounded-2xl border border-border bg-background p-5 hover:border-border/80 transition-all hover:-translate-y-0.5 overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          change.isUp ? 'text-green-500' : 'text-red-500'
        }`}>
          {change.isUp ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {change.percent}%
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>

      {/* Mini Area Chart */}
      <div className="h-12 -mx-2 -mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 'auto']} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Engagement Chart Component
function EngagementChart({ analytics, bookingsCount }: { analytics: Analytics; bookingsCount: number }) {
  // Use real daily analytics data, or generate placeholder if empty
  const chartData = useMemo(() => {
    if (!analytics.analytics || analytics.analytics.length === 0) {
      // Generate placeholder data for last 30 days
      const data = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: 0,
          visitors: 0,
          bookings: 0,
        })
      }
      // Add bookings count to today (last day) if there are any
      if (bookingsCount > 0 && data.length > 0) {
        data[data.length - 1].bookings = bookingsCount
        // Also show a visitor for context
        data[data.length - 1].visitors = bookingsCount
      }
      return data
    }
    
    return analytics.analytics.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: day.pageViews,
      visitors: day.uniqueVisitors,
      bookings: day.bookingsCreated,
    }))
  }, [analytics.analytics, bookingsCount])

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradientViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
            tickMargin={8}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickMargin={8}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Page Views"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradientViews)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradientVisitors)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Engagement Stat Component
function EngagementStat({ 
  icon: Icon, 
  label, 
  value,
  trendData,
}: { 
  icon: React.ElementType
  label: string
  value: number
  trendData: { date: string; value: number }[]
}) {
  const change = useMemo(() => calculateChange(trendData), [trendData])

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            change.isUp ? 'text-green-500' : 'text-red-500'
          }`}>
            {change.isUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change.percent}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    CONFIRMED: 'bg-green-500/10 text-green-600 dark:text-green-400',
    COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400',
    PENDING: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }

  return (
    <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.PENDING}`}>
      {status.toLowerCase()}
    </Badge>
  )
}
