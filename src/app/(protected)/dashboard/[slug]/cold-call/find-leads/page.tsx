'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Building2, 
  Star,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

const businessCategories = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'salon', label: 'Hair Salons & Barbers' },
  { value: 'plumber', label: 'Plumbers' },
  { value: 'electrician', label: 'Electricians' },
  { value: 'dentist', label: 'Dentists' },
  { value: 'gym', label: 'Gyms & Fitness' },
  { value: 'auto_repair', label: 'Auto Repair' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'bakery', label: 'Bakeries' },
  { value: 'cafe', label: 'Cafes & Coffee Shops' },
  { value: 'spa', label: 'Spas & Wellness' },
]

type Lead = {
  id: string
  businessName: string
  category: string
  address: string
  city: string
  state: string
  country: string
  phone: string | null
  email: string | null
  website: string | null
  rating: number | null
  reviewCount: number | null
  googleMapsUrl: string | null
}

export default function FindLeadsPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('United States')
  const [category, setCategory] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null)
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set())

  const handleSearch = async () => {
    if (!city || !category) {
      toast.error('Please fill in city and category')
      return
    }

    setIsSearching(true)
    setLeads([])

    try {
      const response = await fetch('/api/cold-call/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, country, category }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show specific error messages based on status
        if (response.status === 401) {
          toast.error('API key issue: ' + data.error)
        } else if (response.status === 429) {
          toast.error('Rate limited. Please wait a moment.')
        } else if (response.status === 402) {
          toast.error('API credits exhausted. Check your Firecrawl account.')
        } else {
          toast.error(data.error || 'Search failed')
        }
        return
      }

      setLeads(data.leads || [])
      
      // Log debug info
      if (data.debug) {
        console.log('Search debug:', data.debug)
      }
      
      if (data.leads?.length === 0) {
        toast.info('No leads found. Try a different city or category.')
      } else {
        toast.success(`Found ${data.leads.length} potential leads!`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveLead = async (lead: Lead) => {
    setSavingLeadId(lead.id)

    try {
      const response = await fetch('/api/cold-call/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save lead')
      }

      setSavedLeads(prev => new Set(Array.from(prev).concat(lead.id)))
      toast.success(`${lead.businessName} saved to your leads!`)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save lead')
    } finally {
      setSavingLeadId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/cold-call`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Find Leads</h1>
          <p className="text-muted-foreground">
            Discover businesses without websites in any location
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card className="p-6 bg-background/50 border-border/50">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                placeholder="e.g. Los Angeles"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="country"
                placeholder="e.g. United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Type</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Leads
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Found {leads.length} businesses without websites
            </h2>
            <span className="text-sm text-muted-foreground">
              Click + to save to your leads
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <Card 
                key={lead.id} 
                className="p-5 bg-background/50 border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{lead.businessName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {lead.category.replace('_', ' ')}
                    </p>
                  </div>
                  
                  {savedLeads.has(lead.id) ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full shrink-0"
                      onClick={() => handleSaveLead(lead)}
                      disabled={savingLeadId === lead.id}
                    >
                      {savingLeadId === lead.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{lead.address || `${lead.city}, ${lead.country}`}</span>
                  </div>

                  {lead.rating && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
                      <span>{lead.rating} ({lead.reviewCount} reviews)</span>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}

                  {lead.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="text-orange-500 font-medium">No website</span>
                  </div>
                </div>

                {lead.googleMapsUrl && (
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Google Maps
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && leads.length === 0 && (
        <Card className="p-12 bg-background/50 border-border/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No leads yet</h3>
              <p className="text-muted-foreground">
                Enter a city and business type to find potential clients
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
