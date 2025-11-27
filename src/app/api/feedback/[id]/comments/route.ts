import { addFeatureComment } from '@/actions/feedback'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { content, parentId } = body
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const result = await addFeatureComment({
      featureId: params.id,
      content: content.trim(),
      parentId
    })
    
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in comment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}