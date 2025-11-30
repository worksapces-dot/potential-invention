import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!)

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

    const { dealId, reason, amount } = await req.json()

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      )
    }

    // Verify deal belongs to user
    const deal = await client.coldCallDeal.findFirst({
      where: { id: dealId },
      include: { ColdCallLead: true },
    })

    if (!deal || deal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const dealAny = deal as any
    
    const status = deal.status as string
    if (status !== 'PAID' && status !== 'ACTIVE_SUBSCRIPTION') {
      return NextResponse.json(
        { error: 'Can only refund paid deals' },
        { status: 400 }
      )
    }

    if (dealAny.refundedAt) {
      return NextResponse.json(
        { error: 'Deal already refunded' },
        { status: 400 }
      )
    }

    const refundAmount = amount || deal.amount

    // Process refund via Stripe if we have a payment ID
    if (deal.stripePaymentId) {
      try {
        // Get the payment intent from the checkout session
        const session = await stripe.checkout.sessions.retrieve(deal.stripePaymentId)
        
        if (session.payment_intent) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            amount: refundAmount,
            reason: 'requested_by_customer',
          })
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError)
        // Continue to update our records even if Stripe fails
        // Admin can handle manually
      }
    }

    // Cancel subscription if recurring
    if (dealAny.isRecurring && dealAny.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(dealAny.stripeSubscriptionId)
      } catch (subError: any) {
        console.error('Cancel subscription error:', subError)
      }
    }

    // Update deal (cast to any for new schema fields)
    await (client.coldCallDeal as any).update({
      where: { id: deal.id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundReason: reason || 'Customer requested refund',
        refundAmount: refundAmount,
      },
    })

    // Update lead status
    await client.coldCallLead.update({
      where: { id: deal.leadId },
      data: { status: 'LOST' },
    })

    return NextResponse.json({
      success: true,
      refundAmount,
    })
  } catch (error: any) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process refund' },
      { status: 500 }
    )
  }
}

// GET - Get refund details for a deal
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
    const dealId = searchParams.get('dealId')

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      )
    }

    const deal = await client.coldCallDeal.findFirst({
      where: { id: dealId },
      include: { ColdCallLead: true },
    })

    if (!deal || deal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const dealData = deal as any
    const dealStatus = deal.status as string
    return NextResponse.json({
      canRefund: dealStatus === 'PAID' || dealStatus === 'ACTIVE_SUBSCRIPTION',
      isRefunded: dealStatus === 'REFUNDED',
      refundedAt: dealData.refundedAt,
      refundReason: dealData.refundReason,
      refundAmount: dealData.refundAmount,
      originalAmount: deal.amount,
    })
  } catch (error: any) {
    console.error('Get refund info error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get refund info' },
      { status: 500 }
    )
  }
}
