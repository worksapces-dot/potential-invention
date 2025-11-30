import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { sendEmail, refreshAccessToken } from '@/lib/gmail'

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

    const { leadId, to, subject, body } = await req.json()

    if (!leadId || !to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's Gmail settings
    const emailSettings = await (client as any).userEmailSettings.findUnique({
      where: { userId: dbUser.id },
    })

    if (!emailSettings || !emailSettings.connected || !emailSettings.refreshToken) {
      return NextResponse.json(
        { 
          error: 'Gmail not connected. Please connect your Gmail account first.',
          code: 'GMAIL_NOT_CONNECTED'
        },
        { status: 400 }
      )
    }

    // Verify lead belongs to user
    const lead = await (client as any).coldCallLead.findFirst({
      where: {
        id: leadId,
        userId: dbUser.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    try {
      // Check if token is expired and refresh if needed
      let accessToken = emailSettings.accessToken
      
      if (emailSettings.tokenExpiry && new Date(emailSettings.tokenExpiry) < new Date()) {
        console.log('Token expired, refreshing...')
        const newTokens = await refreshAccessToken(emailSettings.refreshToken)
        accessToken = newTokens.access_token!
        
        // Update tokens in database
        await (client as any).userEmailSettings.update({
          where: { userId: dbUser.id },
          data: {
            accessToken: newTokens.access_token,
            tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
          },
        })
      }

      // Send email via Gmail API
      const result = await sendEmail({
        accessToken,
        refreshToken: emailSettings.refreshToken,
        to,
        subject,
        body,
        senderName: emailSettings.senderName || dbUser.firstname || 'Slide User',
        senderEmail: emailSettings.gmailEmail,
      })

      // Save outreach email record
      await (client as any).outreachEmail.create({
        data: {
          leadId: lead.id,
          subject,
          body,
          sentAt: new Date(),
        },
      })

      // Update lead status to CONTACTED
      await (client as any).coldCallLead.update({
        where: { id: lead.id },
        data: { status: 'CONTACTED' },
      })

      return NextResponse.json({
        success: true,
        messageId: result.id,
        message: 'Email sent successfully!',
      })
    } catch (gmailError: any) {
      console.error('Gmail API error:', gmailError)
      
      // Check for specific errors
      if (gmailError.code === 401 || gmailError.message?.includes('invalid_grant')) {
        // Token revoked, mark as disconnected
        await (client as any).userEmailSettings.update({
          where: { userId: dbUser.id },
          data: { connected: false },
        })
        
        return NextResponse.json(
          { 
            error: 'Gmail access expired. Please reconnect your Gmail account.',
            code: 'GMAIL_EXPIRED'
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to send email. Please try again.', details: gmailError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}