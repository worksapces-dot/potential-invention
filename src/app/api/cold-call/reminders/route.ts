import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET - List reminders for user's deals
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

    const reminders = await (client as any).paymentReminder.findMany({
      where: {
        ColdCallDeal: {
          ColdCallLead: { userId: dbUser.id },
        },
      },
      include: {
        ColdCallDeal: {
          include: { ColdCallLead: true },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    })

    return NextResponse.json({ reminders })
  } catch (error: any) {
    console.error('Get reminders error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get reminders' },
      { status: 500 }
    )
  }
}

// POST - Create and optionally send a payment reminder
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

    const { dealId, message, sendNow, scheduledFor } = await req.json()

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      )
    }

    // Verify deal belongs to user and is pending
    const deal = await client.coldCallDeal.findFirst({
      where: { id: dealId },
      include: { ColdCallLead: true },
    })

    if (!deal || deal.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only send reminders for pending deals' },
        { status: 400 }
      )
    }

    const clientEmail = deal.ColdCallLead.email
    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Client email not available' },
        { status: 400 }
      )
    }

    const reminderMessage = message || `This is a friendly reminder about your pending invoice for ${deal.ColdCallLead.businessName}. Please complete your payment at your earliest convenience.`

    // Create reminder record
    const reminder = await (client as any).paymentReminder.create({
      data: {
        dealId,
        message: reminderMessage,
        type: 'EMAIL',
        scheduledFor: sendNow ? new Date() : new Date(scheduledFor),
        sentAt: sendNow ? new Date() : null,
      },
    })

    // Send immediately if requested
    if (sendNow) {
      const formatCurrency = (cents: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(cents / 100)

      await resend.emails.send({
        from: 'Slide <noreply@slide.so>',
        to: clientEmail,
        subject: `Payment Reminder - ${deal.ColdCallLead.businessName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Reminder</h2>
            <p>${reminderMessage}</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Amount Due:</strong> ${formatCurrency(deal.amount)}</p>
              <p style="margin: 10px 0 0;"><strong>Business:</strong> ${deal.ColdCallLead.businessName}</p>
            </div>
            <p>If you've already made this payment, please disregard this message.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({
      success: true,
      reminder,
      sent: sendNow,
    })
  } catch (error: any) {
    console.error('Create reminder error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create reminder' },
      { status: 500 }
    )
  }
}
