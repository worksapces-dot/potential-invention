import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

// Client accepts proposal (public endpoint via access token)
export async function POST(
  req: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params
    const { signature, clientName } = await req.json()

    // Find proposal by access token
    const proposal = await (client as any).coldCallProposal.findFirst({
      where: { accessToken: proposalId },
      include: {
        ColdCallDeal: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Proposal already accepted' },
        { status: 400 }
      )
    }

    if (proposal.status === 'DECLINED') {
      return NextResponse.json(
        { error: 'Proposal was declined' },
        { status: 400 }
      )
    }

    if (proposal.expiresAt && new Date(proposal.expiresAt) < new Date()) {
      await (client as any).coldCallProposal.update({
        where: { id: proposal.id },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json(
        { error: 'Proposal has expired' },
        { status: 400 }
      )
    }

    // Update proposal
    await (client as any).coldCallProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        clientSignature: signature || null,
        signedAt: signature ? new Date() : null,
        clientName: clientName || proposal.clientName,
      },
    })

    // Update lead status
    await client.coldCallLead.update({
      where: { id: proposal.ColdCallDeal.leadId },
      data: { status: 'INTERESTED' },
    })

    return NextResponse.json({
      success: true,
      paymentUrl: proposal.ColdCallDeal.stripePaymentId
        ? `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/payment/${proposal.ColdCallDeal.id}`
        : null,
    })
  } catch (error: any) {
    console.error('Accept proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to accept proposal' },
      { status: 500 }
    )
  }
}
