import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import FirecrawlApp from '@mendable/firecrawl-js'
import { v4 as uuid } from 'uuid'

const apiKey = process.env.FIRECRAWL_API_KEY
if (!apiKey) {
  console.warn('⚠️ FIRECRAWL_API_KEY is not set')
}

const firecrawl = new FirecrawlApp({
  apiKey: apiKey || '',
})

type BusinessLead = {
  id: string
  businessName: string
  category: string
  address: string
  city: string
  state: string
  country: string
  phone: string | null
  email: string | null
  website: string | null
  rating: number | null
  reviewCount: number | null
  googleMapsUrl: string | null
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FIRECRAWL_API_KEY is not configured.' },
        { status: 500 }
      )
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { city, country, category } = await req.json()

    if (!city || !category) {
      return NextResponse.json(
        { error: 'City and category are required' },
        { status: 400 }
      )
    }

    const categoryLabel = category.replace(/_/g, ' ')
    
    // Search specifically on Yelp to find businesses listed there (likely no website)
    const query = `site:yelp.com ${categoryLabel} ${city} ${country || 'USA'}`
    
    console.log('Searching for:', query)

    const searchResult = await firecrawl.search(query, {
      limit: 20,
    })

    console.log('Raw result keys:', Object.keys(searchResult))

    const leads: BusinessLead[] = []
    const results = searchResult as any

    // Handle different response formats
    const webResults = results.web || results.data || []
    
    console.log(`Processing ${webResults.length} results`)

    for (const result of webResults) {
      const url = result.url || ''
      const title = result.title || ''
      const description = result.description || ''

      // Only process Yelp business pages (not search pages)
      if (!url.includes('yelp.com/biz/')) continue

      // Extract business name from Yelp title (format: "Business Name - City - Yelp")
      let businessName = title
        .replace(/\s*-\s*Yelp.*$/i, '')
        .replace(/\s*-\s*[A-Z][a-z]+,?\s*[A-Z]{2}.*$/i, '') // Remove "- City, ST"
        .replace(/\s*\|.*$/g, '')
        .trim()

      if (!businessName || businessName.length < 2) continue

      // Extract rating from description (e.g., "4.5 star rating")
      const ratingMatch = description.match(/(\d\.?\d?)\s*(?:star|rating)/i)
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null

      // Extract review count
      const reviewMatch = description.match(/\((\d+)\s*review/i)
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null

      // Extract phone if present
      const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
      const phone = phoneMatch ? phoneMatch[0] : null

      leads.push({
        id: uuid(),
        businessName: businessName.slice(0, 100),
        category: category,
        address: description.slice(0, 200),
        city: city,
        state: '',
        country: country || 'USA',
        phone: phone,
        email: null,
        website: null, // On Yelp = likely no website
        rating: rating,
        reviewCount: reviewCount,
        googleMapsUrl: url, // Use Yelp URL
      })
    }

    // Remove duplicates
    const seen = new Set<string>()
    const uniqueLeads = leads.filter((lead) => {
      const key = lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    console.log(`Found ${uniqueLeads.length} unique leads`)

    return NextResponse.json({
      leads: uniqueLeads.slice(0, 20),
      total: uniqueLeads.length,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error?.message || 'Search failed' },
      { status: 500 }
    )
  }
}
