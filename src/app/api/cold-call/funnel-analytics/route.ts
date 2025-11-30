import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get all leads for this user
    const leads = await client.coldCallLead.findMany({
      where: { userId: dbUser.id },
      include: {
        deal: true,
        outreachEmails: true,
        generatedWebsite: {
          include: {
            analytics: {
              where: { date: { gte: startDate } },
            },
          },
        },
      },
    })

    // Calculate funnel metrics
    const funnel = {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      contacted: leads.filter(l => l.status === 'CONTACTED').length,
      interested: leads.filter(l => l.status === 'INTERESTED').length,
      negotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
      won: leads.filter(l => l.status === 'WON').length,
      lost: leads.filter(l => l.status === 'LOST').length,
    }

    // Calculate conversion rates
    const conversionRates = {
      contactedRate: funnel.total > 0 ? ((funnel.contacted + funnel.interested + funnel.negotiating + funnel.won) / funnel.total * 100) : 0,
      interestedRate: (funnel.contacted + funnel.interested + funnel.negotiating + funnel.won) > 0 
        ? ((funnel.interested + funnel.negotiating + funnel.won) / (funnel.contacted + funnel.interested + funnel.negotiating + funnel.won) * 100) : 0,
      wonRate: funnel.total > 0 ? (funnel.won / funnel.total * 100) : 0,
      overallConversion: funnel.total > 0 ? (funnel.won / funnel.total * 100) : 0,
    }

    // Calculate outreach metrics
    const allEmails = leads.flatMap(l => l.outreachEmails)
    const outreach = {
      totalSent: allEmails.filter(e => e.sentAt).length,
      opened: allEmails.filter(e => e.opened).length,
      clicked: allEmails.filter(e => e.clicked).length,
      replied: allEmails.filter(e => e.replied).length,
      openRate: allEmails.filter(e => e.sentAt).length > 0 
        ? (allEmails.filter(e => e.opened).length / allEmails.filter(e => e.sentAt).length * 100) : 0,
      clickRate: allEmails.filter(e => e.opened).length > 0 
        ? (allEmails.filter(e => e.clicked).length / allEmails.filter(e => e.opened).length * 100) : 0,
      replyRate: allEmails.filter(e => e.sentAt).length > 0 
        ? (allEmails.filter(e => e.replied).length / allEmails.filter(e => e.sentAt).length * 100) : 0,
    }

    // Calculate revenue metrics
    const paidDeals = leads.filter(l => l.deal?.status === 'PAID')
    const revenue = {
      totalDeals: leads.filter(l => l.deal).length,
      paidDeals: paidDeals.length,
      pendingDeals: leads.filter(l => l.deal?.status === 'PENDING').length,
      totalRevenue: paidDeals.reduce((sum, l) => sum + (l.deal?.amount || 0), 0),
      platformFees: paidDeals.reduce((sum, l) => sum + (l.deal?.platformFee || 0), 0),
      netRevenue: paidDeals.reduce((sum, l) => sum + (l.deal?.sellerPayout || 0), 0),
      avgDealSize: paidDeals.length > 0 
        ? paidDeals.reduce((sum, l) => sum + (l.deal?.amount || 0), 0) / paidDeals.length : 0,
    }

    // Calculate ROI metrics
    const websitesGenerated = leads.filter(l => l.generatedWebsite).length
    const estimatedCosts = websitesGenerated * 10 // Estimate $0.10 per AI generation
    const roi = {
      costPerLead: leads.length > 0 ? estimatedCosts / leads.length : 0,
      costPerDeal: paidDeals.length > 0 ? estimatedCosts / paidDeals.length : 0,
      revenuePerLead: leads.length > 0 ? revenue.netRevenue / leads.length : 0,
      roi: estimatedCosts > 0 ? ((revenue.netRevenue - estimatedCosts) / estimatedCosts * 100) : 0,
    }

    // Website analytics aggregation
    const websiteStats = leads.reduce((acc, lead) => {
      if (lead.generatedWebsite?.analytics) {
        lead.generatedWebsite.analytics.forEach(day => {
          acc.pageViews += day.pageViews
          acc.uniqueVisitors += day.uniqueVisitors
          acc.bookingClicks += day.bookingClicks
          acc.bookingsCreated += day.bookingsCreated
          acc.phoneClicks += day.phoneClicks
        })
      }
      return acc
    }, {
      pageViews: 0,
      uniqueVisitors: 0,
      bookingClicks: 0,
      bookingsCreated: 0,
      phoneClicks: 0,
    })

    // Get daily analytics for chart
    const dailyAnalytics = await (client as any).coldCallAnalytics.findMany({
      where: {
        userId: dbUser.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Generate timeline data for charts
    const timeline = generateTimelineData(leads, days)

    return NextResponse.json({
      funnel,
      conversionRates,
      outreach,
      revenue,
      roi,
      websiteStats,
      dailyAnalytics,
      timeline,
      period: { start: startDate, end: new Date(), days },
    })
  } catch (error: any) {
    console.error('Funnel analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function generateTimelineData(leads: any[], days: number) {
  const timeline: any[] = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const dayLeads = leads.filter(l => {
      const created = new Date(l.createdAt)
      return created >= date && created < nextDate
    })
    
    const dayWon = leads.filter(l => {
      if (l.status !== 'WON' || !l.deal?.paidAt) return false
      const paidAt = new Date(l.deal.paidAt)
      return paidAt >= date && paidAt < nextDate
    })
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      leads: dayLeads.length,
      won: dayWon.length,
      revenue: dayWon.reduce((sum, l) => sum + (l.deal?.sellerPayout || 0), 0),
    })
  }
  
  return timeline
}

// POST - Record daily analytics snapshot
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get current lead counts by status
    const leads = await client.coldCallLead.findMany({
      where: { userId: dbUser.id },
      include: { deal: true, outreachEmails: true, generatedWebsite: true },
    })

    const paidDeals = leads.filter(l => l.deal?.status === 'PAID')
    const allEmails = leads.flatMap(l => l.outreachEmails)

    await (client as any).coldCallAnalytics.upsert({
      where: {
        userId_date: { userId: dbUser.id, date: today },
      },
      create: {
        userId: dbUser.id,
        date: today,
        leadsCreated: leads.length,
        leadsContacted: leads.filter(l => l.status === 'CONTACTED').length,
        leadsInterested: leads.filter(l => l.status === 'INTERESTED').length,
        leadsNegotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
        leadsWon: leads.filter(l => l.status === 'WON').length,
        leadsLost: leads.filter(l => l.status === 'LOST').length,
        emailsSent: allEmails.filter(e => e.sentAt).length,
        emailsOpened: allEmails.filter(e => e.opened).length,
        emailsReplied: allEmails.filter(e => e.replied).length,
        websitesGenerated: leads.filter(l => l.generatedWebsite).length,
        dealsPaid: paidDeals.length,
        revenueGenerated: paidDeals.reduce((sum, l) => sum + (l.deal?.amount || 0), 0),
        netRevenue: paidDeals.reduce((sum, l) => sum + (l.deal?.sellerPayout || 0), 0),
      },
      update: {
        leadsCreated: leads.length,
        leadsContacted: leads.filter(l => l.status === 'CONTACTED').length,
        leadsInterested: leads.filter(l => l.status === 'INTERESTED').length,
        leadsNegotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
        leadsWon: leads.filter(l => l.status === 'WON').length,
        leadsLost: leads.filter(l => l.status === 'LOST').length,
        emailsSent: allEmails.filter(e => e.sentAt).length,
        emailsOpened: allEmails.filter(e => e.opened).length,
        emailsReplied: allEmails.filter(e => e.replied).length,
        websitesGenerated: leads.filter(l => l.generatedWebsite).length,
        dealsPaid: paidDeals.length,
        revenueGenerated: paidDeals.reduce((sum, l) => sum + (l.deal?.amount || 0), 0),
        netRevenue: paidDeals.reduce((sum, l) => sum + (l.deal?.sellerPayout || 0), 0),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Record analytics error:', error)
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 })
  }
}
