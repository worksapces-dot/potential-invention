'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield
} from 'lucide-react'

export type DigitalFile = {
  id: string
  name: string
  type: 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'document'
  size: number
  downloadUrl?: string
  previewUrl?: string
  downloadCount: number
  maxDownloads?: number
  expiresAt?: string
  status: 'ready' | 'processing' | 'expired' | 'error'
}

type Props = {
  files: DigitalFile[]
  purchaseId: string
  onDownload: (fileId: string) => Promise<void>
  className?: string
}

const FILE_ICONS = {
  pdf: FileText,
  image: Image,
  video: Video,
  audio: Music,
  archive: Archive,
  document: FileText
}

const FILE_COLORS = {
  pdf: 'text-red-500',
  image: 'text-green-500',
  video: 'text-blue-500',
  audio: 'text-purple-500',
  archive: 'text-orange-500',
  document: 'text-gray-500'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime()
  const expiry = new Date(expiresAt).getTime()
  const diff = expiry - now

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
  return 'Less than 1 hour left'
}

export default function DigitalDelivery({ 
  files, 
  purchaseId, 
  onDownload,
  className 
}: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})

  const handleDownload = async (fileId: string) => {
    setDownloading(fileId)
    setDownloadProgress(prev => ({ ...prev, [fileId]: 0 }))

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev[fileId] || 0
          if (current >= 100) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [fileId]: current + 10 }
        })
      }, 200)

      await onDownload(fileId)
      
      setTimeout(() => {
        setDownloading(null)
        setDownloadProgress(prev => ({ ...prev, [fileId]: 100 }))
      }, 2000)
    } catch (error) {
      console.error('Download failed:', error)
      setDownloading(null)
    }
  }

  if (files.length === 0) {
    return (
      <Card className={`bg-[#0e0e0e]/50 border-[#3352CC]/20 ${className}`}>
        <CardContent className="text-center py-12">
          <Download className="h-12 w-12 mx-auto mb-4 text-[#9D9D9D]" />
          <h3 className="text-lg font-semibold mb-2">No Digital Files</h3>
          <p className="text-[#9D9D9D]">This product doesn't include any digital downloads.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Digital Downloads</h3>
          <p className="text-[#9D9D9D]">Access your purchased files</p>
        </div>
        
        <Badge className="bg-[#3352CC]/20 text-[#3352CC]">
          {files.filter(f => f.status === 'ready').length} / {files.length} Ready
        </Badge>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">Secure Downloads</p>
            <p className="text-blue-400">
              Your download links are encrypted and expire after a certain time for security. 
              Download limits may apply.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => {
          const Icon = FILE_ICONS[file.type]
          const isExpired = file.expiresAt && new Date(file.expiresAt) < new Date()
          const isDownloading = downloading === file.id
          const progress = downloadProgress[file.id] || 0
          
          return (
            <Card 
              key={file.id} 
              className={`bg-[#0e0e0e]/50 border-[#3352CC]/20 ${
                file.status === 'ready' && !isExpired ? 'hover:border-[#3352CC]/40' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-[#1A1A1D] ${FILE_COLORS[file.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {file.name}
                      </CardTitle>
                      <p className="text-xs text-[#9D9D9D] mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'ready' && !isExpired && (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Ready
                      </Badge>
                    )}
                    
                    {file.status === 'processing' && (
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    
                    {(file.status === 'expired' || isExpired) && (
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                    
                    {file.status === 'error' && (
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Download Progress */}
                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Downloading...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Download Info */}
                <div className="flex items-center justify-between text-sm text-[#9D9D9D]">
                  <div className="flex items-center gap-4">
                    {file.maxDownloads && (
                      <span>
                        {file.downloadCount} / {file.maxDownloads} downloads
                      </span>
                    )}
                    
                    {file.expiresAt && !isExpired && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(file.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(file.id)}
                    disabled={
                      file.status !== 'ready' || 
                      !!isExpired || 
                      isDownloading ||
                      !!(file.maxDownloads && file.downloadCount >= file.maxDownloads)
                    }
                    className="flex-1 rounded-full bg-[#3352CC] hover:bg-[#3352CC]/80 disabled:opacity-50"
                    size="sm"
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                  
                  {file.previewUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#3352CC]/40 hover:border-[#3352CC]"
                      onClick={() => window.open(file.previewUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Download Limit Warning */}
                {file.maxDownloads && file.downloadCount >= file.maxDownloads && (
                  <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
                    Download limit reached. Contact support if you need additional downloads.
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bulk Download */}
      {files.filter(f => f.status === 'ready' && (!f.expiresAt || new Date(f.expiresAt) > new Date())).length > 1 && (
        <Card className="bg-[#0e0e0e]/50 border-[#3352CC]/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium">Download All Files</h4>
              <p className="text-sm text-[#9D9D9D]">
                Download all available files as a single archive
              </p>
            </div>
            <Button 
              className="rounded-full bg-[#3352CC] hover:bg-[#3352CC]/80"
              onClick={() => handleDownload('all')}
              disabled={downloading !== null}
            >
              <Archive className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for managing digital delivery
export function useDigitalDelivery(purchaseId: string) {
  const [files, setFiles] = useState<DigitalFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/marketplace/digital-delivery/${purchaseId}`)
        const data = await response.json()
        setFiles(data.files || [])
      } catch (error) {
        console.error('Failed to fetch digital files:', error)
      } finally {
        setLoading(false)
      }
    }

    if (purchaseId) {
      fetchFiles()
    }
  }, [purchaseId])

  const downloadFile = async (fileId: string) => {
    const response = await fetch(`/api/marketplace/digital-delivery/${purchaseId}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    })

    if (!response.ok) {
      throw new Error('Download failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = files.find(f => f.id === fileId)?.name || 'download'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    // Update download count
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, downloadCount: f.downloadCount + 1 }
        : f
    ))
  }

  return {
    files,
    loading,
    downloadFile
  }
}