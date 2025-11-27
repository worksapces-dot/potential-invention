'use server'

import { onCurrentUser } from '../user'
import { stripe } from '@/lib/stripe'
import { client } from '@/lib/prisma'
import { findSellerProfile, findProduct } from './queries'

type PromotionTier = 'BASIC' | 'STANDARD' | 'PREMIUM'

const PROMOTION_TIERS = {
  BASIC: {
    price: 200, // $2
    views: 500,
    days: 3,
    label: 'Basic Boost',
    description: '500 views over 3 days'
  },
  STANDARD: {
    price: 500, // $5
    views: 1500,
    days: 7,
    label: 'Standard Boost',
    description: '1,500 views over 7 days'
  },
  PREMIUM: {
    price: 1000, // $10
    views: 5000,
    days: 14,
    label: 'Premium Boost',
    description: '5,000 views over 14 days'
  }
}

export const getPromotionTiers = () => {
  return PROMOTION_TIERS
}

export const onCreatePromotionCheckout = async (productId: string, tier: PromotionTier) => {
  const user = await onCurrentUser()

  try {
    // Verify product ownership
    const product = await findProduct(productId)
    if (!product) {
      return { status: 404, message: 'Product not found' }
    }

    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile || product.sellerId !== sellerProfile.id) {
      return { status: 403, message: 'Not authorized' }
    }

    // Check if product already has active promotion
    const activePromotion = await client.promotion.findFirst({
      where: {
        productId,
        status: 'ACTIVE',
        endsAt: { gt: new Date() }
      }
    })

    if (activePromotion) {
      return { status: 400, message: 'Product already has an active promotion' }
    }

    const tierConfig = PROMOTION_TIERS[tier]
    if (!tierConfig) {
      return { status: 400, message: 'Invalid promotion tier' }
    }

    const slug = user.firstName || 'workspace'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierConfig.label} - ${product.name}`,
              description: tierConfig.description,
            },
            unit_amount: tierConfig.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'promotion',
        productId,
        tier,
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell/products/${productId}/edit?promotion=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${slug}/marketplace/sell/products/${productId}/edit?promotion=cancelled`,
    })

    return { status: 200, data: { url: session.url } }
  } catch (error: any) {
    console.error('Error creating promotion checkout:', error)
    return { status: 500, message: error.message || 'Failed to create checkout' }
  }
}

export const onActivatePromotion = async (
  productId: string,
  tier: PromotionTier,
  stripePaymentId: string
) => {
  try {
    const tierConfig = PROMOTION_TIERS[tier]
    if (!tierConfig) {
      return { status: 400, message: 'Invalid tier' }
    }

    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + tierConfig.days)

    const promotion = await client.promotion.create({
      data: {
        productId,
        tier,
        boostViews: tierConfig.views,
        amount: tierConfig.price,
        stripePaymentId,
        status: 'ACTIVE',
        endsAt,
      }
    })

    // Mark product as featured while promotion is active
    await client.product.update({
      where: { id: productId },
      data: { featured: true }
    })

    return { status: 200, data: promotion }
  } catch (error: any) {
    console.error('Error activating promotion:', error)
    return { status: 500, message: error.message }
  }
}

export const onGetProductPromotion = async (productId: string) => {
  try {
    const promotion = await client.promotion.findFirst({
      where: {
        productId,
        status: 'ACTIVE',
        endsAt: { gt: new Date() }
      }
    })

    return { status: 200, data: promotion }
  } catch (error) {
    console.error('Error getting promotion:', error)
    return { status: 500, data: null }
  }
}

export const onGetMyPromotions = async () => {
  const user = await onCurrentUser()

  try {
    const sellerProfile = await findSellerProfile(user.id)
    if (!sellerProfile) {
      return { status: 404, data: [] }
    }

    const promotions = await client.promotion.findMany({
      where: {
        Product: {
          sellerId: sellerProfile.id
        }
      },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            thumbnail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { status: 200, data: promotions }
  } catch (error) {
    console.error('Error getting promotions:', error)
    return { status: 500, data: [] }
  }
}