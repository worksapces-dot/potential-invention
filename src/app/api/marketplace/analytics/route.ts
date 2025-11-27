import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client as db } from '@/lib/prisma'

type ProductWithPurchases = {
  id: string
  name: string
  purchases: Array<{
    price: number
    createdAt: Date
  }>
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')
    const range = searchParams.get('range') || '30d'

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 })
    }

    // Calculate date range
    const now = new Date()
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get seller's products
    const products = await db.product.findMany({
      where: { 
        sellerId: sellerId,
        createdAt: { gte: startDate }
      },
      include: {
        purchases: {
          where: {
            createdAt: { gte: startDate }
          },
          select: {
            amount: true,
            createdAt: true
          }
        }
      }
    }) as unknown as ProductWithPurchases[]

    // Calculate metrics
    const totalRevenue = products.reduce((sum: number, product: ProductWithPurchases) => 
      sum + product.purchases.reduce((pSum: number, purchase) => pSum + purchase.price, 0), 0
    )

    const totalSales = products.reduce((sum: number, product: ProductWithPurchases) => sum + product.purchases.length, 0)
    
    // Mock view data (you'd track this in a real app)
    const totalViews = products.reduce((sum: number, product: ProductWithPurchases) => sum + (product.id.length * 100), 0)
    
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

    // Top products
    const topProducts = products
      .map((product: ProductWithPurchases) => ({
        id: product.id,
        name: product.name,
        sales: product.purchases.length,
        revenue: product.purchases.reduce((sum: number, p) => sum + p.price, 0),
        views: product.id.length * 100 // Mock data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Revenue chart data (daily for last period)
    const revenueChart: Array<{ date: string; revenue: number; sales: number }> = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayRevenue = products.reduce((sum: number, product: ProductWithPurchases) => 
        sum + product.purchases
          .filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd)
          .reduce((pSum: number, purchase) => pSum + purchase.price, 0), 0
      )
      
      const daySales = products.reduce((sum: number, product: ProductWithPurchases) => 
        sum + product.purchases
          .filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd)
          .length, 0
      )

      revenueChart.push({
        date: dayStart.toISOString(),
        revenue: dayRevenue,
        sales: daySales
      })
    }

    // Mock demographics data
    const demographics = {
      countries: [
        { name: 'United States', count: Math.floor(totalSales * 0.4) },
        { name: 'United Kingdom', count: Math.floor(totalSales * 0.2) },
        { name: 'Canada', count: Math.floor(totalSales * 0.15) },
        { name: 'Australia', count: Math.floor(totalSales * 0.1) },
        { name: 'Germany', count: Math.floor(totalSales * 0.15) }
      ],
      devices: [
        { type: 'desktop', count: Math.floor(totalViews * 0.6) },
        { type: 'mobile', count: Math.floor(totalViews * 0.3) },
        { type: 'tablet', count: Math.floor(totalViews * 0.1) }
      ]
    }

    return NextResponse.json({
      totalRevenue,
      totalSales,
      totalViews,
      conversionRate,
      topProducts,
      revenueChart,
      demographics
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}