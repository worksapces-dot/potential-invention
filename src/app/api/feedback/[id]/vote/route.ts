import { voteOnFeature } from '@/actions/feedback'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { voteType } = body
    
    if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    const result = await voteOnFeature(params.id, voteType)
    
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}