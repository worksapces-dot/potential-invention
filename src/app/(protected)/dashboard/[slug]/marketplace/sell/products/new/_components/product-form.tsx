'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Package, Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

type Props = {
  slug: string
}

const CATEGORIES = [
  { value: 'AUTOMATION_TEMPLATE', label: 'Automation Template' },
  { value: 'AI_PROMPT_PACK', label: 'AI Prompt Pack' },
  { value: 'KEYWORD_LIST', label: 'Keyword List' },
  { value: 'ANALYTICS_TEMPLATE', label: 'Analytics Template' },
  { value: 'INTEGRATION_CONFIG', label: 'Integration Config' },
]

export default function ProductForm({ slug }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    content: '',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, WebP or GIF')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || 'Upload failed')
        return
      }

      setThumbnail(data.url)
      toast.success('Image uploaded!')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 1) {
      toast.error('Price must be at least $1.00')
      return
    }

    // Validate JSON content if provided
    let parsedContent = {}
    if (formData.content.trim()) {
      try {
        parsedContent = JSON.parse(formData.content)
      } catch (e) {
        toast.error('Invalid JSON content')
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: price,
          category: formData.category,
          content: parsedContent,
          thumbnail: thumbnail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || 'Failed to create product')
        return
      }

      toast.success('Product created!')
      router.push(`/dashboard/${slug}/marketplace/sell`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thumbnail Upload */}
      <div className="border border-[#3352CC]/30 rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#3352CC]" />
          Product Thumbnail
        </h2>
        
        <div className="flex items-start gap-6">
          {/* Preview */}
          <div 
            className="relative w-40 h-40 border-2 border-dashed border-[#3352CC]/30 rounded-xl overflow-hidden flex items-center justify-center bg-[#0e0e0e] cursor-pointer hover:border-[#3352CC]/60 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {thumbnail ? (
              <>
                <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setThumbnail('')
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </>
            ) : uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#3352CC]" />
            ) : (
              <div className="text-center p-4">
                <Upload className="h-8 w-8 mx-auto mb-2 text-[#9D9D9D]" />
                <p className="text-xs text-[#9D9D9D]">Click to upload</p>
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-[#9D9D9D] mb-3">
              Upload a thumbnail image for your product. This will be shown in the marketplace.
            </p>
            <ul className="text-xs text-[#9D9D9D] space-y-1">
              <li>• Recommended: 400x400px or larger</li>
              <li>• Formats: JPG, PNG, WebP, GIF</li>
              <li>• Max size: 5MB</li>
            </ul>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="border border-[#3352CC]/30 rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-[#3352CC]" />
          Product Details
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Instagram DM Automation Template"
              className="mt-2 bg-[#0e0e0e] border-[#3352CC]/30"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your product does..."
              rows={4}
              className="mt-2 bg-[#0e0e0e] border-[#3352CC]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9D9D9D]">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="9.99"
                  className="pl-7 bg-[#0e0e0e] border-[#3352CC]/30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-2 bg-[#0e0e0e] border-[#3352CC]/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content (Optional) */}
      <div className="border border-[#3352CC]/30 rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-lg font-bold mb-2">Product Content (Optional)</h2>
        <p className="text-sm text-[#9D9D9D] mb-4">
          Add your automation config as JSON. Leave empty if not needed.
        </p>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder='{}'
          rows={4}
          className="font-mono text-sm bg-[#0e0e0e] border-[#3352CC]/30"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 rounded-full border-[#3352CC]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 bg-gradient-to-r from-[#3352CC] to-[#5577FF] text-white rounded-full"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}