import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { Resend } from 'resend'
import Stripe from 'stripe'

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

    const { dealId, customMessage } = await req.json()

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      )
    }

    // Initialize Stripe inside the function to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!)

    // Verify deal belongs to user
    const deal = await (client.coldCallDeal as any).findFirst({
      where: { id: dealId },
      include: {
        ColdCallLead: {
          include: { generatedWebsite: true },
        },
      },
    })

    if (!deal || deal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only send payment links for pending deals' },
        { status: 400 }
      )
    }

    const clientEmail = deal.ColdCallLead.email
    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Client email not available' },
        { status: 400 }
      )
    }

    // Get payment link URL from Stripe
    let paymentUrl = ''
    if (deal.stripePaymentId) {
      try {
        const paymentLink = await stripe.paymentLinks.retrieve(deal.stripePaymentId)
        paymentUrl = paymentLink.url
      } catch {
        // If it's a checkout session, create a new payment link
        const product = await stripe.products.create({
          name: `Website for ${deal.ColdCallLead.businessName}`,
        })
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: deal.amount,
          currency: 'usd',
        })
        const newPaymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: price.id, quantity: 1 }],
          metadata: {
            dealId: deal.id,
            leadId: deal.leadId,
          },
        })
        paymentUrl = newPaymentLink.url

        // Update deal with new payment link
        await client.coldCallDeal.update({
          where: { id: deal.id },
          data: { stripePaymentId: newPaymentLink.id },
        })
      }
    }

    if (!paymentUrl) {
      return NextResponse.json(
        { error: 'Could not retrieve payment link' },
        { status: 500 }
      )
    }

    const formatCurrency = (cents: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(cents / 100)

    const previewUrl = deal.ColdCallLead.generatedWebsite
      ? `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/preview/${deal.ColdCallLead.generatedWebsite.id}`
      : null

    // Send email with payment link
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Slide <noreply@slide.so>',
      to: clientEmail,
      subject: `Your Website Invoice - ${deal.ColdCallLead.businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${deal.ColdCallLead.businessName},</h2>
          ${customMessage ? `<p>${customMessage}</p>` : '<p>Your website is ready! Please complete your payment to receive the final files.</p>'}
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">${formatCurrency(deal.amount)}</p>
            <p style="margin: 10px 0 0; color: #666;">One-time payment</p>
            ${deal.isRecurring && deal.recurringAmount ? `<p style="margin: 5px 0 0; color: #666;">+ ${formatCurrency(deal.recurringAmount)}/month hosting</p>` : ''}
          </div>

          ${previewUrl ? `
          <p>Preview your website:</p>
          <p><a href="${previewUrl}" style="color: #0066cc;">${previewUrl}</a></p>
          ` : ''}

          <div style="margin: 30px 0;">
            <a href="${paymentUrl}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
              Pay Now
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Questions? Reply to this email and we'll help you out.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      paymentUrl,
      sentTo: clientEmail,
    })
  } catch (error: any) {
    console.error('Send payment link error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to send payment link' },
      { status: 500 }
    )
  }
}
