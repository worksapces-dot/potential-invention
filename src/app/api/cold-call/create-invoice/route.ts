import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!)

const PLATFORM_FEE_PERCENT = 10 // 10% platform fee

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

    const { leadId, amount } = await req.json()

    if (!leadId || !amount) {
      return NextResponse.json(
        { error: 'Lead ID and amount required' },
        { status: 400 }
      )
    }

    // Verify lead belongs to user
    const lead = await client.coldCallLead.findFirst({
      where: {
        id: leadId,
        userId: dbUser.id,
      },
      include: {
        generatedWebsite: true,
        deal: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.deal) {
      return NextResponse.json(
        { error: 'Invoice already exists for this lead' },
        { status: 400 }
      )
    }

    // Calculate fees
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100))
    const sellerPayout = amount - platformFee

    // Create Stripe Product and Price first
    const product = await stripe.products.create({
      name: `Website for ${lead.businessName}`,
      description: `Professional website design and development for ${lead.businessName} in ${lead.city}`,
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
    })

    // Create deal record first to get the ID
    const deal = await client.coldCallDeal.create({
      data: {
        leadId: lead.id,
        amount: amount,
        platformFee: platformFee,
        sellerPayout: sellerPayout,
        status: 'PENDING',
      },
    })

    // Create Stripe Payment Link with deal metadata
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        dealId: deal.id,
        leadId: lead.id,
        userId: dbUser.id,
        type: 'cold_call_website',
      },
      payment_intent_data: {
        metadata: {
          dealId: deal.id,
          leadId: lead.id,
          userId: dbUser.id,
          type: 'cold_call_website',
        },
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/payment-success?lead=${lead.id}`,
        },
      },
    })

    // Update deal with payment link ID
    await client.coldCallDeal.update({
      where: { id: deal.id },
      data: { stripePaymentId: paymentLink.id },
    })



    // Update lead status
    await client.coldCallLead.update({
      where: { id: lead.id },
      data: { status: 'NEGOTIATING' },
    })

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      paymentUrl: paymentLink.url,
      amount: amount,
      platformFee: platformFee,
      sellerPayout: sellerPayout,
    })
  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
