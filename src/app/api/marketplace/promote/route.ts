import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { onCreatePromotionCheckout } from '@/actions/marketplace/promotions'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, tier } = await req.json()

    if (!productId || !tier) {
      return NextResponse.json({ error: 'Missing productId or tier' }, { status: 400 })
    }

    const validTiers = ['BASIC', 'STANDARD', 'PREMIUM']
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'Invalid promotion tier' }, { status: 400 })
    }

    const result = await onCreatePromotionCheckout(productId, tier)

    if (result.status !== 200) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    return NextResponse.json({ url: result.data?.url })
  } catch (error: any) {
    console.error('Promotion checkout error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create promotion' }, { status: 500 })
  }
}