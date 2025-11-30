import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

// Reserved subdomains that can't be claimed
const RESERVED_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'dashboard', 'login', 'signup', 'auth',
  'help', 'support', 'blog', 'docs', 'status', 'mail', 'email', 'ftp',
  'cdn', 'static', 'assets', 'images', 'img', 'media', 'files', 'download',
  'test', 'dev', 'staging', 'demo', 'beta', 'alpha', 'preview', 'sandbox',
  'slide', 'cold-call', 'marketplace', 'deal-finder', 'automations',
]

// Validate subdomain format
function isValidSubdomain(subdomain: string): boolean {
  // 3-63 chars, lowercase alphanumeric and hyphens, can't start/end with hyphen
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
  return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63
}

// GET - Check subdomain availability
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subdomain = req.nextUrl.searchParams.get('subdomain')?.toLowerCase().trim()
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    // Check format
    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json({
        available: false,
        reason: 'Invalid format. Use 3-63 lowercase letters, numbers, and hyphens.',
      })
    }

    // Check reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.json({
        available: false,
        reason: 'This subdomain is reserved.',
      })
    }

    // Check if taken
    const existing = await (client as any).generatedWebsite.findUnique({
      where: { subdomain },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existing,
      reason: existing ? 'This subdomain is already taken.' : null,
    })
  } catch (error: any) {
    console.error('Subdomain check error:', error)
    return NextResponse.json({ error: 'Failed to check subdomain' }, { status: 500 })
  }
}

// POST - Claim subdomain for a website
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { websiteId, subdomain: rawSubdomain } = await req.json()
    const subdomain = rawSubdomain?.toLowerCase().trim()

    if (!websiteId || !subdomain) {
      return NextResponse.json({ error: 'Website ID and subdomain required' }, { status: 400 })
    }

    // Validate format
    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json({ error: 'Invalid subdomain format' }, { status: 400 })
    }

    // Check reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.json({ error: 'This subdomain is reserved' }, { status: 400 })
    }

    // Get user from DB
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify website ownership
    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: { select: { userId: true } } },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Website not found or not authorized' }, { status: 404 })
    }

    // Check if subdomain is taken (by another website)
    const existing = await (client as any).generatedWebsite.findUnique({
      where: { subdomain },
      select: { id: true },
    })

    if (existing && existing.id !== websiteId) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 })
    }

    // Update website with subdomain
    const updated = await (client as any).generatedWebsite.update({
      where: { id: websiteId },
      data: { subdomain },
      select: { id: true, subdomain: true },
    })

    return NextResponse.json({
      success: true,
      subdomain: updated.subdomain,
      url: `https://${subdomain}.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'}`,
    })
  } catch (error: any) {
    console.error('Subdomain claim error:', error)
    return NextResponse.json({ error: 'Failed to claim subdomain' }, { status: 500 })
  }
}

// DELETE - Release subdomain
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const websiteId = req.nextUrl.searchParams.get('websiteId')
    
    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: { select: { userId: true } } },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Remove subdomain
    await (client as any).generatedWebsite.update({
      where: { id: websiteId },
      data: { subdomain: null },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Subdomain release error:', error)
    return NextResponse.json({ error: 'Failed to release subdomain' }, { status: 500 })
  }
}
