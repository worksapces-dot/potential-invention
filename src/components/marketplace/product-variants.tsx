'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Shield,
  Download,
  Users,
  Clock
} from 'lucide-react'

export type ProductVariant = {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  features: string[]
  popular?: boolean
  recommended?: boolean
  badge?: string
  limits?: {
    downloads?: number
    users?: number
    support?: string
    updates?: string
  }
}

type Props = {
  variants: ProductVariant[]
  selectedVariant: string
  onVariantChange: (variantId: string) => void
  className?: string
}

export default function ProductVariants({ 
  variants, 
  selectedVariant, 
  onVariantChange,
  className 
}: Props) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  if (variants.length <= 1) return null

  const selected = variants.find(v => v.id === selectedVariant) || variants[0]

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Choose Your Plan</h3>
          <p className="text-[#9D9D9D]">Select the perfect variant for your needs</p>
        </div>
        
        <div className="flex bg-[#1A1A1D] rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={viewMode === 'cards' ? 'bg-[#3352CC]' : ''}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-[#3352CC]' : ''}
          >
            Compare
          </Button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <Card 
              key={variant.id}
              className={`relative cursor-pointer transition-all ${
                selectedVariant === variant.id
                  ? 'border-[#3352CC] bg-[#3352CC]/5 shadow-lg shadow-[#3352CC]/20'
                  : 'border-[#3352CC]/20 hover:border-[#3352CC]/40 bg-[#0e0e0e]/50'
              }`}
              onClick={() => onVariantChange(variant.id)}
            >
              {variant.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {variant.recommended && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Crown className="mr-1 h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  {variant.name}
                  {variant.badge && (
                    <Badge variant="outline" className="text-xs">
                      {variant.badge}
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-[#3352CC]">
                      ${(variant.price / 100).toFixed(2)}
                    </span>
                    {variant.originalPrice && variant.originalPrice > variant.price && (
                      <span className="text-lg text-[#9D9D9D] line-through">
                        ${(variant.originalPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-[#9D9D9D]">{variant.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Limits */}
                {variant.limits && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-[#1A1A1D] rounded-lg">
                    {variant.limits.downloads && (
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4 text-[#3352CC]" />
                        <span>{variant.limits.downloads} downloads</span>
                      </div>
                    )}
                    {variant.limits.users && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-[#3352CC]" />
                        <span>{variant.limits.users} users</span>
                      </div>
                    )}
                    {variant.limits.support && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-[#3352CC]" />
                        <span>{variant.limits.support}</span>
                      </div>
                    )}
                    {variant.limits.updates && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#3352CC]" />
                        <span>{variant.limits.updates}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  {variant.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full rounded-full ${
                    selectedVariant === variant.id
                      ? 'bg-[#3352CC] hover:bg-[#3352CC]/80'
                      : 'bg-[#1A1A1D] hover:bg-[#3352CC] border border-[#3352CC]/40'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onVariantChange(variant.id)
                  }}
                >
                  {selectedVariant === variant.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Comparison Table */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#3352CC]/20">
                <th className="text-left p-4 font-medium">Features</th>
                {variants.map(variant => (
                  <th key={variant.id} className="text-center p-4 min-w-[200px]">
                    <div className="space-y-2">
                      <div className="font-bold">{variant.name}</div>
                      <div className="text-2xl font-bold text-[#3352CC]">
                        ${(variant.price / 100).toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        className={`rounded-full ${
                          selectedVariant === variant.id
                            ? 'bg-[#3352CC]'
                            : 'bg-[#1A1A1D] border border-[#3352CC]/40'
                        }`}
                        onClick={() => onVariantChange(variant.id)}
                      >
                        {selectedVariant === variant.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Extract all unique features */}
              {Array.from(new Set(variants.flatMap(v => v.features))).map(feature => (
                <tr key={feature} className="border-b border-[#3352CC]/10">
                  <td className="p-4 text-sm">{feature}</td>
                  {variants.map(variant => (
                    <td key={variant.id} className="p-4 text-center">
                      {variant.features.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[#9D9D9D]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Limits comparison */}
              <tr className="border-b border-[#3352CC]/10">
                <td className="p-4 text-sm font-medium">Downloads</td>
                {variants.map(variant => (
                  <td key={variant.id} className="p-4 text-center text-sm">
                    {variant.limits?.downloads || '∞'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-[#3352CC]/10">
                <td className="p-4 text-sm font-medium">Users</td>
                {variants.map(variant => (
                  <td key={variant.id} className="p-4 text-center text-sm">
                    {variant.limits?.users || '∞'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-[#3352CC]/10">
                <td className="p-4 text-sm font-medium">Support</td>
                {variants.map(variant => (
                  <td key={variant.id} className="p-4 text-center text-sm">
                    {variant.limits?.support || 'Standard'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Selector */}
      <div className="md:hidden">
        <Select value={selectedVariant} onValueChange={onVariantChange}>
          <SelectTrigger className="bg-[#1A1A1D] border-[#3352CC]/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {variants.map(variant => (
              <SelectItem key={variant.id} value={variant.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{variant.name}</span>
                  <span className="ml-4 font-bold text-[#3352CC]">
                    ${(variant.price / 100).toFixed(2)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Hook for managing variant selection
export function useProductVariants(variants: ProductVariant[]) {
  const [selectedVariant, setSelectedVariant] = useState(
    variants.find(v => v.recommended)?.id || 
    variants.find(v => v.popular)?.id || 
    variants[0]?.id || ''
  )

  const currentVariant = variants.find(v => v.id === selectedVariant)

  return {
    selectedVariant,
    setSelectedVariant,
    currentVariant
  }
}