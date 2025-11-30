import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// GET - Fetch bookings for a website (public or authenticated)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('websiteId')
    const date = searchParams.get('date')

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 })
    }

    const where: any = { websiteId }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.date = { gte: startOfDay, lte: endOfDay }
    }

    const bookings = await (client as any).booking.findMany({
      where,
      include: { BookingService: true },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// POST - Create a new booking (public endpoint for customers)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      websiteId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
      notes,
    } = body

    if (!websiteId || !customerName || !customerEmail || !date || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify website exists
    const website = await (client as any).generatedWebsite.findUnique({
      where: { id: websiteId },
      include: { ColdCallLead: true },
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Get service details for duration
    let duration = 30 // default 30 minutes
    let endTime = startTime

    if (serviceId) {
      const service = await (client as any).bookingService.findUnique({
        where: { id: serviceId },
      })
      if (service) {
        duration = service.duration
      }
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

    // Check for conflicts
    const bookingDate = new Date(date)
    const existingBookings = await (client as any).booking.findMany({
      where: {
        websiteId,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    const hasConflict = existingBookings.some((booking: any) => {
      const existingStart = timeToMinutes(booking.startTime)
      const existingEnd = timeToMinutes(booking.endTime)
      const newStart = startMinutes
      const newEnd = endMinutes
      return (newStart < existingEnd && newEnd > existingStart)
    })

    if (hasConflict) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Create booking
    const confirmationCode = nanoid(8).toUpperCase()
    
    const booking = await (client as any).booking.create({
      data: {
        websiteId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        date: bookingDate,
        startTime,
        endTime,
        notes,
        confirmationCode,
      },
      include: { BookingService: true },
    })

    // Update analytics - increment bookingsCreated for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    await (client as any).websiteAnalytics.upsert({
      where: {
        websiteId_date: { websiteId, date: today },
      },
      create: {
        websiteId,
        date: today,
        bookingsCreated: 1,
      },
      update: {
        bookingsCreated: { increment: 1 },
      },
    })

    // TODO: Send confirmation email to customer
    // TODO: Send notification to business owner

    return NextResponse.json({
      success: true,
      booking,
      confirmationCode,
      message: `Booking confirmed! Your confirmation code is ${confirmationCode}`,
    })
  } catch (error: any) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
