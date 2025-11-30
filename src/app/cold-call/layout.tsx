import '@/app/globals.css'

export default function ColdCallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Minimal layout for cold-call pages (preview, payment-success)
  // No Clerk, no theme provider - just the content
  return children
}
