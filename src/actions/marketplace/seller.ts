'use server'

import { onCurrentUser } from '../user'
import { stripe } from '@/lib/stripe'
import {
  createSellerProfile,
  findSellerProfile,
  updateSellerProfile,
} from './queries'

export const onBecomeSeller = async (): Promise<any> => {
  const user = await onCurrentUser()

  try {
    // Check if already a seller
    const existing: any = await findSellerProfile(user.id)
    if (existing) {
      return {
        status: 200,
        data: existing,
        message: 'Already a seller',
      }
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // TODO: Make this dynamic based on user location
      email: user.emailAddresses[0].emailAddress,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress,
      },
    })

    // Create seller profile
    const sellerProfile = await createSellerProfile(user.id, account.id)

    // Use firstName as slug or default to 'workspace'
    const slug = user.firstName || 'workspace'

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell`,
      type: 'account_onboarding',
    })

    return {
      status: 201,
      data: {
        sellerProfile,
        onboardingUrl: accountLink.url,
      },
    }
  } catch (error) {
    console.error('Error becoming seller:', error)
    return { status: 500, message: 'Failed to create seller account' }
  }
}

export const onGetSellerProfile = async () => {
  const user = await onCurrentUser()

  try {
    const profile = await findSellerProfile(user.id)
    if (!profile) {
      return { status: 404, message: 'Not a seller' }
    }

    return { status: 200, data: profile }
  } catch (error) {
    console.error('Error getting seller profile:', error)
    return { status: 500 }
  }
}

export const onCheckSellerOnboarding = async () => {
  const user = await onCurrentUser()

  try {
    const profile = await findSellerProfile(user.id)
    if (!profile || !profile.stripeAccountId) {
      return { status: 404, message: 'Not a seller' }
    }

    // Check Stripe account status
    const account = await stripe.accounts.retrieve(profile.stripeAccountId)

    const isComplete = account.details_submitted && account.charges_enabled

    // Update profile if onboarding is complete
    if (isComplete && !profile.onboardingComplete) {
      await updateSellerProfile(user.id, { onboardingComplete: true })
      
      // Revalidate the page to show updated status
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/dashboard/[slug]/marketplace/sell')
    }

    return {
      status: 200,
      data: {
        onboardingComplete: isComplete,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      },
    }
  } catch (error) {
    console.error('Error checking onboarding:', error)
    return { status: 500 }
  }
}

export const onCreateOnboardingLink = async () => {
  const user = await onCurrentUser()

  try {
    const profile = await findSellerProfile(user.id)
    if (!profile || !profile.stripeAccountId) {
      return { status: 404, message: 'Not a seller' }
    }

    // Use firstName as slug or default to 'workspace'
    const slug = user.firstName || 'workspace'

    const accountLink = await stripe.accountLinks.create({
      account: profile.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell`,
      type: 'account_onboarding',
    })

    return { status: 200, data: { url: accountLink.url } }
  } catch (error) {
    console.error('Error creating onboarding link:', error)
    return { status: 500 }
  }
}

export const onCreateLoginLink = async () => {
  const user = await onCurrentUser()

  try {
    const profile = await findSellerProfile(user.id)
    if (!profile || !profile.stripeAccountId) {
      return { status: 404, message: 'Not a seller' }
    }

    const loginLink = await stripe.accounts.createLoginLink(
      profile.stripeAccountId
    )

    return { status: 200, data: { url: loginLink.url } }
  } catch (error) {
    console.error('Error creating login link:', error)
    return { status: 500 }
  }
}

export const onGetSellerRevenueData = async () => {
  const user = await onCurrentUser()

  try {
    const profile = await findSellerProfile(user.id)
    if (!profile) {
      return { status: 404, data: [] }
    }

    const { getSellerRevenueData } = await import('./queries')
    const revenueData = await getSellerRevenueData(profile.id)

    return { status: 200, data: revenueData }
  } catch (error) {
    console.error('Error getting revenue data:', error)
    return { status: 500, data: [] }
  }
}
