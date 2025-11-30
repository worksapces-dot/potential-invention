import { Toaster } from 'sonner'
import '@/app/globals.css'

export const metadata = {
  title: 'Business Dashboard',
  description: 'Manage your bookings and view analytics',
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
