import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Slide - Instagram DM Automation & Comment Automation',
  description:
    'Automate your Instagram DMs and comments with AI-powered responses. Turn comments into conversations, capture leads, and grow your business 24/7. Free plan available.',
  alternates: {
    canonical: 'https://getslide.app',
  },
}

// JSON-LD structured data for the homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Slide',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Instagram DM automation and comment automation platform with AI-powered responses. Turn comments into conversations and grow your business 24/7.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan available',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Auto DM Replies',
    'Keyword Triggers',
    'AI-Powered Responses',
    'Comment Automation',
    'Analytics Dashboard',
    'Template Marketplace',
  ],
}

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}