import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// GET - Fetch SEO settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      select: {
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        customImages: true,
        logoUrl: true,
      },
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json({ seo: website })
  } catch (error: any) {
    console.error('Fetch SEO error:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO' }, { status: 500 })
  }
}

// PATCH - Update SEO settings
export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { websiteId, seoTitle, seoDescription, seoKeywords } = body

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    // Verify ownership
    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: true },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updated = await (client as any).generatedWebsite.update({
      where: { id: websiteId },
      data: {
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
      },
    })

    return NextResponse.json({ success: true, seo: updated })
  } catch (error: any) {
    console.error('Update SEO error:', error)
    return NextResponse.json({ error: 'Failed to update SEO' }, { status: 500 })
  }
}
