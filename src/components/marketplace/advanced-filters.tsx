'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Filter, 
  X, 
  Star, 
  Calendar, 
  DollarSign,
  Tag,
  User,
  Clock
} from 'lucide-react'

export type FilterState = {
  priceRange: [number, number]
  categories: string[]
  rating: number
  dateRange: string
  sortBy: string
  availability: string[]
  seller: string
  tags: string[]
}

type Props = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categories: string[]
  sellers: Array<{ id: string; name: string }>
  className?: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'sales', label: 'Best Selling' }
]

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' }
]

const AVAILABILITY_OPTIONS = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'digital', label: 'Digital Download' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'free', label: 'Free Products' }
]

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  sellers,
  className 
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      categories: [],
      rating: 0,
      dateRange: 'all',
      sortBy: 'newest',
      availability: [],
      seller: '',
      tags: []
    })
  }

  const activeFiltersCount = [
    filters.categories.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
    filters.rating > 0,
    filters.dateRange !== 'all',
    filters.availability.length > 0,
    filters.seller !== '',
    filters.tags.length > 0
  ].filter(Boolean).length

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full border-[#3352CC]/40 hover:border-[#3352CC] relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                className="ml-2 bg-[#3352CC] text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-[400px] sm:w-[540px] bg-[#0A0A0A] border-[#3352CC]/20">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#9D9D9D] hover:text-white"
                >
                  Clear All
                </Button>
              )}
            </SheetTitle>
            <SheetDescription>
              Refine your search with advanced filtering options
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Sort By */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sort By
              </Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                <SelectTrigger className="bg-[#1A1A1D] border-[#3352CC]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[#9D9D9D] mt-2">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ categories: [...filters.categories, category] })
                        } else {
                          updateFilters({ categories: filters.categories.filter(c => c !== category) })
                        }
                      }}
                      className="border-[#3352CC]"
                    />
                    <Label htmlFor={category} className="text-sm capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Minimum Rating
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    variant={filters.rating >= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ rating: filters.rating === rating ? 0 : rating })}
                    className={`w-10 h-10 p-0 ${
                      filters.rating >= rating 
                        ? 'bg-[#3352CC] hover:bg-[#3352CC]/80' 
                        : 'border-[#3352CC]/40 hover:border-[#3352CC]'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                  </Button>
                ))}
                <span className="text-sm text-[#9D9D9D] ml-2">
                  {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                </span>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Added
              </Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
                <SelectTrigger className="bg-[#1A1A1D] border-[#3352CC]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <Label>Availability</Label>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={filters.availability.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ availability: [...filters.availability, option.value] })
                        } else {
                          updateFilters({ availability: filters.availability.filter(a => a !== option.value) })
                        }
                      }}
                      className="border-[#3352CC]"
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller */}
            {sellers.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Seller
                </Label>
                <Select value={filters.seller} onValueChange={(value) => updateFilters({ seller: value })}>
                  <SelectTrigger className="bg-[#1A1A1D] border-[#3352CC]/20">
                    <SelectValue placeholder="Any seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any seller</SelectItem>
                    {sellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="mt-8 pt-6 border-t border-[#3352CC]/20">
            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#3352CC] hover:bg-[#3352CC]/80 rounded-full"
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.categories.map(category => (
            <Badge 
              key={category} 
              variant="secondary" 
              className="bg-[#3352CC]/20 text-[#3352CC] hover:bg-[#3352CC]/30"
            >
              {category}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  categories: filters.categories.filter(c => c !== category) 
                })}
              />
            </Badge>
          ))}
          
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <Badge variant="secondary" className="bg-[#3352CC]/20 text-[#3352CC]">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ priceRange: [0, 1000] })}
              />
            </Badge>
          )}
          
          {filters.rating > 0 && (
            <Badge variant="secondary" className="bg-[#3352CC]/20 text-[#3352CC]">
              {filters.rating}+ stars
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ rating: 0 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}