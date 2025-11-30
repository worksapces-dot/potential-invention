import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/payment(.*)',
  '/api/marketplace(.*)',
  '/api/referral(.*)',
  '/callback(.*)',
])

// Root domain from env
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''
  
  // Extract subdomain from hostname
  // e.g., "joes-plumbing.slide.app" -> "joes-plumbing"
  // e.g., "joes-plumbing.localhost:3000" -> "joes-plumbing"
  let subdomain: string | null = null
  
  if (hostname !== ROOT_DOMAIN && hostname !== `www.${ROOT_DOMAIN}`) {
    // Check if it's a subdomain of our root domain
    const hostWithoutPort = hostname.split(':')[0]
    const rootWithoutPort = ROOT_DOMAIN.split(':')[0]
    
    if (hostWithoutPort.endsWith(`.${rootWithoutPort}`) || hostWithoutPort.endsWith('.localhost')) {
      subdomain = hostWithoutPort.replace(`.${rootWithoutPort}`, '').replace('.localhost', '')
    }
  }
  
  // If we have a subdomain, rewrite to the subdomain page
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // Don't rewrite API routes or static files
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  // Handle referral codes in URL
  const referralCode = url.searchParams.get('ref')
  
  if (referralCode && !req.nextUrl.pathname.startsWith('/api')) {
    // Store referral code in cookie for later use
    const response = NextResponse.next()
    response.cookies.set('referral_code', referralCode, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    // Remove ref parameter from URL to clean it up
    url.searchParams.delete('ref')
    if (url.search !== req.nextUrl.search) {
      return NextResponse.redirect(url)
    }
    
    return response
  }
  
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
