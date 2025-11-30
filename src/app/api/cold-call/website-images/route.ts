import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { put } from '@vercel/blob'

// POST - Upload images for a website
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const websiteId = formData.get('websiteId') as string
    const imageType = formData.get('type') as string // 'logo' | 'gallery'
    const file = formData.get('file') as File

    if (!websiteId || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ownership
    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: true },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Upload to Vercel Blob
    const blob = await put(`cold-call/${websiteId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Update website with new image
    if (imageType === 'logo') {
      await (client as any).generatedWebsite.update({
        where: { id: websiteId },
        data: { logoUrl: blob.url },
      })
    } else {
      // Add to gallery images
      const currentImages = website.customImages || []
      await (client as any).generatedWebsite.update({
        where: { id: websiteId },
        data: { customImages: [...currentImages, blob.url] },
      })
    }

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      type: imageType,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE - Remove an image
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { websiteId, imageUrl, type } = await req.json()

    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: true },
    })

    if (!website || website.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (type === 'logo') {
      await (client as any).generatedWebsite.update({
        where: { id: websiteId },
        data: { logoUrl: null },
      })
    } else {
      const currentImages = website.customImages || []
      await (client as any).generatedWebsite.update({
        where: { id: websiteId },
        data: { customImages: currentImages.filter((url: string) => url !== imageUrl) },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
