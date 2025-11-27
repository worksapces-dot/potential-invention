'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FeatureCategory } from '@prisma/client'
import { createFeatureRequest } from '@/actions/feedback'
import { toast } from 'sonner'
import { Lightbulb, Loader2 } from 'lucide-react'

interface CreateFeatureModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateFeatureModal = ({ open, onClose, onSuccess }: CreateFeatureModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as FeatureCategory | ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await createFeatureRequest({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category
      })

      if (result.status === 200) {
        toast.success('Feature request created successfully!')
        setFormData({ title: '', description: '', category: '' })
        onSuccess()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to create feature request')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case 'AUTOMATION': return '🤖'
      case 'INTEGRATIONS': return '🔗'
      case 'UI_UX': return '🎨'
      case 'ANALYTICS': return '📊'
      case 'MARKETPLACE': return '🛒'
      case 'MOBILE_APP': return '📱'
      case 'API': return '⚡'
      case 'SECURITY': return '🔒'
      case 'PERFORMANCE': return '⚡'
      default: return '💡'
    }
  }

  const getCategoryDescription = (category: FeatureCategory) => {
    switch (category) {
      case 'AUTOMATION': return 'Instagram DM automation, triggers, workflows'
      case 'INTEGRATIONS': return 'Third-party app connections, APIs'
      case 'UI_UX': return 'User interface improvements, design changes'
      case 'ANALYTICS': return 'Reports, metrics, data visualization'
      case 'MARKETPLACE': return 'Template store, buying/selling features'
      case 'MOBILE_APP': return 'Mobile app features and improvements'
      case 'API': return 'Developer API, webhooks, integrations'
      case 'SECURITY': return 'Security features, privacy, compliance'
      case 'PERFORMANCE': return 'Speed, reliability, optimization'
      default: return 'General features and improvements'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background-80 border-in-active/50">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-light-blue" />
            Request a New Feature
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Share your idea for improving Slide. The community will vote on the best features!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Feature Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Add bulk message scheduling"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background-90 border-in-active/50 text-white"
              maxLength={100}
            />
            <p className="text-xs text-text-secondary">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">
              Category *
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as FeatureCategory }))}>
              <SelectTrigger className="bg-background-90 border-in-active/50">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FeatureCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <div>
                        <div className="font-medium">{category.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCategoryDescription(category)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your feature idea in detail. What problem does it solve? How would it work?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-background-90 border-in-active/50 text-white min-h-[120px]"
              maxLength={1000}
            />
            <p className="text-xs text-text-secondary">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Tips */}
          <div className="bg-light-blue/5 border border-light-blue/20 rounded-lg p-4">
            <h4 className="text-light-blue font-medium mb-2">💡 Tips for a great feature request:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Be specific about what you want and why</li>
              <li>• Explain the problem your feature would solve</li>
              <li>• Consider how it would benefit other users</li>
              <li>• Check if similar requests already exist</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-in-active/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.category}
              className="bg-light-blue hover:bg-light-blue/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFeatureModal