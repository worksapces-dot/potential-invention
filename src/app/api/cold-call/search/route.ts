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

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 5, // 5 searches per minute per user
  dailyLimit: 50, // 50 searches per day per user
}

// In-memory rate limit store (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const dailyLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number; remaining: number } {
  const now = Date.now()
  
  // Check per-minute rate limit
  const minuteKey = `minute:${userId}`
  const minuteData = rateLimitStore.get(minuteKey)
  
  if (minuteData) {
    if (now > minuteData.resetTime) {
      // Window expired, reset
      rateLimitStore.set(minuteKey, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    } else if (minuteData.count >= RATE_LIMIT.maxRequests) {
      // Rate limited
      return { 
        allowed: false, 
        retryAfter: Math.ceil((minuteData.resetTime - now) / 1000),
        remaining: 0 
      }
    } else {
      minuteData.count++
    }
  } else {
    rateLimitStore.set(minuteKey, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
  }
  
  // Check daily limit
  const dayKey = `day:${userId}`
  const dayData = dailyLimitStore.get(dayKey)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  if (dayData) {
    if (now > dayData.resetTime) {
      // Day expired, reset
      dailyLimitStore.set(dayKey, { count: 1, resetTime: endOfDay.getTime() })
    } else if (dayData.count >= RATE_LIMIT.dailyLimit) {
      // Daily limit reached
      return { 
        allowed: false, 
        retryAfter: Math.ceil((dayData.resetTime - now) / 1000),
        remaining: 0 
      }
    } else {
      dayData.count++
    }
  } else {
    dailyLimitStore.set(dayKey, { count: 1, resetTime: endOfDay.getTime() })
  }
  
  const currentMinute = rateLimitStore.get(minuteKey)
  const currentDay = dailyLimitStore.get(dayKey)
  
  return { 
    allowed: true, 
    remaining: Math.min(
      RATE_LIMIT.maxRequests - (currentMinute?.count || 0),
      RATE_LIMIT.dailyLimit - (currentDay?.count || 0)
    )
  }
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((data, key) => {
    if (now > data.resetTime) rateLimitStore.delete(key)
  })
  dailyLimitStore.forEach((data, key) => {
    if (now > data.resetTime) dailyLimitStore.delete(key)
  })
}, 5 * 60 * 1000)

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
  source: string
}

// Data sources to search for businesses without websites
const DATA_SOURCES = [
  {
    name: 'Yelp',
    site: 'site:yelp.com/biz/',
    urlPattern: /yelp\.com\/biz\//,
    extractName: (title: string) => title
      .replace(/\s*-\s*Yelp.*$/i, '')
      .replace(/\s*-\s*[A-Z][a-z]+,?\s*[A-Z]{2}.*$/i, '')
      .replace(/\s*\|.*$/g, '')
      .trim(),
  },
  {
    name: 'Yellow Pages',
    site: 'site:yellowpages.com',
    urlPattern: /yellowpages\.com.*\/mip\//,
    extractName: (title: string) => title
      .replace(/\s*\|.*Yellow\s*Pages.*$/i, '')
      .replace(/\s*-\s*Yellow\s*Pages.*$/i, '')
      .trim(),
  },
  {
    name: 'BBB',
    site: 'site:bbb.org/us/',
    urlPattern: /bbb\.org\/us\//,
    extractName: (title: string) => title
      .replace(/\s*\|.*BBB.*$/i, '')
      .replace(/\s*-\s*BBB.*$/i, '')
      .replace(/\s*Better Business Bureau.*$/i, '')
      .trim(),
  },
  {
    name: 'Facebook',
    site: 'site:facebook.com/pages/',
    urlPattern: /facebook\.com\/(pages\/|[^\/]+\/?$)/,
    extractName: (title: string) => title
      .replace(/\s*\|.*Facebook.*$/i, '')
      .replace(/\s*-\s*Facebook.*$/i, '')
      .replace(/\s*-\s*Home.*$/i, '')
      .trim(),
  },
  {
    name: 'Foursquare',
    site: 'site:foursquare.com/v/',
    urlPattern: /foursquare\.com\/v\//,
    extractName: (title: string) => title
      .replace(/\s*-\s*Foursquare.*$/i, '')
      .replace(/\s*\|.*$/g, '')
      .trim(),
  },
  {
    name: 'TripAdvisor',
    site: 'site:tripadvisor.com',
    urlPattern: /tripadvisor\.com.*Restaurant_Review|tripadvisor\.com.*Attraction_Review/,
    extractName: (title: string) => title
      .replace(/\s*-\s*Tripadvisor.*$/i, '')
      .replace(/\s*,\s*[A-Z][a-z]+.*$/i, '')
      .trim(),
  },
  {
    name: 'MapQuest',
    site: 'site:mapquest.com/us/',
    urlPattern: /mapquest\.com\/us\//,
    extractName: (title: string) => title
      .replace(/\s*\|.*MapQuest.*$/i, '')
      .replace(/\s*-\s*MapQuest.*$/i, '')
      .trim(),
  },
  {
    name: 'Manta',
    site: 'site:manta.com/c/',
    urlPattern: /manta\.com\/c\//,
    extractName: (title: string) => title
      .replace(/\s*-\s*Manta.*$/i, '')
      .replace(/\s*\|.*$/g, '')
      .trim(),
  },
]

async function searchSource(
  source: typeof DATA_SOURCES[0],
  categoryLabel: string,
  city: string,
  country: string
): Promise<BusinessLead[]> {
  const leads: BusinessLead[] = []
  
  try {
    const query = `${source.site} ${categoryLabel} ${city} ${country}`
    console.log(`[${source.name}] Searching: ${query}`)
    
    const searchResult = await firecrawl.search(query, { limit: 10 })
    const results = searchResult as any
    const webResults = results.data || results.web || []
    
    console.log(`[${source.name}] Found ${webResults.length} results`)
    
    for (const result of webResults) {
      const url = result.url || ''
      const title = result.title || ''
      const description = result.description || ''
      
      // Verify URL matches expected pattern
      if (!source.urlPattern.test(url)) continue
      
      // Extract business name
      const businessName = source.extractName(title)
      if (!businessName || businessName.length < 2) continue
      
      // Extract rating
      const ratingMatch = description.match(/(\d\.?\d?)\s*(?:star|rating|out of 5)/i)
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null
      
      // Extract review count
      const reviewMatch = description.match(/(\d+)\s*(?:review|rating)/i)
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null
      
      // Extract phone
      const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
      const phone = phoneMatch ? phoneMatch[0] : null
      
      leads.push({
        id: uuid(),
        businessName: businessName.slice(0, 100),
        category: categoryLabel,
        address: description.slice(0, 200),
        city,
        state: '',
        country: country || 'USA',
        phone,
        email: null,
        website: null,
        rating,
        reviewCount,
        googleMapsUrl: url,
        source: source.name,
      })
    }
  } catch (error) {
    console.error(`[${source.name}] Search failed:`, error)
  }
  
  return leads
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

    // Check rate limit
    const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    const { city, country, category } = await req.json()

    if (!city || !category) {
      return NextResponse.json(
        { error: 'City and category are required' },
        { status: 400 }
      )
    }

    const categoryLabel = category.replace(/_/g, ' ')
    const countryName = country || 'USA'
    
    console.log(`\n🔍 Starting multi-source search for "${categoryLabel}" in ${city}, ${countryName}`)

    // Search all sources in parallel for speed
    const searchPromises = DATA_SOURCES.map(source => 
      searchSource(source, categoryLabel, city, countryName)
    )
    
    const allResults = await Promise.all(searchPromises)
    const allLeads = allResults.flat()
    
    console.log(`\n📊 Total raw results: ${allLeads.length}`)

    // Remove duplicates by normalized business name
    const seen = new Set<string>()
    const uniqueLeads = allLeads.filter((lead) => {
      const key = lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by rating (highest first), then by review count
    uniqueLeads.sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0)
      return (b.reviewCount || 0) - (a.reviewCount || 0)
    })

    console.log(`✅ Found ${uniqueLeads.length} unique leads from ${DATA_SOURCES.length} sources\n`)

    // Log source breakdown
    const sourceBreakdown = uniqueLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('Source breakdown:', sourceBreakdown)

    return NextResponse.json(
      {
        leads: uniqueLeads.slice(0, 30),
        total: uniqueLeads.length,
        sources: Object.keys(sourceBreakdown),
        rateLimit: {
          remaining: rateLimit.remaining - 1,
          limit: RATE_LIMIT.maxRequests,
          dailyLimit: RATE_LIMIT.dailyLimit,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
          'X-RateLimit-Remaining': String(Math.max(0, rateLimit.remaining - 1)),
        },
      }
    )
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error?.message || 'Search failed' },
      { status: 500 }
    )
  }
}
