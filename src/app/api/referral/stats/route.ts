import { getReferralStats } from '@/actions/referral'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await getReferralStats()
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in referral stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}