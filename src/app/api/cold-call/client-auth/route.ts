import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

// Simple password hashing using built-in crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// POST - Create client access or login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, websiteId, email, password } = body

    if (action === 'create') {
      // Create new client access (called by Slide user)
      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Verify ownership
      const website = await (client as any).generatedWebsite.findUnique({
        where: { id: websiteId },
        include: { ColdCallLead: true, clientAccess: true },
      })

      if (!website || website.ColdCallLead.userId !== dbUser.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      if (website.clientAccess) {
        return NextResponse.json({ error: 'Client access already exists' }, { status: 400 })
      }

      // Generate temporary password
      const tempPassword = nanoid(12)
      const passwordHash = hashPassword(tempPassword)

      const clientAccess = await (client as any).clientAccess.create({
        data: {
          websiteId,
          email,
          passwordHash,
        },
      })

      return NextResponse.json({
        success: true,
        clientAccess: { id: clientAccess.id, email },
        tempPassword, // Send this to the business owner
        dashboardUrl: `/client/${websiteId}`,
      })
    }

    if (action === 'login') {
      // Client login
      if (!websiteId || !email || !password) {
        return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
      }

      const clientAccess = await (client as any).clientAccess.findUnique({
        where: { websiteId },
      })

      if (!clientAccess || clientAccess.email !== email) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const validPassword = verifyPassword(password, clientAccess.passwordHash)
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Generate access token
      const accessToken = nanoid(32)
      const tokenExpiresAt = new Date()
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7) // 7 days

      await (client as any).clientAccess.update({
        where: { id: clientAccess.id },
        data: {
          accessToken,
          tokenExpiresAt,
          lastLoginAt: new Date(),
        },
      })

      const response = NextResponse.json({
        success: true,
        websiteId,
      })

      // Set cookie
      response.cookies.set('client_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true })
      response.cookies.delete('client_token')
      return response
    }

    if (action === 'change-password') {
      const { currentPassword, newPassword } = body
      
      const clientAccess = await (client as any).clientAccess.findUnique({
        where: { websiteId },
      })

      if (!clientAccess) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      const validPassword = verifyPassword(currentPassword, clientAccess.passwordHash)
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 })
      }

      const newHash = hashPassword(newPassword)
      await (client as any).clientAccess.update({
        where: { id: clientAccess.id },
        data: { passwordHash: newHash },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Client auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

// GET - Verify client session
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('client_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const clientAccess = await (client as any).clientAccess.findUnique({
      where: { accessToken: token },
      include: {
        GeneratedWebsite: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!clientAccess || !clientAccess.tokenExpiresAt || clientAccess.tokenExpiresAt < new Date()) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      websiteId: clientAccess.websiteId,
      email: clientAccess.email,
      businessName: clientAccess.GeneratedWebsite.ColdCallLead.businessName,
    })
  } catch (error: any) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
