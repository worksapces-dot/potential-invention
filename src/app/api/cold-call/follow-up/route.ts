import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - Get leads with upcoming follow-ups
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

    // Get leads with follow-ups due today or overdue
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const leads = await (client as any).coldCallLead.findMany({
      where: {
        userId: dbUser.id,
        nextFollowUp: { lte: today },
        status: { notIn: ['WON', 'LOST'] },
      },
      orderBy: { nextFollowUp: 'asc' },
      include: {
        generatedWebsite: { select: { id: true } },
      },
    })

    return NextResponse.json({ leads })
  } catch (error: any) {
    console.error('Get follow-ups error:', error)
    return NextResponse.json({ error: 'Failed to fetch follow-ups' }, { status: 500 })
  }
}

// POST - Schedule a follow-up
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, followUpDate, note } = await req.json()

    if (!leadId || !followUpDate) {
      return NextResponse.json({ error: 'Lead ID and follow-up date required' }, { status: 400 })
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

    // Update lead with follow-up date
    await (client as any).coldCallLead.update({
      where: { id: leadId },
      data: { nextFollowUp: new Date(followUpDate) },
    })

    // Create activity for the follow-up
    await (client as any).leadActivity.create({
      data: {
        leadId,
        type: 'FOLLOW_UP_SCHEDULED',
        title: 'Follow-up scheduled',
        description: note || `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}`,
        metadata: { scheduledFor: followUpDate },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Schedule follow-up error:', error)
    return NextResponse.json({ error: 'Failed to schedule follow-up' }, { status: 500 })
  }
}

// DELETE - Clear follow-up
export async function DELETE(req: NextRequest) {
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

    // Verify ownership and clear follow-up
    const lead = await (client as any).coldCallLead.findFirst({
      where: { id: leadId, userId: dbUser.id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    await (client as any).coldCallLead.update({
      where: { id: leadId },
      data: { nextFollowUp: null },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Clear follow-up error:', error)
    return NextResponse.json({ error: 'Failed to clear follow-up' }, { status: 500 })
  }
}
