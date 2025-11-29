import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

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

    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('id')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Get website and verify ownership
    const website = await client.generatedWebsite.findUnique({
      where: { id: websiteId },
      include: {
        ColdCallLead: true,
      },
    })

    if (!website || website.ColdCallLead?.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    const content = website.content as any
    const html = content?.html || ''

    // Return as downloadable HTML file
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${website.ColdCallLead?.businessName || 'website'}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Export website error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to export website' },
      { status: 500 }
    )
  }
}
