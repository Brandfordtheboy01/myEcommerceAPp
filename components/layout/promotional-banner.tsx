'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

export function PromotionalBanner() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="w-full bg-[#00E676] relative overflow-hidden py-2.5 px-4 flex items-center justify-center text-xs sm:text-sm font-normal">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1D52F7]/20 to-transparent"></div>
      <div className="text-center flex-1 relative z-10">
        <span className="text-[#0A1141]">Sign up and get 20% off to your first order. </span>
        <Link href="/login" className="text-[#0A1141] underline font-medium hover:text-[#0A1141]/80 transition-colors ml-1">
          Sign Up Now
        </Link>
      </div>
      <button 
        onClick={() => setIsOpen(false)} 
        type="button" 
        className="absolute right-4 sm:right-6 text-[#0A1141] hover:text-[#0A1141]/80 transition-colors cursor-pointer relative z-10"
        aria-label="Close promotion banner"
      >
        <X size={16} />
      </button>
    </div>
  )
}
