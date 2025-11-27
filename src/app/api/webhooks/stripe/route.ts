import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { onActivatePromotion } from '@/actions/marketplace/promotions'
import { client } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Handle Pro subscription payment
        if (session.mode === 'subscription' && session.metadata?.clerkId) {
          const { clerkId, userId } = session.metadata
          
          // Update user subscription to PRO
          await client.subscription.upsert({
            where: { userId },
            update: {
              plan: 'PRO',
              customerId: session.customer as string,
              updatedAt: new Date()
            },
            create: {
              userId,
              plan: 'PRO',
              customerId: session.customer as string
            }
          })
          
          console.log(`Pro subscription activated for user ${clerkId}`)
        }
        
        // Handle promotion payment
        if (session.metadata?.type === 'promotion') {
          const { productId, tier } = session.metadata
          
          if (productId && tier) {
            await onActivatePromotion(
              productId,
              tier as 'BASIC' | 'STANDARD' | 'PREMIUM',
              session.payment_intent as string
            )
            console.log(`Promotion activated for product ${productId}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Find and downgrade user
        const userSubscription = await client.subscription.findUnique({
          where: { customerId }
        })
        
        if (userSubscription) {
          await client.subscription.update({
            where: { customerId },
            data: {
              plan: 'FREE',
              updatedAt: new Date()
            }
          })
          console.log(`Subscription cancelled for customer ${customerId}`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        // Handle other payment successes if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}