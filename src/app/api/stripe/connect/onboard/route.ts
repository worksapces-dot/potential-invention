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

    let accountId = dbUser.stripeConnectId

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: dbUser.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId: dbUser.id,
          clerkId: user.id,
        },
      })

      accountId = account.id

      // Save to database
      await client.user.update({
        where: { id: dbUser.id },
        data: { stripeConnectId: accountId },
      })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${user.id}/cold-call/settings?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${user.id}/cold-call/settings?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
    })
  } catch (error: any) {
    console.error('Stripe Connect onboard error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
