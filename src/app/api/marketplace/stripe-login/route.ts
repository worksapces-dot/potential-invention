import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { onCreateLoginLink } from '@/actions/marketplace/seller'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await onCreateLoginLink()

    if (result.status !== 200) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    return NextResponse.json({ url: result.data?.url })
  } catch (error: any) {
    console.error('Stripe login error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create login link' }, { status: 500 })
  }
}