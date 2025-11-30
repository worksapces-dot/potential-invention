import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { Resend } from 'resend'

export async function POST(
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
        ColdCallDeal: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!proposal || proposal.ColdCallDeal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (!proposal.clientEmail) {
      return NextResponse.json(
        { error: 'Client email required' },
        { status: 400 }
      )
    }

    const proposalUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/cold-call/proposal/${proposal.accessToken}`
    const businessName = proposal.ColdCallDeal.ColdCallLead.businessName

    // Send email
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Slide <noreply@slide.so>',
      to: proposal.clientEmail,
      subject: `Proposal: ${proposal.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${proposal.clientName || businessName},</h2>
          <p>You've received a proposal for your website project.</p>
          <p><strong>${proposal.title}</strong></p>
          <p>${proposal.description.substring(0, 200)}${proposal.description.length > 200 ? '...' : ''}</p>
          <div style="margin: 30px 0;">
            <a href="${proposalUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              View Proposal
            </a>
          </div>
          ${proposal.expiresAt ? `<p style="color: #666; font-size: 14px;">This proposal expires on ${new Date(proposal.expiresAt).toLocaleDateString()}</p>` : ''}
        </div>
      `,
    })

    // Update proposal status
    await (client as any).coldCallProposal.update({
      where: { id: proposalId },
      data: { status: 'SENT', sentAt: new Date() },
    })

    return NextResponse.json({ success: true, proposalUrl })
  } catch (error: any) {
    console.error('Send proposal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to send proposal' },
      { status: 500 }
    )
  }
}
