'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Package, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  product: any
  slug: string
}

const CATEGORIES = [
  { value: 'AUTOMATION_TEMPLATE', label: 'Automation Template' },
  { value: 'AI_PROMPT_PACK', label: 'AI Prompt Pack' },
  { value: 'KEYWORD_LIST', label: 'Keyword List' },
  { value: 'ANALYTICS_TEMPLATE', label: 'Analytics Template' },
  { value: 'INTEGRATION_CONFIG', label: 'Integration Config' },
]

export default function EditProductForm({ product, slug }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: (product.price / 100).toString(),
    category: product.category,
    active: product.active,
    content: JSON.stringify(product.content, null, 2),
  })

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

    let parsedContent
    try {
      parsedContent = formData.content ? JSON.parse(formData.content) : {}
    } catch (error) {
      toast.error('Invalid JSON in content field')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/marketplace/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: price,
          category: formData.category,
          active: formData.active,
          content: parsedContent,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Product updated successfully!')
      router.push(`/dashboard/${slug}/marketplace/sell`)
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/marketplace/products/${product.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Product deleted successfully!')
      router.push(`/dashboard/${slug}/marketplace/sell`)
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
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
              placeholder="Describe what your product does and what buyers will get..."
              rows={5}
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

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Product is active and visible in marketplace</Label>
          </div>
        </div>
      </div>

      <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-xl font-bold mb-4">Product Content (JSON)</h2>
        <p className="text-sm text-[#9D9D9D] mb-4">
          Update your automation configuration, prompts, or template data as JSON
        </p>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder='{"triggers": [], "actions": [], "prompts": []}'
          rows={10}
          className="font-mono text-sm bg-[#0e0e0e] border-[#3352CC]/30"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
        >
          Cancel
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1A1A1D] border-[#3352CC]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-br text-white rounded-full from-[#3352CC] to-[#1C2D70] hover:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Product'}
        </Button>
      </div>
    </form>
  )
}