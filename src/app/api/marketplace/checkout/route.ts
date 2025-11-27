import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { findProduct } from '@/actions/marketplace/queries'
import { client } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await req.json()

    // Get product
    const product = await findProduct(productId)
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user already purchased this product
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingPurchase = await client.purchase.findFirst({
      where: {
        userId: dbUser.id,
        productId: product.id,
        status: 'COMPLETED',
      },
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
    }

    // Get seller's Stripe account
    const sellerProfile = product.SellerProfile
    if (!sellerProfile?.stripeAccountId) {
      return NextResponse.json({ error: 'Seller not configured' }, { status: 400 })
    }

    // Calculate fees (10% platform fee)
    const platformFee = Math.round(product.price * 0.1)
    const sellerPayout = product.price - platformFee

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description.substring(0, 500),
              images: product.thumbnail ? [product.thumbnail] : [],
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerProfile.stripeAccountId,
        },
        metadata: {
          productId: product.id,
          sellerId: sellerProfile.id,
          buyerId: user.id,
          platformFee: platformFee.toString(),
          sellerPayout: sellerPayout.toString(),
        },
      },
      metadata: {
        productId: product.id,
        sellerId: sellerProfile.id,
        buyerId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${user.firstName || 'workspace'}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard/${user.firstName || 'workspace'}/marketplace/${product.id}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 })
  }
}
