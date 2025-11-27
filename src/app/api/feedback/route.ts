import { createFeatureRequest, getFeatureRequests } from '@/actions/feedback'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, category } = body
    
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await createFeatureRequest({ title, description, category })
    
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const sortBy = searchParams.get('sortBy') || 'score'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const result = await getFeatureRequests({
      page,
      limit,
      category: category as any,
      status: status as any,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    })
    
    return NextResponse.json(result, { status: result.status })
  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}