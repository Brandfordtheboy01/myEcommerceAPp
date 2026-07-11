'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight, SlidersHorizontal, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductFilterProps {
  categories: Category[]
}

const COLORS = [
  { name: 'green', value: '#00C853' },
  { name: 'red', value: '#FF1744' },
  { name: 'yellow', value: '#FFD600' },
  { name: 'orange', value: '#FF9100' },
  { name: 'cyan', value: '#00E5FF' },
  { name: 'blue', value: '#2979FF' },
  { name: 'purple', value: '#D500F9' },
  { name: 'pink', value: '#F50057' },
  { name: 'white', value: '#FFFFFF' },
  { name: 'black', value: '#000000' }
];

const SIZES = [
  'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'
];

export function ProductFilter({ categories }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for filters
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'))
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get('minPrice')) || 50)
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice')) || 200)
  const [selectedColor, setSelectedColor] = useState<string | null>(searchParams.get('color'))
  const [selectedSize, setSelectedSize] = useState<string | null>(searchParams.get('size'))

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (activeCategory) params.set('category', activeCategory)
    else params.delete('category')

    params.set('minPrice', minPrice.toString())
    params.set('maxPrice', maxPrice.toString())

    if (selectedColor) params.set('color', selectedColor)
    else params.delete('color')

    if (selectedSize) params.set('size', selectedSize)
    else params.delete('size')

    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }

  const handleClearFilters = () => {
    setActiveCategory(null)
    setMinPrice(50)
    setMaxPrice(200)
    setSelectedColor(null)
    setSelectedSize(null)
    router.push('/products')
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-[20px] p-5 sm:p-6 sticky top-24">
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <h3 className="font-bold text-lg sm:text-xl text-black flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
        </h3>
        {(activeCategory || selectedColor || selectedSize || minPrice !== 50 || maxPrice !== 200) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-gray-500 hover:text-black transition"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="py-5 border-b border-gray-100 flex flex-col gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
            className={`flex items-center justify-between text-left text-sm transition py-1 ${
              cat.id === activeCategory ? 'font-bold text-black' : 'text-gray-500 hover:text-black font-normal'
            }`}
          >
            <span>{cat.name}</span>
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Price Range Dual Input */}
      <div className="py-5 border-b border-gray-100">
        <h4 className="font-bold text-black text-base mb-4">Price</h4>
        
        {/* Simple dual price input sliders */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Min: ${minPrice}</span>
            <span>Max: ${maxPrice}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="0"
              max="500"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full accent-black h-1 bg-gray-200 rounded-lg cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black h-1 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Color Selection Grid */}
      <div className="py-5 border-b border-gray-100">
        <h4 className="font-bold text-black text-base mb-4">Colors</h4>
        <div className="grid grid-cols-5 gap-3.5">
          {COLORS.map((col) => {
            const isWhite = col.name === 'white';
            const isSelected = selectedColor === col.name;
            return (
              <button
                key={col.name}
                onClick={() => setSelectedColor(isSelected ? null : col.name)}
                style={{ backgroundColor: col.value }}
                className={`size-9 rounded-full relative flex items-center justify-center transition-transform hover:scale-105 border ${
                  isWhite ? 'border-gray-200' : 'border-transparent'
                }`}
                title={col.name}
              >
                {isSelected && (
                  <Check
                    size={14}
                    className={isWhite ? 'text-black' : 'text-white'}
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes Section */}
      <div className="py-5 border-b border-gray-100">
        <h4 className="font-bold text-black text-base mb-4">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(isSelected ? null : size)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-[#F0F0F0] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <div className="pt-6">
        <button
          onClick={handleApplyFilter}
          disabled={isPending}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-full text-sm transition cursor-pointer"
        >
          {isPending ? 'Applying...' : 'Apply Filter'}
        </button>
      </div>
    </div>
  )
}
