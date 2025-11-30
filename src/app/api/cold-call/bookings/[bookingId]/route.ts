import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

// GET - Fetch single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const booking = await (client as any).booking.findUnique({
      where: { id: params.bookingId },
      include: {
        BookingService: true,
        GeneratedWebsite: {
          include: { ColdCallLead: true },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Fetch booking error:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

// PATCH - Update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await req.json()
    const { status, notes } = body

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'CONFIRMED') updateData.confirmedAt = new Date()
      if (status === 'CANCELLED') updateData.cancelledAt = new Date()
      if (status === 'COMPLETED') updateData.completedAt = new Date()
    }
    
    if (notes !== undefined) updateData.notes = notes

    const booking = await (client as any).booking.update({
      where: { id: params.bookingId },
      data: updateData,
      include: { BookingService: true },
    })

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// DELETE - Cancel booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await (client as any).booking.update({
      where: { id: params.bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancel booking error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
