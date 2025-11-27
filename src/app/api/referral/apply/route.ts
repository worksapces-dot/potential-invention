import { applyReferralCode } from '@/actions/referral'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { referralCode } = await req.json()
    
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    const result = await applyReferralCode(referralCode)
    
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in referral API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}