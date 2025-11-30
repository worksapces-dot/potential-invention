import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getAuthUrl } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Get redirect URL from query params
    const { searchParams } = new URL(req.url)
    const redirectTo = searchParams.get('redirect') || '/dashboard'

    // Create state with user ID and redirect URL
    const state = Buffer.from(
      JSON.stringify({ userId: user.id, redirectTo })
    ).toString('base64')

    const authUrl = getAuthUrl(state)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Gmail connect error:', error)
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 })
  }
}
