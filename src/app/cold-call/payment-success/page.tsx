'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead')

  useEffect(() => {
    // Mark deal as paid (in production, use webhook instead)
    if (leadId) {
      fetch(`/api/cold-call/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      }).catch(console.error)
    }
  }, [leadId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your website is ready for delivery.
          The seller will be in touch shortly with your files.
        </p>

        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <Link href="/">
          <Button className="w-full">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </div>
  )
}
