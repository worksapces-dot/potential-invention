import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const leadData = await req.json()

    // Check if lead already exists for this user
    const existingLead = await client.coldCallLead.findFirst({
      where: {
        userId: dbUser.id,
        businessName: leadData.businessName,
        city: leadData.city,
      },
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead already saved' },
        { status: 400 }
      )
    }

    // Create the lead
    const lead = await client.coldCallLead.create({
      data: {
        businessName: leadData.businessName,
        category: leadData.category,
        address: leadData.address || null,
        city: leadData.city,
        state: leadData.state || null,
        country: leadData.country,
        phone: leadData.phone || null,
        email: leadData.email || null,
        website: leadData.website || null,
        googleMapsUrl: leadData.googleMapsUrl || null,
        rating: leadData.rating || null,
        reviewCount: leadData.reviewCount || null,
        status: 'NEW',
        userId: dbUser.id,
      },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Save lead error:', error)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const leads = await client.coldCallLead.findMany({
      where: {
        userId: dbUser.id,
        ...(status && { status: status as any }),
      },
      include: {
        generatedWebsite: true,
        outreachEmails: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        deal: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to get leads' },
      { status: 500 }
    )
  }
}
