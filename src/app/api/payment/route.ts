import { stripe } from '@/lib/stripe'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user in database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { status: 404, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has Pro subscription
    if (dbUser.subscription?.plan === 'PRO') {
      return NextResponse.json(
        { status: 400, message: 'Already subscribed to Pro' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session for Pro subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Slide Pro',
              description: 'Unlimited automations, AI responses, priority support, and verified badge',
              images: [`${process.env.NEXT_PUBLIC_HOST_URL}/pro-badge.png`],
            },
            unit_amount: 2900, // $29.00/month
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        clerkId: user.id,
        userId: dbUser.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
    })

    return NextResponse.json({
      status: 200,
      session_url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}