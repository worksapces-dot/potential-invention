import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { onApplyTemplate } from '@/actions/marketplace/purchases'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchaseId } = await req.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 })
    }

    const result = await onApplyTemplate(purchaseId)

    if (result.status !== 200) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Apply template error:', error)
    return NextResponse.json({ error: error.message || 'Failed to apply template' }, { status: 500 })
  }
}
