'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ChevronDown, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Copy, 
  Archive,
  Tag,
  DollarSign
} from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  active: boolean
  category: string
}

type Props = {
  products: Product[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onBulkAction: (action: string, ids: string[]) => Promise<void>
}

export default function BulkOperations({ 
  products, 
  selectedIds, 
  onSelectionChange, 
  onBulkAction 
}: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedProducts = products.filter(p => selectedIds.includes(p.id))
  const allSelected = products.length > 0 && selectedIds.length === products.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(products.map(p => p.id))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return

    setLoading(true)
    try {
      await onBulkAction(action, selectedIds)
      onSelectionChange([]) // Clear selection after action
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (products.length === 0) return null

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#0e0e0e]/50 border border-[#3352CC]/20 rounded-xl">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected || (someSelected ? 'indeterminate' : false)}
            onCheckedChange={handleSelectAll}
            className="border-[#3352CC]"
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.length > 0 
                ? `${selectedIds.length} selected` 
                : `${products.length} products`
              }
            </span>
            
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="bg-[#3352CC]/20 text-[#3352CC]">
                {selectedIds.length}
              </Badge>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={loading}
                  className="rounded-full border-[#3352CC]/40 hover:border-[#3352CC]"
                >
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Activate Products
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Deactivate Products
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleBulkAction('duplicate')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Products
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Products
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleBulkAction('update-category')}>
                  <Tag className="mr-2 h-4 w-4" />
                  Update Category
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBulkAction('update-price')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Pricing
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Products
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="text-[#9D9D9D] hover:text-white rounded-full"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-[#3352CC]/10 border border-[#3352CC]/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#3352CC]">Selection Summary</h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#9D9D9D]">
                <span>
                  Active: {selectedProducts.filter(p => p.active).length}
                </span>
                <span>
                  Inactive: {selectedProducts.filter(p => !p.active).length}
                </span>
                <span>
                  Total Value: ${selectedProducts.reduce((sum, p) => sum + p.price, 0) / 100}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(selectedProducts.map(p => p.category))).map(category => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkAction('delete')
                setShowDeleteDialog(false)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Hook for managing bulk operations
export function useBulkOperations() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const clearSelection = () => setSelectedIds([])

  const selectAll = (ids: string[]) => setSelectedIds(ids)

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearSelection,
    selectAll
  }
}