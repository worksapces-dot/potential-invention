'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

type Props = {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [] }: Props) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length + images.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed')
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB')
          continue
        }

        // For demo purposes, create a data URL
        // In production, upload to your storage service (AWS S3, Cloudinary, etc.)
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })

        newImages.push(dataUrl)
      }

      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      
      if (newImages.length > 0) {
        toast.success(`${newImages.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onImagesChange])

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-4">
      <Label>Product Images ({images.length}/{maxImages})</Label>
      
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[#3352CC]/30 rounded-xl p-8 text-center hover:border-[#3352CC]/50 transition-colors bg-[#0e0e0e]/50"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-[#3352CC]/10 rounded-full">
            <Upload className="h-8 w-8 text-[#3352CC]" />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
            <p className="text-sm text-[#9D9D9D]">
              PNG, JPG, GIF up to 5MB each. Max {maxImages} images.
            </p>
          </div>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={uploading || images.length >= maxImages}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading || images.length >= maxImages}
            className="rounded-full border-[#3352CC] text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ImageIcon className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Choose Images'}
          </Button>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-[#3352CC]/30">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-[#3352CC] text-white text-xs px-2 py-1 rounded-full">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}