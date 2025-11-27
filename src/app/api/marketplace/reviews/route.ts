import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createReview } from '@/actions/marketplace/queries'
import { client } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, rating, comment } = await req.json()

    if (!productId || !rating) {
      return NextResponse.json({ error: 'Product ID and rating required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Get user's database ID
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has purchased this product
    const purchase = await client.purchase.findFirst({
      where: {
        userId: dbUser.id,
        productId,
        status: 'COMPLETED',
      },
    })

    if (!purchase) {
      return NextResponse.json({ error: 'You must purchase this product to review it' }, { status: 403 })
    }

    // Check if user already reviewed
    const existingReview = await client.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: dbUser.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Create review
    const review = await createReview({
      productId,
      userId: dbUser.id,
      rating,
      comment,
    })

    return NextResponse.json({ data: review })
  } catch (error: any) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 })
  }
}
