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

    // Get total leads
    const totalLeads = await client.coldCallLead.count({
      where: { userId: dbUser.id },
    })

    // Get emails sent
    const emailsSent = await client.outreachEmail.count({
      where: {
        ColdCallLead: {
          userId: dbUser.id,
        },
        sentAt: {
          not: null,
        },
      },
    })

    // Get deals closed (WON status)
    const dealsClosed = await client.coldCallLead.count({
      where: {
        userId: dbUser.id,
        status: 'WON',
      },
    })

    // Get total revenue (sum of paid deals)
    const paidDeals = await client.coldCallDeal.findMany({
      where: {
        ColdCallLead: {
          userId: dbUser.id,
        },
        status: 'PAID',
      },
      select: {
        sellerPayout: true,
      },
    })

    const revenue = paidDeals.reduce((sum, deal) => sum + deal.sellerPayout, 0)

    return NextResponse.json({
      totalLeads,
      emailsSent,
      dealsClosed,
      revenue, // in cents
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
