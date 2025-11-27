import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client as db } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await req.json()

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

    // In a real app, you would:
    // 1. Verify the file exists and user has access
    // 2. Check download limits and expiry
    // 3. Generate a secure download URL or stream the file
    // 4. Log the download for analytics
    // 5. Update download count

    // For demo purposes, we'll create a mock file response
    const mockFileContent = `This is a demo file for ${purchase.Product.name}\nFile ID: ${fileId}\nDownloaded by: ${userId}\nTimestamp: ${new Date().toISOString()}`
    
    const buffer = Buffer.from(mockFileContent, 'utf-8')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${purchase.Product.name}-${fileId}.txt"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}