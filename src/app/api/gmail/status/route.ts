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

    const emailSettings = await (client as any).userEmailSettings.findUnique({
      where: { userId: dbUser.id },
    })

    if (!emailSettings || !emailSettings.connected) {
      return NextResponse.json({
        connected: false,
        email: null,
      })
    }

    return NextResponse.json({
      connected: true,
      email: emailSettings.gmailEmail,
      senderName: emailSettings.senderName,
    })
  } catch (error) {
    console.error('Gmail status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
