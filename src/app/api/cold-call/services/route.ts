import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - Fetch services for a website
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    const services = await (client as any).bookingService.findMany({
      where: { websiteId, active: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error('Fetch services error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST - Create a new service (authenticated)
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { websiteId, name, description, duration, price } = body

    if (!websiteId || !name || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ownership
    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: true },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const service = await (client as any).bookingService.create({
      data: {
        websiteId,
        name,
        description,
        duration,
        price: price || 0,
      },
    })

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
