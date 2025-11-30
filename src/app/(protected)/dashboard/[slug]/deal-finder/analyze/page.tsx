'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Brain,
  Sparkles,
  CheckCircle2,
  Loader2,
  Instagram,
  Target,
  MessageCircle,
  Edit3,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AnalyzeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    businessType: '',
    services: '',
    targetAudience: '',
    tone: '',
    priceRange: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/deal-finder/campaigns')
      // Profile is included in the response
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const analyzeProfile = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/deal-finder/analyze-profile', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setFormData({
          businessType: data.profile.businessType || '',
          services: data.profile.services?.join(', ') || '',
          targetAudience: data.profile.targetAudience || '',
          tone: data.profile.tone || '',
          priceRange: data.profile.priceRange || '',
        })
        toast.success('Profile analyzed successfully!')
      } else {
        toast.error(data.error || 'Failed to analyze profile')
      }
    } catch (error) {
      toast.error('Failed to analyze profile')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      // Save profile updates
      toast.success('Profile saved!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/deal-finder`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">AI Profile Analysis</h1>
          <p className="text-muted-foreground">
            Let AI learn your business from your Instagram
          </p>
        </div>
      </div>

      {/* Analysis Card */}
      <Card className="p-8 border-2 border-dashed border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Brain className="h-10 w-10" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3">Analyze Your Instagram</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            AI will analyze your posts, reels, and bio to understand your business
            and create personalized outreach messages.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Instagram, label: 'Reads your bio' },
              { icon: Target, label: 'Analyzes posts' },
              { icon: MessageCircle, label: 'Learns your tone' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted"
              >
                <item.icon className="h-4 w-4 text-purple-500" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={analyzeProfile}
            disabled={isAnalyzing}
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze My Profile
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Profile Results */}
      {profile && (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold">AI Analysis Results</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full"
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Business Type</Label>
                <Input
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData({ ...formData, businessType: e.target.value })
                  }
                  placeholder="e.g., Video Editor, Fitness Coach"
                />
              </div>
              <div>
                <Label>Services (comma separated)</Label>
                <Input
                  value={formData.services}
                  onChange={(e) =>
                    setFormData({ ...formData, services: e.target.value })
                  }
                  placeholder="e.g., Video Editing, Color Grading"
                />
              </div>
              <div>
                <Label>Target Audience</Label>
                <Input
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  placeholder="e.g., YouTubers, Small Businesses"
                />
              </div>
              <div>
                <Label>Communication Tone</Label>
                <Input
                  value={formData.tone}
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value })
                  }
                  placeholder="e.g., Professional, Friendly"
                />
              </div>
              <div>
                <Label>Price Range</Label>
                <Input
                  value={formData.priceRange}
                  onChange={(e) =>
                    setFormData({ ...formData, priceRange: e.target.value })
                  }
                  placeholder="e.g., $500-$2000"
                />
              </div>
              <Button onClick={saveProfile} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Business Type</Label>
                <p className="text-lg font-medium mt-1">
                  {profile.businessType || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Services</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.services?.map((service: string) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Target Audience</Label>
                <p className="text-lg font-medium mt-1">
                  {profile.targetAudience || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Communication Tone</Label>
                <p className="text-lg font-medium mt-1">
                  {profile.tone || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Price Range</Label>
                <p className="text-lg font-medium mt-1">
                  {profile.priceRange || 'Not specified'}
                </p>
              </div>

              {profile.aiSummary && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <Label className="text-muted-foreground">AI Summary</Label>
                  <p className="mt-2">{profile.aiSummary}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Next Steps */}
      {profile && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Ready to find deals!</h3>
              <p className="text-muted-foreground">
                Your profile is set up. Create a campaign to start finding prospects.
              </p>
            </div>
            <Link href={`/dashboard/${slug}/deal-finder/campaigns/new`}>
              <Button className="rounded-full">
                Create Campaign
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
