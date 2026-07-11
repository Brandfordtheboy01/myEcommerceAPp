import { ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <div className='mx-6'>
      <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
        {/* Main Hero Card */}
        <div className='relative flex-1 flex flex-col rounded-3xl xl:min-h-[400px] group overflow-hidden'>
          <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('/assets/ecimg1.jpg')" }} />
          <div className='absolute inset-0 bg-gradient-to-r from-black/60 to-transparent' />
          <div className='p-5 sm:p-16 relative z-10'>
            <div className='inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white pr-4 p-1 rounded-full text-xs sm:text-sm border border-white/30'>
              <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>NEWS</span> 
              Free Shipping on Orders Above $50! 
              <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
            </div>
            <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium text-white max-w-xs sm:max-w-md'>
              Gadgets you'll love. Prices you'll trust.
            </h2>
            <div className='text-white text-sm font-medium mt-4 sm:mt-8'>
              <p>Starts from</p>
              <p className='text-3xl'>$4.90</p>
            </div>
            <Link 
              href="/products"
              className='inline-block bg-white text-slate-800 text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition font-semibold'
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Side Cards */}
        <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-white'>
          <div className='relative flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group hover:scale-105 transition cursor-pointer overflow-hidden'>
            <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('/assets/ecimg2.jpg')" }} />
            <div className='absolute inset-0 bg-gradient-to-r from-orange-600/80 to-transparent' />
            <div className='relative z-10'>
              <p className='text-3xl font-medium text-white max-w-40'>Best products</p>
              <p className='flex items-center gap-1 mt-4'>View more <ArrowRight className='group-hover:ml-2 transition-all' size={18} /> </p>
            </div>
            <div className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className="text-4xl">🎧</span>
            </div>
          </div>
          <div className='relative flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group hover:scale-105 transition cursor-pointer overflow-hidden'>
            <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('/assets/ecimg2.jpg')" }} />
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600/80 to-transparent' />
            <div className='relative z-10'>
              <p className='text-3xl font-medium text-white max-w-40'>20% discounts</p>
              <p className='flex items-center gap-1 mt-4'>View more <ArrowRight className='group-hover:ml-2 transition-all' size={18} /> </p>
            </div>
            <div className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className="text-4xl">📱</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRightIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <ChevronRight className={className} size={size} />
  )
}
