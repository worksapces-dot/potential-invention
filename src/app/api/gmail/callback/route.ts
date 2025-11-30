import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { getTokensFromCode, getUserEmail } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard?error=gmail_denied', req.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=gmail_failed', req.url)
      )
    }

    // Decode state
    let stateData: { userId: string; redirectTo: string }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', req.url)
      )
    }

    // Verify user matches
    if (stateData.userId !== user.id) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_mismatch', req.url)
      )
    }

    // Get tokens
    const tokens = await getTokensFromCode(code)

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_token', req.url)
      )
    }

    // Get user's Gmail email
    const gmailEmail = await getUserEmail(tokens.access_token)

    // Get DB user
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_not_found', req.url)
      )
    }

    // Save tokens to database
    await (client as any).userEmailSettings.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        gmailEmail: gmailEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        senderName: dbUser.firstname || 'Slide User',
        connected: true,
      },
      update: {
        gmailEmail: gmailEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        connected: true,
      },
    })

    // Redirect back
    const redirectUrl = new URL(stateData.redirectTo, req.url)
    redirectUrl.searchParams.set('gmail', 'connected')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=gmail_callback_failed', req.url)
    )
  }
}
