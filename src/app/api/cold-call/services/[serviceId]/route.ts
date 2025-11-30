import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// DELETE - Delete a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership through the chain
    const service = await (client as any).bookingService.findUnique({
      where: { id: params.serviceId },
      include: {
        GeneratedWebsite: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!service || service.GeneratedWebsite.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await (client as any).bookingService.delete({
      where: { id: params.serviceId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}

// PATCH - Update a service
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, duration, price, active } = body

    // Verify ownership
    const service = await (client as any).bookingService.findUnique({
      where: { id: params.serviceId },
      include: {
        GeneratedWebsite: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!service || service.GeneratedWebsite.ColdCallLead.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updated = await (client as any).bookingService.update({
      where: { id: params.serviceId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration }),
        ...(price !== undefined && { price }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ service: updated })
  } catch (error: any) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}
