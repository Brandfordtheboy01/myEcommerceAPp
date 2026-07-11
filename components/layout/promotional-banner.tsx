'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function PromotionalBanner() {
  const [isOpen, setIsOpen] = useState(true)

  const handleClaim = () => {
    setIsOpen(false)
    navigator.clipboard.writeText('WELCOME20')
    // You could add a toast notification here
  }

  if (!isOpen) return null

  return (
    <div className="w-full px-6 py-2 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-purple-600 to-orange-500">
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        <p>Get 20% OFF on Your First Order!</p>
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleClaim} 
            type="button" 
            className="font-normal text-gray-800 bg-white px-7 py-2 rounded-full hover:bg-gray-100 transition max-sm:hidden"
          >
            Claim Offer
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            type="button" 
            className="font-normal text-white py-2 rounded-full hover:opacity-80 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
