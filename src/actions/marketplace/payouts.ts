'use server'

import { onCurrentUser } from '../user'
import { stripe } from '@/lib/stripe'
import { findSellerProfile } from './queries'

export const onGetSellerPayouts = async () => {
  const user = await onCurrentUser()

  try {
    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile?.stripeAccountId) {
      return { status: 404, data: [] }
    }

    // Get payouts from Stripe
    const payouts = await stripe.payouts.list(
      { limit: 20 },
      { stripeAccount: sellerProfile.stripeAccountId }
    )

    return { status: 200, data: payouts.data }
  } catch (error) {
    console.error('Error getting payouts:', error)
    return { status: 500, data: [] }
  }
}