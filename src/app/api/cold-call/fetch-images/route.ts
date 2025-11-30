import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

// Curated high-quality Unsplash images by category
const categoryImages: Record<string, string[]> = {
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
  ],
  salon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80',
  ],
  dentist: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
    'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80',
  ],
  plumber: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  electrician: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
  ],
  spa: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  ],
  auto_repair: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  ],
  cleaning: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80',
  ],
  landscaping: [
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=80',
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159562-66b02b259e5c?w=800&q=80',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80',
    'https://images.unsplash.com/photo-1517433670267-30f206be5f84?w=800&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
  ],
}

const defaultImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
]

// POST - Get curated images for a lead based on category
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

    const { leadId } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await (client as any).coldCallLead.findFirst({
      where: { id: leadId, userId: dbUser.id },
      include: { generatedWebsite: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get curated images for this category
    const images = categoryImages[lead.category] || defaultImages

    // Update the website with curated images
    if (lead.generatedWebsite) {
      const existingImages = lead.generatedWebsite.customImages || []
      // Only add images that aren't already there
      const newImages = Array.from(new Set([...existingImages, ...images])).slice(0, 6)

      await (client as any).generatedWebsite.update({
        where: { id: lead.generatedWebsite.id },
        data: { customImages: newImages },
      })

      return NextResponse.json({
        success: true,
        images: newImages,
        message: `Added ${images.length} curated ${lead.category} images`,
      })
    }

    return NextResponse.json({
      success: true,
      images,
      message: `Found ${images.length} curated images for ${lead.category}`,
    })
  } catch (error: any) {
    console.error('Fetch images error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
