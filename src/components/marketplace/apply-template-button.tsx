'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
  purchaseId: string
}

export function ApplyTemplateButton({ purchaseId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApply = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/apply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Template applied to your account!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to apply template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleApply}
      disabled={loading}
      size="sm"
      className="bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Apply to Account
        </>
      )}
    </Button>
  )
}
