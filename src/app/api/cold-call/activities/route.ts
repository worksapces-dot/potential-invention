import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - Fetch activities for a lead
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leadId = req.nextUrl.searchParams.get('leadId')
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify lead ownership
    const lead = await (client as any).coldCallLead.findFirst({
      where: { id: leadId, userId: dbUser.id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const activities = await (client as any).leadActivity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ activities })
  } catch (error: any) {
    console.error('Get activities error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST - Create a new activity
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, type, title, description, metadata } = await req.json()

    if (!leadId || !type || !title) {
      return NextResponse.json({ error: 'Lead ID, type, and title required' }, { status: 400 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify lead ownership
    const lead = await (client as any).coldCallLead.findFirst({
      where: { id: leadId, userId: dbUser.id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const activity = await (client as any).leadActivity.create({
      data: {
        leadId,
        type,
        title,
        description: description || null,
        metadata: metadata || null,
      },
    })

    // Update lastContactedAt if it's a contact activity
    const contactTypes = ['EMAIL_SENT', 'CALL', 'MEETING']
    if (contactTypes.includes(type)) {
      await (client as any).coldCallLead.update({
        where: { id: leadId },
        data: { lastContactedAt: new Date() },
      })
    }

    return NextResponse.json({ activity })
  } catch (error: any) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
