'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Settings,
  Calendar,
  Users,
  Copy,
  Check,
  Key,
  ImageIcon,
  Upload,
  X,
  Search,
  Sparkles,
  ExternalLink,
  Globe,
  Link2,
} from 'lucide-react'
import { SubdomainManager } from '@/components/subdomain-manager'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { toast } from 'sonner'

type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  active: boolean
}

type ClientAccess = {
  id: string
  email: string
  lastLoginAt: string | null
}

export default function LeadSettingsPage() {
  const params = useParams()
  const slug = params.slug as string
  const leadId = params.leadId as string

  const [isLoading, setIsLoading] = useState(true)
  const [websiteId, setWebsiteId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [clientAccess, setClientAccess] = useState<ClientAccess | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Service form
  const [newService, setNewService] = useState({ name: '', description: '', duration: 30, price: 0 })
  const [isAddingService, setIsAddingService] = useState(false)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)

  // Client access
  const [clientEmail, setClientEmail] = useState('')
  const [isCreatingAccess, setIsCreatingAccess] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [copied, setCopied] = useState(false)

  // Images & SEO
  const [customImages, setCustomImages] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingImages, setIsFetchingImages] = useState(false)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [isSavingSeo, setIsSavingSeo] = useState(false)

  // Subdomain
  const [subdomain, setSubdomain] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [leadId])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/cold-call/leads/${leadId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const lead = data.lead
      setBusinessName(lead.businessName)

      if (lead.generatedWebsite) {
        setWebsiteId(lead.generatedWebsite.id)
        setBookingEnabled(lead.generatedWebsite.bookingEnabled ?? true)
        setCustomImages(lead.generatedWebsite.customImages || [])
        setLogoUrl(lead.generatedWebsite.logoUrl || null)
        setSeoTitle(lead.generatedWebsite.seoTitle || '')
        setSeoDescription(lead.generatedWebsite.seoDescription || '')
        setSeoKeywords((lead.generatedWebsite.seoKeywords || []).join(', '))
        setSubdomain(lead.generatedWebsite.subdomain || null)
        if (lead.generatedWebsite.clientAccess) setClientAccess(lead.generatedWebsite.clientAccess)

        const servicesRes = await fetch(`/api/cold-call/services?websiteId=${lead.generatedWebsite.id}`)
        const servicesData = await servicesRes.json()
        if (servicesRes.ok) setServices(servicesData.services || [])
      }
    } catch { toast.error('Failed to load settings') }
    finally { setIsLoading(false) }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const res = await fetch('/api/cold-call/generate-website', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      if (res.ok) toast.success('Website regenerated!')
      else throw new Error()
    } catch { toast.error('Failed to regenerate') }
    finally { setIsRegenerating(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file || !websiteId) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('websiteId', websiteId)
    formData.append('type', type)
    formData.append('file', file)
    try {
      const res = await fetch('/api/cold-call/website-images', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (type === 'logo') setLogoUrl(data.url)
      else setCustomImages([...customImages, data.url])
      toast.success('Uploaded!')
    } catch (err: any) { toast.error(err.message || 'Upload failed') }
    finally { setIsUploading(false) }
  }

  const handleDeleteImage = async (url: string, type: 'logo' | 'gallery') => {
    if (!websiteId) return
    try {
      await fetch('/api/cold-call/website-images', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, imageUrl: url, type }),
      })
      if (type === 'logo') setLogoUrl(null)
      else setCustomImages(customImages.filter(u => u !== url))
      toast.success('Removed')
    } catch { toast.error('Failed') }
  }

  const handleAutoFetchImages = async () => {
    setIsFetchingImages(true)
    try {
      const res = await fetch('/api/cold-call/fetch-images', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (data.images?.length) {
        setCustomImages(prev => Array.from(new Set([...prev, ...data.images])).slice(0, 6))
        toast.success(`Added ${data.images.length} images!`)
      }
    } catch { toast.error('Failed') }
    finally { setIsFetchingImages(false) }
  }

  const handleSaveSeo = async () => {
    if (!websiteId) return
    setIsSavingSeo(true)
    try {
      await fetch('/api/cold-call/website-seo', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, seoTitle, seoDescription, seoKeywords: seoKeywords.split(',').map(k => k.trim()).filter(Boolean) }),
      })
      toast.success('SEO saved!')
    } catch { toast.error('Failed') }
    finally { setIsSavingSeo(false) }
  }

  const handleAddService = async () => {
    if (!websiteId || !newService.name) return
    setIsAddingService(true)
    try {
      const res = await fetch('/api/cold-call/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, ...newService, price: Math.round(newService.price * 100) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setServices([...services, data.service])
      setNewService({ name: '', description: '', duration: 30, price: 0 })
      setServiceDialogOpen(false)
      toast.success('Added!')
    } catch (err: any) { toast.error(err.message) }
    finally { setIsAddingService(false) }
  }

  const handleDeleteService = async (id: string) => {
    try {
      await fetch(`/api/cold-call/services/${id}`, { method: 'DELETE' })
      setServices(services.filter(s => s.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const handleCreateClientAccess = async () => {
    if (!websiteId || !clientEmail) return
    setIsCreatingAccess(true)
    try {
      const res = await fetch('/api/cold-call/client-auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', websiteId, email: clientEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientAccess({ id: data.clientAccess.id, email: clientEmail, lastLoginAt: null })
      setTempPassword(data.tempPassword)
      toast.success('Access created!')
    } catch (err: any) { toast.error(err.message) }
    finally { setIsCreatingAccess(false) }
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Dashboard: ${window.location.origin}/client/${websiteId}/login\nEmail: ${clientEmail || clientAccess?.email}\nPassword: ${tempPassword}`)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

  if (!websiteId) return (
    <div className="p-6"><Card className="p-12 text-center">
      <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg">No Website Generated</h3>
      <p className="text-muted-foreground mb-4">Generate a website first</p>
      <Link href={`/dashboard/${slug}/cold-call/leads/${leadId}`}><Button>Go Back</Button></Link>
    </Card></div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${slug}/cold-call/leads/${leadId}`}>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{businessName}</h1>
                <p className="text-sm text-muted-foreground">Website Settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/cold-call/preview/${websiteId}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
                {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-background">
              <Globe className="h-4 w-4 mr-2" />General
            </TabsTrigger>
            <TabsTrigger value="domain" className="data-[state=active]:bg-background">
              <Link2 className="h-4 w-4 mr-2" />Domain
            </TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-background">
              <Calendar className="h-4 w-4 mr-2" />Booking
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-background">
              <ImageIcon className="h-4 w-4 mr-2" />Images
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-background">
              <Search className="h-4 w-4 mr-2" />SEO
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-background">
              <Users className="h-4 w-4 mr-2" />Client Access
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Website Status</h3>
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 font-medium">Live</span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">/cold-call/preview/{websiteId?.slice(0, 8)}...</code>
              </div>
              {subdomain && (
                <div className="mt-4 flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-500 font-medium">Custom Domain Active</span>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{subdomain}.{process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'}</code>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-2">Custom Subdomain</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Give your client a professional, memorable URL instead of a long preview link.
              </p>
              <SubdomainManager
                websiteId={websiteId!}
                currentSubdomain={subdomain}
                onSubdomainChange={setSubdomain}
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-2">Preview Link</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The default preview link always works, even without a custom subdomain.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <code className="text-xs flex-1 truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/cold-call/preview/{websiteId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/cold-call/preview/${websiteId}`)
                    toast.success('Copied!')
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium">Online Booking</h3>
                  <p className="text-sm text-muted-foreground">Allow customers to book appointments</p>
                </div>
                <Switch checked={bookingEnabled} onCheckedChange={setBookingEnabled} />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Services</h4>
                  <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div><Label>Name *</Label><Input placeholder="e.g. Consultation" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} /></div>
                        <div><Label>Description</Label><Input placeholder="Brief description" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Duration (min)</Label><Input type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value) || 30})} /></div>
                          <div><Label>Price ($)</Label><Input type="number" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value) || 0})} /></div>
                        </div>
                        <Button className="w-full" onClick={handleAddService} disabled={isAddingService || !newService.name}>
                          {isAddingService && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Service
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No services yet</div>
                ) : (
                  <div className="space-y-2">
                    {services.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration}min {s.price > 0 && `• $${(s.price/100).toFixed(2)}`}</p></div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="font-medium">Website Images</h3><p className="text-sm text-muted-foreground">Upload or add stock photos</p></div>
                <Button variant="outline" size="sm" onClick={handleAutoFetchImages} disabled={isFetchingImages || customImages.length >= 6}>
                  {isFetchingImages ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}Add Stock Photos
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm mb-2 block">Logo</Label>
                  {logoUrl ? (
                    <div className="relative inline-block"><img src={logoUrl} alt="Logo" className="h-16 rounded-lg border" /><button onClick={() => handleDeleteImage(logoUrl, 'logo')} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>
                  ) : (
                    <label className="flex items-center justify-center w-32 h-16 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo')} disabled={isUploading} />
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                    </label>
                  )}
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Gallery ({customImages.length}/6)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {customImages.map((url, i) => (
                      <div key={url} className="relative aspect-video group">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => handleDeleteImage(url, 'gallery')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                        {i === 0 && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">Hero</span>}
                        {i === 1 && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">About</span>}
                      </div>
                    ))}
                    {customImages.length < 6 && (
                      <label className="aspect-video flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} disabled={isUploading} />
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Click &quot;Regenerate&quot; after adding images to apply changes.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-6">Search Engine Optimization</h3>
              <div className="space-y-4">
                <div><Label>Page Title</Label><Input placeholder={`${businessName} | Services`} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} /><p className="text-xs text-muted-foreground mt-1">{seoTitle.length}/60</p></div>
                <div><Label>Meta Description</Label><Textarea placeholder="Brief description for search results..." value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} /><p className="text-xs text-muted-foreground mt-1">{seoDescription.length}/160</p></div>
                <div><Label>Keywords</Label><Input placeholder="keyword1, keyword2, keyword3" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} /></div>
                <Button onClick={handleSaveSeo} disabled={isSavingSeo}>{isSavingSeo && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save SEO Settings</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Client Access Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-2">Client Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-6">Give your client access to view bookings and analytics</p>

              {clientAccess ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-500 mb-2"><Check className="h-4 w-4" /><span className="font-medium">Access Active</span></div>
                    <p className="text-sm">{clientAccess.email}</p>
                  </div>
                  {tempPassword && (
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-500 mb-2"><Key className="h-4 w-4" /><span className="font-medium">Temporary Password</span></div>
                      <code className="block bg-background p-2 rounded text-sm mb-3 font-mono">{tempPassword}</code>
                      <Button size="sm" variant="outline" onClick={copyCredentials}>{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}Copy Credentials</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div><Label>Client Email</Label><Input type="email" placeholder="client@business.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} /></div>
                  <Button onClick={handleCreateClientAccess} disabled={isCreatingAccess || !clientEmail}>{isCreatingAccess ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}Create Access</Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
