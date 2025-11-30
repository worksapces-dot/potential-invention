'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Sparkles, Target, Send } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    searchMode: 'HASHTAG_MINING',
    keywords: '',
    hashtags: '',
    targetFollowers: '1K-10K',
    location: '',
    pitchStyle: 'PROBLEM_SOLVER',
    pitchTemplate: '',
    dailyLimit: 50,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/deal-finder/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
          hashtags: formData.hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      const data = await response.json()
      toast.success('Campaign created successfully!')
      router.push(`/dashboard/${slug}/deal-finder/campaigns/${data.campaign.id}`)
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error('Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/deal-finder`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new outreach campaign to find deals
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Campaign Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Find Video Editing Clients"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="searchMode">Search Mode</Label>
              <Select
                value={formData.searchMode}
                onValueChange={(value) => setFormData({ ...formData, searchMode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HASHTAG_MINING">Hashtag Mining</SelectItem>
                  <SelectItem value="PROBLEM_POSTS">Problem Posts</SelectItem>
                  <SelectItem value="LOCATION_BASED">Location Based</SelectItem>
                  <SelectItem value="COMPETITOR_FOLLOWERS">Competitor Followers</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How to find prospects on Instagram
              </p>
            </div>

            {formData.searchMode === 'HASHTAG_MINING' && (
              <div>
                <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                <Input
                  id="hashtags"
                  placeholder="e.g., contentcreator, videoediting, youtuber"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                />
              </div>
            )}

            {formData.searchMode === 'PROBLEM_POSTS' && (
              <div>
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., need video editor, looking for designer"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>
            )}

            {formData.searchMode === 'LOCATION_BASED' && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, USA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="targetFollowers">Target Follower Range</Label>
              <Select
                value={formData.targetFollowers}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetFollowers: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1K-10K">1K - 10K (Micro)</SelectItem>
                  <SelectItem value="10K-50K">10K - 50K (Small)</SelectItem>
                  <SelectItem value="50K-100K">50K - 100K (Medium)</SelectItem>
                  <SelectItem value="100K+">100K+ (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Pitch Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Send className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Pitch Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pitchStyle">Pitch Style</Label>
              <Select
                value={formData.pitchStyle}
                onValueChange={(value) => setFormData({ ...formData, pitchStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROBLEM_SOLVER">Problem Solver</SelectItem>
                  <SelectItem value="SOCIAL_PROOF">Social Proof</SelectItem>
                  <SelectItem value="VALUE_FIRST">Value First</SelectItem>
                  <SelectItem value="CURIOSITY">Curiosity</SelectItem>
                  <SelectItem value="DIRECT_OFFER">Direct Offer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                AI will personalize each message in this style
              </p>
            </div>

            <div>
              <Label htmlFor="pitchTemplate">Custom Template (Optional)</Label>
              <Textarea
                id="pitchTemplate"
                placeholder="Hey {name}! Saw your post about {topic}..."
                value={formData.pitchTemplate}
                onChange={(e) =>
                  setFormData({ ...formData, pitchTemplate: e.target.value })
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will use this as inspiration and personalize for each prospect
              </p>
            </div>

            <div>
              <Label htmlFor="dailyLimit">Daily DM Limit</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="10"
                max="200"
                value={formData.dailyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Stay safe: 50-100 DMs per day recommended
              </p>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href={`/dashboard/${slug}/deal-finder`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              'Creating...'
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
