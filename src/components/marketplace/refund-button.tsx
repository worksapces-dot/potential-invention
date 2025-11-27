'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Props = {
  purchaseId: string
  productName: string
  refundableUntil: string
}

export function RefundButton({ purchaseId, productName, refundableUntil }: Props) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const isRefundable = new Date() < new Date(refundableUntil)

  if (!isRefundable) {
    return null
  }

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, reason }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Refund request submitted successfully!')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to request refund')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Request Refund
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#1A1A1D] border-[#3352CC]">
        <AlertDialogHeader>
          <AlertDialogTitle>Request Refund</AlertDialogTitle>
          <AlertDialogDescription>
            You're requesting a refund for "{productName}". Please provide a reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for refund *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're requesting a refund..."
              rows={4}
              className="mt-2 bg-[#0e0e0e] border-[#3352CC]/30"
            />
          </div>
          <p className="text-sm text-[#9D9D9D]">
            Refunds are processed within 5-7 business days. You have until{' '}
            {new Date(refundableUntil).toLocaleDateString()} to request a refund.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRefund}
            disabled={loading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Refund'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}