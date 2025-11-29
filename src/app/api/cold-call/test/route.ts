import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'FIRECRAWL_API_KEY not set',
        hasKey: false 
      })
    }

    const firecrawl = new FirecrawlApp({ apiKey })
    
    // Simple test search
    const result = await firecrawl.search('pizza restaurant new york', {
      limit: 3,
    })

    return NextResponse.json({
      success: true,
      hasKey: true,
      keyPrefix: apiKey.slice(0, 10) + '...',
      result: result,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
