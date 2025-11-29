import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!)

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser || !dbUser.stripeConnectId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      })
    }

    // Check Stripe account status
    const account = await stripe.accounts.retrieve(dbUser.stripeConnectId)

    const onboardingComplete = account.details_submitted && account.charges_enabled

    // Update database if status changed
    if (onboardingComplete !== dbUser.stripeOnboardingComplete) {
      await client.user.update({
        where: { id: dbUser.id },
        data: {
          stripeOnboardingComplete: onboardingComplete,
          stripeConnectEnabled: account.charges_enabled || false,
        },
      })
    }

    return NextResponse.json({
      connected: true,
      onboardingComplete: onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })
  } catch (error: any) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to check status' },
      { status: 500 }
    )
  }
}
