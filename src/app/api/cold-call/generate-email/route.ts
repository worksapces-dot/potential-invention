import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
})

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

    const { leadId } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await client.coldCallLead.findFirst({
      where: {
        id: leadId,
        userId: dbUser.id,
      },
      include: {
        generatedWebsite: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!lead.generatedWebsite) {
      return NextResponse.json(
        { error: 'Generate a website for this lead first' },
        { status: 400 }
      )
    }

    // Get user's name for signature
    const senderName = dbUser.firstname 
      ? `${dbUser.firstname} ${dbUser.lastname || ''}`.trim()
      : 'Your Name'

    const previewUrl = `${process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:3000'}/cold-call/preview/${lead.generatedWebsite.id}`

    const prompt = buildEmailPrompt(lead, senderName, previewUrl)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: EMAIL_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse subject and body from response
    const subjectMatch = response.match(/Subject:\s*(.+?)(?:\n|$)/i)
    const subject = subjectMatch ? subjectMatch[1].trim() : `Website for ${lead.businessName}`
    
    // Get body (everything after "Body:" or after the subject line)
    let body = response
    if (response.toLowerCase().includes('body:')) {
      body = response.split(/body:/i)[1]?.trim() || response
    } else if (subjectMatch) {
      body = response.replace(subjectMatch[0], '').trim()
    }

    return NextResponse.json({
      subject,
      body,
    })
  } catch (error: any) {
    console.error('Generate email error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate email' },
      { status: 500 }
    )
  }
}

const EMAIL_SYSTEM_PROMPT = `You are an expert cold email copywriter who writes highly effective, personalized outreach emails that get responses.

Your emails are:
- Short and scannable (under 150 words)
- Personalized to the specific business
- Value-focused (what's in it for them)
- Professional but friendly tone
- Include a clear call-to-action
- Not pushy or salesy

Format your response as:
Subject: [subject line]

Body:
[email body]

Do not include any other text or explanations.`

function buildEmailPrompt(lead: any, senderName: string, previewUrl: string): string {
  const categoryContext: Record<string, string> = {
    restaurant: 'restaurants need websites to show menus, take reservations, and attract new diners',
    cafe: 'cafes benefit from websites to showcase their atmosphere, menu, and build a loyal customer base',
    salon: 'salons need websites for online booking, showcasing work, and attracting new clients',
    dentist: 'dental practices need professional websites to build trust and allow easy appointment booking',
    plumber: 'plumbing businesses need websites to appear professional and get found by local customers',
    electrician: 'electrical contractors need websites to showcase services and build credibility',
    gym: 'fitness centers need websites to show facilities, classes, and convert visitors to members',
    auto_repair: 'auto shops need websites to build trust and make it easy for customers to schedule service',
    cleaning: 'cleaning services need websites to show professionalism and make booking easy',
    landscaping: 'landscaping companies need websites to showcase their portfolio and attract homeowners',
    bakery: 'bakeries need websites to display products, take custom orders, and build a following',
    spa: 'spas need elegant websites to convey luxury and allow easy treatment booking',
  }

  const context = categoryContext[lead.category] || 'local businesses need websites to attract customers and build credibility'

  return `Write a cold email to the owner of "${lead.businessName}", a ${lead.category.replace(/_/g, ' ')} in ${lead.city}.

Context: ${context}

Key points to include:
1. I noticed they don't have a website
2. I've already created a FREE website preview for them to see
3. Include this preview link: ${previewUrl}
4. Offer to discuss if they're interested
5. No obligation, just wanted to show what's possible

Sign off as: ${senderName}

Keep it short, friendly, and focused on the value for THEM. Don't be pushy.`
}
