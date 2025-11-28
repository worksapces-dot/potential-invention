'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Sparkles, Plus, X, Wand2, Video, AlertCircle } from 'lucide-react'
import { createVideoJob, createAndGenerateVideo, UGCVideoInput } from '@/actions/ugc-video'
import { toast } from 'sonner'

interface Props {
  onScriptGenerated: (job: any, script: any, videoUrl?: string) => void
}

export function VideoGeneratorForm({ onScriptGenerated }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [generateVideo, setGenerateVideo] = useState(false)
  const [benefits, setBenefits] = useState<string[]>([])
  const [newBenefit, setNewBenefit] = useState('')
  
  const [formData, setFormData] = useState<UGCVideoInput>({
    productName: '',
    productDescription: '',
    productBenefits: [],
    productPrice: '',
    targetAudience: '',
    brandVoice: 'energetic'
  })

  const addBenefit = () => {
    if (newBenefit.trim() && benefits.length < 5) {
      setBenefits([...benefits, newBenefit.trim()])
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productName.trim()) {
      toast.error('Please enter a product name')
      return
    }

    setIsLoading(true)
    
    try {
      const input = {
        ...formData,
        productBenefits: benefits
      }

      if (generateVideo) {
        // Generate script AND video with Sora
        toast.info('Generating script and video with AI... This may take 1-2 minutes.')
        
        const result = await createAndGenerateVideo(input)

        if (result.status === 200 && result.data) {
          const data = result.data as { job: any; script: any; videoUrl?: string; videoError?: string }
          if (data.videoError) {
            toast.warning(`Script created but video failed: ${data.videoError}`)
            onScriptGenerated(data.job, data.script)
          } else {
            toast.success('Video generated successfully!')
            onScriptGenerated(data.job, data.script, data.videoUrl)
          }
        } else if ('error' in result) {
          toast.error(result.error || 'Failed to generate')
        }
      } else {
        // Just generate script
        const result = await createVideoJob(input)

        if (result.status === 201 && result.data) {
          toast.success('Script generated successfully!')
          onScriptGenerated(result.data.job, result.data.script)
        } else {
          toast.error(result.error || 'Failed to generate script')
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Create UGC Video
        </CardTitle>
        <CardDescription>
          Generate a viral TikTok/Reels script and video for your product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              placeholder="e.g., Glow Serum, Smart Watch Pro"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Product Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe what your product does..."
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              className="bg-background min-h-[80px]"
            />
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label>Key Benefits (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a benefit..."
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                className="bg-background"
              />
              <Button type="button" variant="outline" size="icon" onClick={addBenefit}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {benefit}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeBenefit(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="e.g., $29.99"
                value={formData.productPrice}
                onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                className="bg-background"
              />
            </div>

            {/* Brand Voice */}
            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <Select 
                value={formData.brandVoice} 
                onValueChange={(value) => setFormData({ ...formData, brandVoice: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energetic">🔥 Energetic</SelectItem>
                  <SelectItem value="casual">😎 Casual</SelectItem>
                  <SelectItem value="professional">💼 Professional</SelectItem>
                  <SelectItem value="luxury">✨ Luxury</SelectItem>
                  <SelectItem value="funny">😂 Funny</SelectItem>
                  <SelectItem value="authentic">💯 Authentic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., Women 18-35 interested in skincare"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Generate Video Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Generate AI Video (Veo 3)</p>
                <p className="text-xs text-muted-foreground">
                  Create actual video with AI actors & voice
                </p>
              </div>
            </div>
            <Switch
              checked={generateVideo}
              onCheckedChange={setGenerateVideo}
            />
          </div>

          {generateVideo && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <p className="text-xs text-yellow-500">
                Video generation uses Google Veo 3. Requires GOOGLE_AI_API_KEY. 
                If not available, only the script will be generated.
              </p>
            </div>
          )}

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#3352CC] to-[#5577FF]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generateVideo ? 'Generating Video...' : 'Generating Script...'}
              </>
            ) : (
              <>
                {generateVideo ? (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Script + Video
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Script Only
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
