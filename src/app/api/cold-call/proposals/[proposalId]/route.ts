import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - Get proposal by ID or access token
export async function GET(
  req: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params
    const isAccessToken = proposalId.length > 30 // UUIDs are 36 chars

    const proposal = await (client as any).coldCallProposal.findFirst({
      where: isAccessToken ? { accessToken: proposalId } : { id: proposalId },
      include: {
        ColdCallDeal: {
          include: {
            ColdCallLead: {
              include: { generatedWebsite: true },
            },
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Mark as viewed if accessed via token and not already viewed
    if (isAccessToken && !proposal.viewedAt) {
      await (client as any).coldCallProposal.update({
        where: { id: proposal.id },
        data: { viewedAt: new Date(), status: 'VIEWED' },
      })
    }

    return NextResponse.json({ proposal })
  } catch (error: any) {
    console.error('Get proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get proposal' },
      { status: 500 }
    )
  }
}

// PATCH - Update proposal
export async function PATCH(
  req: NextRequest,
  { params }: { params: { proposalId: string } }
) {
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

    const { proposalId } = params
    const updates = await req.json()

    // Verify ownership
    const proposal = await (client as any).coldCallProposal.findFirst({
      where: { id: proposalId },
      include: {
        ColdCallDeal: { include: { ColdCallLead: true } },
      },
    })

    if (!proposal || proposal.ColdCallDeal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const updated = await (client as any).coldCallProposal.update({
      where: { id: proposalId },
      data: updates,
    })

    return NextResponse.json({ success: true, proposal: updated })
  } catch (error: any) {
    console.error('Update proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update proposal' },
      { status: 500 }
    )
  }
}

// DELETE - Delete proposal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { proposalId: string } }
) {
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

    const { proposalId } = params

    // Verify ownership
    const proposal = await (client as any).coldCallProposal.findFirst({
      where: { id: proposalId },
      include: {
        ColdCallDeal: { include: { ColdCallLead: true } },
      },
    })

    if (!proposal || proposal.ColdCallDeal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    await (client as any).coldCallProposal.delete({
      where: { id: proposalId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete proposal' },
      { status: 500 }
    )
  }
}
