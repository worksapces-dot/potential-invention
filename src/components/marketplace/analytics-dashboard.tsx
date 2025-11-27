'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  BarChart3
} from 'lucide-react'

type AnalyticsData = {
  totalRevenue: number
  totalSales: number
  totalViews: number
  conversionRate: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
    views: number
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    sales: number
  }>
  demographics: {
    countries: Array<{ name: string; count: number }>
    devices: Array<{ type: string; count: number }>
  }
}

export default function AnalyticsDashboard({ sellerId }: { sellerId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/marketplace/analytics?sellerId=${sellerId}&range=${timeRange}`)
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [sellerId, timeRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#1A1A1D] rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-80 bg-[#1A1A1D] rounded-xl animate-pulse"></div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-[#9D9D9D]">Track your product performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1A1A1D] rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-[#3352CC]' : ''}
              >
                {range}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${(analytics.totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-[#9D9D9D]">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {analytics.totalSales}
            </div>
            <p className="text-xs text-[#9D9D9D]">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {analytics.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-[#9D9D9D]">
              +15.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {analytics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-[#9D9D9D]">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-between gap-2">
            {analytics.revenueChart.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-[#3352CC] to-[#5577FF] rounded-t-sm min-h-[4px]"
                  style={{ 
                    height: `${Math.max((data.revenue / Math.max(...analytics.revenueChart.map(d => d.revenue))) * 250, 4)}px` 
                  }}
                ></div>
                <span className="text-xs text-[#9D9D9D] mt-2 rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-[#1A1A1D] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-[#9D9D9D]">{product.views} views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">${(product.revenue / 100).toFixed(2)}</p>
                    <p className="text-sm text-[#9D9D9D]">{product.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Top Countries</h4>
                <div className="space-y-2">
                  {analytics.demographics.countries.slice(0, 5).map((country) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <span className="text-sm">{country.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#3352CC] to-[#5577FF]"
                            style={{ 
                              width: `${(country.count / Math.max(...analytics.demographics.countries.map(c => c.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-[#9D9D9D] w-8">{country.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Device Types</h4>
                <div className="space-y-2">
                  {analytics.demographics.devices.map((device) => (
                    <div key={device.type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{device.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ 
                              width: `${(device.count / Math.max(...analytics.demographics.devices.map(d => d.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-[#9D9D9D] w-8">{device.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}