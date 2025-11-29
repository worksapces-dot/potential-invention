import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Verify lead belongs to user
    const lead = await client.coldCallLead.findFirst({
      where: {
        id: leadId,
        userId: dbUser.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Convert plain text body to HTML with better formatting
    const htmlBody = body
      .split('\n')
      .map((line: string) => {
        if (line.trim() === '') return '<br>'
        // Make URLs clickable
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const lineWithLinks = line.replace(
          urlRegex,
          '<a href="$1" style="color: #667eea; text-decoration: none; font-weight: 500;">$1</a>'
        )
        return `<p style="margin: 0 0 12px 0; line-height: 1.6;">${lineWithLinks}</p>`
      })
      .join('')

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px;">
              <div style="color: #1a1a1a; font-size: 15px; line-height: 1.6;">
                ${htmlBody}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                This email was sent via Cold Call
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    try {
      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: 'Cold Call <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: emailHtml,
        text: body,
        replyTo: user.emailAddresses[0]?.emailAddress || undefined,
      })

      if (error) {
        console.error('Resend error:', error)
        
        // If Resend fails, still save the email record but mark as draft
        await client.outreachEmail.create({
          data: {
            leadId: lead.id,
            subject: subject,
            body: body,
            sentAt: null, // Not sent
          },
        })

        return NextResponse.json(
          { 
            error: 'Email service error. Please copy the email and send manually.',
            details: error.message 
          },
          { status: 500 }
        )
      }

      // Save outreach email record
      await client.outreachEmail.create({
        data: {
          leadId: lead.id,
          subject: subject,
          body: body,
          sentAt: new Date(),
        },
      })

      // Update lead status to CONTACTED
      await client.coldCallLead.update({
        where: { id: lead.id },
        data: { status: 'CONTACTED' },
      })

      return NextResponse.json({
        success: true,
        emailId: data?.id,
        message: 'Email sent successfully!',
      })
    } catch (resendError: any) {
      console.error('Resend exception:', resendError)
      
      // Save as draft
      await client.outreachEmail.create({
        data: {
          leadId: lead.id,
          subject: subject,
          body: body,
          sentAt: null,
        },
      })

      return NextResponse.json(
        { 
          error: 'Failed to send email. Email saved as draft - please send manually.',
          details: resendError.message 
        },
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
