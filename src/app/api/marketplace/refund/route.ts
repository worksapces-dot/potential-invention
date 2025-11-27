import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { findPurchase, updatePurchaseStatus } from '@/actions/marketplace/queries'
import { client } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchaseId, reason } = await req.json()

    if (!purchaseId || !reason) {
      return NextResponse.json({ error: 'Purchase ID and reason required' }, { status: 400 })
    }

    // Get purchase
    const purchase = await findPurchase(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Verify ownership
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser || purchase.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Check if refundable
    if (new Date() > new Date(purchase.refundableUntil)) {
      return NextResponse.json({ error: 'Refund period has expired' }, { status: 400 })
    }

    if (purchase.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Purchase cannot be refunded' }, { status: 400 })
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: purchase.stripePaymentId,
      reason: 'requested_by_customer',
      metadata: {
        purchaseId: purchase.id,
        reason: reason,
        userId: user.id,
      },
    })

    // Update purchase status
    await updatePurchaseStatus(purchase.id, 'REFUNDED')

    return NextResponse.json({ 
      success: true, 
      refundId: refund.id,
      message: 'Refund processed successfully' 
    })
  } catch (error: any) {
    console.error('Refund error:', error)
    
    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ error: 'Payment cannot be refunded' }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 500 })
  }
}