import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

// Note: In production, use Stripe webhooks instead of this endpoint
export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    // Find the deal
    const deal = await client.coldCallDeal.findFirst({
      where: { leadId },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Update deal status
    await client.coldCallDeal.update({
      where: { id: deal.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    // Update lead status
    await client.coldCallLead.update({
      where: { id: leadId },
      data: { status: 'WON' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark paid error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to mark as paid' },
      { status: 500 }
    )
  }
}
