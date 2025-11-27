import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/payment(.*)',
  '/api/marketplace(.*)',
  '/api/referral(.*)',
  '/callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Handle referral codes in URL
  const url = req.nextUrl.clone()
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
