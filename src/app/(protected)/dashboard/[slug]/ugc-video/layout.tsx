import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UGC Video Generator',
  description: 'Create viral TikTok and Instagram Reels scripts with AI. Generate scroll-stopping UGC content for your products.',
}

export default function UGCVideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
