import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'
import ReactQueryProvider from '@/providers/react-query-provider'
import ReduxProvider from '@/providers/redux-provider'
import Script from 'next/script'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Slide - Instagram DM Automation & Comment Automation',
    template: '%s | Slide',
  },
  description:
    'Automate your Instagram DMs and comments with AI-powered responses. Turn comments into conversations, capture leads, and grow your business 24/7. Free plan available.',
  keywords: [
    'Instagram automation',
    'DM automation',
    'Instagram DM bot',
    'comment automation',
    'Instagram marketing',
    'social media automation',
    'lead generation',
    'Instagram growth',
    'AI responses',
    'Instagram engagement',
  ],
  authors: [{ name: 'Slide' }],
  creator: 'Slide',
  publisher: 'Slide',
  metadataBase: new URL('https://getslide.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://getslide.app',
    siteName: 'Slide',
    title: 'Slide - Instagram DM Automation & Comment Automation',
    description:
      'Automate your Instagram DMs and comments with AI-powered responses. Turn comments into conversations, capture leads, and grow your business 24/7.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Slide - Instagram DM Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slide - Instagram DM Automation & Comment Automation',
    description:
      'Automate your Instagram DMs and comments with AI-powered responses. Turn comments into conversations and grow your business 24/7.',
    images: ['/og-image.png'],
    creator: '@getslide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://getslide.app',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          suppressHydrationWarning
          className={jakarta.className}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <ReduxProvider>
              <ReactQueryProvider>{children}</ReactQueryProvider>
            </ReduxProvider>

            <Toaster />
          </ThemeProvider>

          <Script
            defer
            data-website-id="dfid_9uVVCAUrFO0PvhaQ5Xh3f"
            data-domain="potential-invention-orpin.vercel.app"
            src="https://datafa.st/js/script.js"
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
