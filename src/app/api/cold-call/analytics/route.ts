import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

// GET - Fetch analytics for a website
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('websiteId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const analytics = await (client as any).websiteAnalytics.findMany({
      where: {
        websiteId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate totals
    const totals = analytics.reduce(
      (acc: any, day: any) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        bookingClicks: acc.bookingClicks + day.bookingClicks,
        bookingsCreated: acc.bookingsCreated + day.bookingsCreated,
        chatOpens: acc.chatOpens + day.chatOpens,
        chatMessages: acc.chatMessages + day.chatMessages,
        phoneClicks: acc.phoneClicks + day.phoneClicks,
      }),
      {
        pageViews: 0,
        uniqueVisitors: 0,
        bookingClicks: 0,
        bookingsCreated: 0,
        chatOpens: 0,
        chatMessages: 0,
        phoneClicks: 0,
      }
    )

    // Get booking stats
    const bookings = await (client as any).booking.findMany({
      where: {
        websiteId,
        createdAt: { gte: startDate },
      },
    })

    const bookingStats = {
      total: bookings.length,
      pending: bookings.filter((b: any) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b: any) => b.status === 'CANCELLED').length,
    }

    return NextResponse.json({
      analytics,
      totals,
      bookingStats,
      period: { start: startDate, end: new Date(), days },
    })
  } catch (error: any) {
    console.error('Fetch analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

// POST - Track an event (called from preview website)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { websiteId, event } = body

    if (!websiteId || !event) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Upsert today's analytics record
    const updateField: Record<string, any> = {}
    
    switch (event) {
      case 'page_view':
        updateField.pageViews = { increment: 1 }
        break
      case 'unique_visitor':
        updateField.uniqueVisitors = { increment: 1 }
        break
      case 'booking_click':
        updateField.bookingClicks = { increment: 1 }
        break
      case 'booking_created':
        updateField.bookingsCreated = { increment: 1 }
        break
      case 'chat_open':
        updateField.chatOpens = { increment: 1 }
        break
      case 'chat_message':
        updateField.chatMessages = { increment: 1 }
        break
      case 'phone_click':
        updateField.phoneClicks = { increment: 1 }
        break
      default:
        return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
    }

    await (client as any).websiteAnalytics.upsert({
      where: {
        websiteId_date: { websiteId, date: today },
      },
      create: {
        websiteId,
        date: today,
        [event === 'page_view' ? 'pageViews' : 
         event === 'unique_visitor' ? 'uniqueVisitors' :
         event === 'booking_click' ? 'bookingClicks' :
         event === 'booking_created' ? 'bookingsCreated' :
         event === 'chat_open' ? 'chatOpens' :
         event === 'chat_message' ? 'chatMessages' :
         'phoneClicks']: 1,
      },
      update: updateField,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Track event error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
