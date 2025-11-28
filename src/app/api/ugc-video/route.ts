import { NextResponse } from 'next/server'
import { createVideoJob, getVideoTemplates, getUserVideoJobs } from '@/actions/ugc-video'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        const result = await createVideoJob(data)
        return NextResponse.json(result)
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('UGC Video API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'templates': {
        const category = searchParams.get('category') || undefined
        const result = await getVideoTemplates(category)
        return NextResponse.json(result)
      }
      
      case 'jobs': {
        const result = await getUserVideoJobs()
        return NextResponse.json(result)
      }
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('UGC Video API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
