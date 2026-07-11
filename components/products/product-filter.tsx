'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, SlidersHorizontal } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
}

interface ProductFilterProps {
  categories: Category[]
}

export function ProductFilter({ categories }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update categories
    params.delete('category')
    selectedCategories.forEach(cat => params.append('category', cat))
    
    // Update price range
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')
    
    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')
    
    // Update sort
    params.set('sort', sortBy)
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId)
    setSelectedCategories(newCategories)
    updateFilters()
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateFilters()
  }

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    if (field === 'min') {
      setMinPrice(value)
    } else {
      setMaxPrice(value)
    }
    updateFilters()
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
    router.push('/products')
  }

  const hasActiveFilters = selectedCategories.length > 0 || minPrice || maxPrice || sortBy !== 'newest'

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg border p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Categories</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Price Range</label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full pl-7 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full pl-7 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {isPending && (
          <div className="text-sm text-muted-foreground text-center">
            Updating...
          </div>
        )}
      </div>
    </div>
  )
}
