import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userType } = await req.json()

    if (!userType || !['CREATOR', 'COLD_CALLER', 'BOTH'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

    const dbUser = await (client.user as any).update({
      where: { clerkId: user.id },
      data: {
        userType,
        onboardingComplete: true,
      },
    })

    // Generate slug from firstname or email
    const slug = dbUser.firstname || dbUser.email.split('@')[0]

    return NextResponse.json({ success: true, slug })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await (client.user as any).findUnique({
      where: { clerkId: user.id },
      select: {
        userType: true,
        onboardingComplete: true,
      },
    })

    return NextResponse.json({
      userType: dbUser?.userType || null,
      onboardingComplete: dbUser?.onboardingComplete || false,
    })
  } catch (error: any) {
    console.error('Get onboarding status error:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    )
  }
}
