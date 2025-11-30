'use client'

import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Crown, Zap, Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

const proFeatures = [
  'Unlimited automations',
  'AI-powered smart replies',
  'Cold outreach & lead finder',
  'Advanced analytics',
  'Priority support',
]

export default function UpgradeModal({ isOpen, onClose, feature = 'this feature' }: Props) {
  const router = useRouter()

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/payment')
      const data = await response.json()
      if (data.session_url) {
        router.push(data.session_url)
      }
    } catch (error) {
      console.error('Failed to create checkout:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-base">
            Unlock {feature} and supercharge your Instagram growth
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-3">
          {proFeatures.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-muted p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Cancel anytime</p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold h-12"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
