import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - List proposals for user's deals
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

    const proposals = await (client as any).coldCallProposal.findMany({
      where: {
        ColdCallDeal: {
          ColdCallLead: { userId: dbUser.id },
        },
      },
      include: {
        ColdCallDeal: {
          include: {
            ColdCallLead: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ proposals })
  } catch (error: any) {
    console.error('Get proposals error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get proposals' },
      { status: 500 }
    )
  }
}

// POST - Create a new proposal
export async function POST(req: NextRequest) {
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

    const {
      dealId,
      title,
      description,
      scope,
      timeline,
      paymentTerms,
      revisions,
      clientName,
      clientEmail,
      clientPhone,
      expiresInDays,
    } = await req.json()

    if (!dealId || !title || !description) {
      return NextResponse.json(
        { error: 'Deal ID, title, and description required' },
        { status: 400 }
      )
    }

    // Verify deal belongs to user
    const deal = await client.coldCallDeal.findFirst({
      where: { id: dealId },
      include: {
        ColdCallLead: true,
        proposal: true,
      },
    })

    if (!deal || deal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.proposal) {
      return NextResponse.json(
        { error: 'Proposal already exists for this deal' },
        { status: 400 }
      )
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const proposal = await (client as any).coldCallProposal.create({
      data: {
        dealId,
        title,
        description,
        scope: scope || [],
        timeline,
        paymentTerms,
        revisions: revisions || 2,
        clientName: clientName || deal.ColdCallLead.businessName,
        clientEmail: clientEmail || deal.ColdCallLead.email,
        clientPhone: clientPhone || deal.ColdCallLead.phone,
        expiresAt,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({
      success: true,
      proposal,
      viewUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/proposal/${proposal.accessToken}`,
    })
  } catch (error: any) {
    console.error('Create proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create proposal' },
      { status: 500 }
    )
  }
}
