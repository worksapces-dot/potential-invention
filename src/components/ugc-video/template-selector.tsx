'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  Package, 
  Zap,
  Crown
} from 'lucide-react'
import { getVideoTemplates } from '@/actions/ugc-video'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string
  category: string
  hook_template: string
  cta_template: string
  usage_count: number
  is_premium: boolean
}

interface Props {
  onSelectTemplate: (template: Template) => void
  selectedTemplateId?: string
}

const categoryIcons: Record<string, any> = {
  product_review: Star,
  problem_solution: Zap,
  unboxing: Package,
  transformation: TrendingUp,
  lifestyle: Sparkles
}

const categoryLabels: Record<string, string> = {
  product_review: 'Product Review',
  problem_solution: 'Problem/Solution',
  unboxing: 'Unboxing',
  transformation: 'Before/After',
  lifestyle: 'Lifestyle'
}

export function TemplateSelector({ onSelectTemplate, selectedTemplateId }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    const result = await getVideoTemplates(selectedCategory || undefined)
    if (result.status === 200) {
      setTemplates(result.data)
    }
    setIsLoading(false)
  }, [selectedCategory])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const categories = ['product_review', 'problem_solution', 'unboxing', 'transformation', 'lifestyle']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Templates
        </h3>
        <Badge variant="outline" className="text-xs">
          {templates.length} templates
        </Badge>
      </div>

      {/* Category Filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            All
          </Button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Sparkles
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full"
              >
                <Icon className="h-3 w-3 mr-1" />
                {categoryLabels[cat]}
              </Button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-3" />
                <div className="h-8 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => {
            const Icon = categoryIcons[template.category] || Sparkles
            const isSelected = selectedTemplateId === template.id
            
            return (
              <Card 
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  isSelected && "border-primary bg-primary/5"
                )}
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    {template.is_premium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="space-y-2">
                    <div className="p-2 rounded bg-muted/50 text-xs">
                      <span className="text-yellow-500 font-semibold">HOOK:</span>{' '}
                      <span className="text-muted-foreground">{template.hook_template}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-xs">
                      <span className="text-orange-500 font-semibold">CTA:</span>{' '}
                      <span className="text-muted-foreground">{template.cta_template}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[template.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {template.usage_count} uses
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
