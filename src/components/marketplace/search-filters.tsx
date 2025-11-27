'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'AUTOMATION_TEMPLATE', label: 'Automation Templates' },
  { value: 'AI_PROMPT_PACK', label: 'AI Prompt Packs' },
  { value: 'KEYWORD_LIST', label: 'Keyword Lists' },
  { value: 'ANALYTICS_TEMPLATE', label: 'Analytics Templates' },
  { value: 'INTEGRATION_CONFIG', label: 'Integration Configs' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'all') params.set('category', category)
    if (sort && sort !== 'newest') params.set('sort', sort)
    
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setSort('newest')
    router.push('?')
  }

  const hasFilters = search || category !== 'all' || sort !== 'newest'

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3352CC] to-[#5577FF] rounded-2xl blur opacity-20"></div>
      <div className="relative border border-[#3352CC]/30 rounded-2xl p-6 bg-[#0e0e0e]/80 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3352CC]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search for automation templates, AI prompts..."
              className="pl-12 h-12 bg-[#1A1A1D]/50 border-[#3352CC]/30 rounded-xl text-white placeholder:text-[#9D9D9D] focus:border-[#3352CC] focus:ring-1 focus:ring-[#3352CC]"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-[#1A1A1D]/50 border-[#3352CC]/30 rounded-xl text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1D] border-[#3352CC]/30">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-[#3352CC]/20">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-40 h-12 bg-[#1A1A1D]/50 border-[#3352CC]/30 rounded-xl text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1D] border-[#3352CC]/30">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-[#3352CC]/20">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={applyFilters}
                className="h-12 bg-gradient-to-r from-[#3352CC] to-[#5577FF] hover:from-[#2A42B8] hover:to-[#4466EE] text-white rounded-xl px-6 shadow-lg shadow-[#3352CC]/25"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-12 rounded-xl border-[#3352CC]/50 text-[#3352CC] hover:bg-[#3352CC] hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#3352CC]/20">
            <span className="text-sm text-[#9D9D9D]">Active filters:</span>
            {search && (
              <span className="px-3 py-1 bg-[#3352CC]/20 text-[#3352CC] rounded-full text-sm">
                "{search}"
              </span>
            )}
            {category !== 'all' && (
              <span className="px-3 py-1 bg-[#3352CC]/20 text-[#3352CC] rounded-full text-sm">
                {CATEGORIES.find(c => c.value === category)?.label}
              </span>
            )}
            {sort !== 'newest' && (
              <span className="px-3 py-1 bg-[#3352CC]/20 text-[#3352CC] rounded-full text-sm">
                {SORT_OPTIONS.find(s => s.value === sort)?.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
