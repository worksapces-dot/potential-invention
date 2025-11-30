import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!)

const PLATFORM_FEE_PERCENT = 10

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

    const { leadId, setupFee, monthlyFee, clientEmail } = await req.json()

    if (!leadId || !monthlyFee || !clientEmail) {
      return NextResponse.json(
        { error: 'Lead ID, monthly fee, and client email required' },
        { status: 400 }
      )
    }

    // Verify lead belongs to user
    const lead = await client.coldCallLead.findFirst({
      where: { id: leadId, userId: dbUser.id },
      include: { generatedWebsite: true, deal: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.deal) {
      return NextResponse.json(
        { error: 'Deal already exists for this lead' },
        { status: 400 }
      )
    }

    // Calculate fees
    const setupAmount = setupFee || 0
    const setupPlatformFee = Math.round(setupAmount * (PLATFORM_FEE_PERCENT / 100))
    const setupSellerPayout = setupAmount - setupPlatformFee

    const monthlyPlatformFee = Math.round(monthlyFee * (PLATFORM_FEE_PERCENT / 100))
    const monthlySellerPayout = monthlyFee - monthlyPlatformFee

    // Create Stripe Product
    const product = await stripe.products.create({
      name: `Website Hosting - ${lead.businessName}`,
      description: `Monthly website hosting and maintenance for ${lead.businessName}`,
    })

    // Create recurring price
    const recurringPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: monthlyFee,
      currency: 'usd',
      recurring: { interval: 'month' },
    })

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: recurringPrice.id, quantity: 1 },
    ]

    // Add setup fee if provided
    if (setupAmount > 0) {
      const setupPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: setupAmount,
        currency: 'usd',
      })
      lineItems.unshift({ price: setupPrice.id, quantity: 1 })
    }

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: clientEmail,
      line_items: lineItems,
      metadata: {
        leadId: lead.id,
        userId: dbUser.id,
        type: 'cold_call_subscription',
      },
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/payment-success?lead=${lead.id}&subscription=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/preview/${lead.generatedWebsite?.id}`,
    })

    // Create deal record (cast to any for new schema fields)
    const deal = await (client.coldCallDeal as any).create({
      data: {
        leadId: lead.id,
        amount: setupAmount,
        platformFee: setupPlatformFee,
        sellerPayout: setupSellerPayout,
        isRecurring: true,
        recurringAmount: monthlyFee,
        recurringPlatformFee: monthlyPlatformFee,
        recurringSellerPayout: monthlySellerPayout,
        stripePaymentId: session.id,
        stripePriceId: recurringPrice.id,
        stripeProductId: product.id,
        status: 'PENDING',
      },
    })

    // Update lead status
    await client.coldCallLead.update({
      where: { id: lead.id },
      data: { status: 'NEGOTIATING' },
    })

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      checkoutUrl: session.url,
      setupFee: setupAmount,
      monthlyFee,
    })
  } catch (error: any) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
