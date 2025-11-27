import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client as db } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const purchase = await db.purchase.findFirst({
      where: {
        id: params.purchaseId,
        userId
      },
      include: {
        Product: true
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Mock digital files (in a real app, these would be stored in the database)
    const files = [
      {
        id: '1',
        name: `${purchase.Product.name} - Main File.zip`,
        type: 'archive',
        size: 15728640, // 15MB
        downloadCount: 0,
        maxDownloads: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'ready'
      },
      {
        id: '2',
        name: `${purchase.Product.name} - Documentation.pdf`,
        type: 'pdf',
        size: 2097152, // 2MB
        downloadCount: 0,
        maxDownloads: 10,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready'
      }
    ]

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error('Digital delivery error:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}