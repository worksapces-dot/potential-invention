'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Props = {
  productId: string
  purchaseId: string
}

export default function ReviewForm({ productId, purchaseId }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Review submitted!')
      setShowForm(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
      >
        <Star className="h-4 w-4 mr-2" />
        Leave a Review
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-[#9D9D9D]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Comment (optional)</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={3}
          className="bg-[#0e0e0e] border-[#3352CC]/30"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(false)}
          className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="sm"
          className="bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
        </Button>
      </div>
    </div>
  )
}
