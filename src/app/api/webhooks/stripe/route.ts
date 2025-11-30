import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'
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
        
        // Handle Cold Call deal payment (from payment links)
        if (session.metadata?.type === 'cold_call_website' && session.metadata?.dealId) {
          const { dealId, leadId, userId } = session.metadata
          
          const deal = await (client.coldCallDeal as any).findUnique({
            where: { id: dealId },
            include: { ColdCallLead: true },
          })
          
          if (deal && deal.status === 'PENDING') {
            // Get seller's Stripe Connect account
            const seller = await client.user.findUnique({
              where: { id: deal.ColdCallLead.userId },
              select: { stripeConnectId: true, stripeConnectEnabled: true },
            })
            
            // Transfer seller payout to their Connect account
            if (seller?.stripeConnectId && seller?.stripeConnectEnabled) {
              try {
                await stripe.transfers.create({
                  amount: deal.sellerPayout,
                  currency: 'usd',
                  destination: seller.stripeConnectId,
                  transfer_group: `deal_${dealId}`,
                  metadata: {
                    dealId: deal.id,
                    leadId: deal.leadId,
                  },
                })
                console.log(`Transferred ${deal.sellerPayout} cents to seller ${seller.stripeConnectId}`)
              } catch (transferError: any) {
                console.error('Transfer to seller failed:', transferError.message)
                // Continue - don't fail the whole webhook
              }
            } else {
              console.log(`Seller ${deal.ColdCallLead.userId} has no Connect account - payout pending`)
            }
            
            // Update deal status
            await (client.coldCallDeal as any).update({
              where: { id: dealId },
              data: {
                status: 'PAID',
                paidAt: new Date(),
              },
            })
            
            // Update lead status
            await client.coldCallLead.update({
              where: { id: leadId },
              data: { status: 'WON' },
            })
            
            console.log(`Cold call deal ${dealId} marked as paid via checkout session`)
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Check if this is a cold call deal payment
        if (paymentIntent.metadata?.dealId) {
          const { dealId, leadId } = paymentIntent.metadata
          
          // Get the deal and seller info
          const deal = await (client.coldCallDeal as any).findUnique({
            where: { id: dealId },
            include: {
              ColdCallLead: true,
            },
          })
          
          if (deal) {
            // Get seller's Stripe Connect account
            const seller = await client.user.findUnique({
              where: { id: deal.ColdCallLead.userId },
              select: { stripeConnectId: true, stripeConnectEnabled: true },
            })
            
            // Transfer seller payout to their Connect account
            if (seller?.stripeConnectId && seller?.stripeConnectEnabled) {
              try {
                await stripe.transfers.create({
                  amount: deal.sellerPayout,
                  currency: 'usd',
                  destination: seller.stripeConnectId,
                  metadata: {
                    dealId: deal.id,
                    leadId: deal.leadId,
                  },
                })
                console.log(`Transferred ${deal.sellerPayout} cents to seller ${seller.stripeConnectId}`)
              } catch (transferError: any) {
                console.error('Transfer to seller failed:', transferError.message)
              }
            }
            
            // Update deal status
            await (client.coldCallDeal as any).update({
              where: { id: dealId },
              data: {
                status: 'PAID',
                paidAt: new Date(),
              },
            })
            
            // Update lead status
            await client.coldCallLead.update({
              where: { id: leadId },
              data: { status: 'WON' },
            })
            
            console.log(`Cold call deal ${dealId} marked as paid`)
          }
        }
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