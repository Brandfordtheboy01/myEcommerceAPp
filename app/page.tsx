import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/layout/container";
import { HeroCarousel } from "@/components/hero-carousel";
import type { Product, ProductReviewStats } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  // Query products with images and categories
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .order("created_at", { ascending: false })
    .limit(16);

  const productIds = (products ?? []).map((p) => p.id);
  let reviewStats: Record<string, ProductReviewStats> = {};

  if (productIds.length > 0) {
    const { data: stats } = await supabase
      .from("product_review_stats")
      .select("*")
      .in("product_id", productIds);

    reviewStats = Object.fromEntries(
      (stats ?? []).map((s) => [s.product_id, s as ProductReviewStats])
    );
  }

  // Split products for New Arrivals and Top Selling sections
  const newArrivals = (products ?? []).slice(0, 4);
  const topSelling = (products ?? []).slice(4, 8);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      comment: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I bought has exceeded my expectations."
    },
    {
      name: "Alex K.",
      rating: 5,
      comment: "Finding clothes that align with my personal style used to be a chore until I discovered Shop.co. The range of options they offer is remarkable, catering to a variety of tastes and occasions."
    },
    {
      name: "James L.",
      rating: 5,
      comment: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have found Shop.co. The selection is not only diverse but also in line with the latest trends."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="flex flex-col items-start order-2 lg:order-1">
              <h1 className="text-4xl sm:text-6xl font-black text-[#00E676] leading-[0.95] tracking-tighter uppercase font-sans">
                YOUR MULTI-VENDOR<br />
                ECOMMERCE<br />
                MARKETPLACE
              </h1>
              <p className="text-[#1D52F7] text-sm sm:text-base mt-6 leading-relaxed max-w-lg opacity-90">
                Connect with thousands of vendors and discover millions of products across every category. Our platform brings together sellers and shoppers in one seamless shopping experience.
              </p>
              <Link
                href="/products"
                className="mt-8 bg-[#0A1141] hover:bg-[#0A1141]/80 text-white font-semibold py-4 px-16 rounded-full text-base transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
              >
                Shop Now
              </Link>

              {/* Statistics Grid */}
              <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mt-12 sm:mt-16 w-full">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[#00E676]">5,000+</h3>
                  <p className="text-xs sm:text-sm text-[#1D52F7] mt-1 opacity-80">Active Vendors</p>
                </div>
                <div className="border-l border-gray-300 h-10 hidden sm:block"></div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[#00E676]">100K+</h3>
                  <p className="text-xs sm:text-sm text-[#1D52F7] mt-1 opacity-80">Products Listed</p>
                </div>
                <div className="border-l border-gray-300 h-10 hidden sm:block"></div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[#00E676]">50K+</h3>
                  <p className="text-xs sm:text-sm text-[#1D52F7] mt-1 opacity-80">Happy Customers</p>
                </div>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden order-1 lg:order-2">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRANDS BAR */}
      <section id="brands" className="bg-[#0A1141] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-12 gap-y-6 text-white">
            <span className="font-extrabold tracking-widest text-2xl sm:text-3xl font-serif">VERSACE</span>
            <span className="font-extrabold tracking-tight text-3xl sm:text-4xl font-serif">ZARA</span>
            <span className="font-semibold tracking-widest text-2xl sm:text-3xl font-serif text-gray-100">GUCCI</span>
            <span className="font-black tracking-widest text-2xl sm:text-3xl font-serif uppercase">PRADA</span>
            <span className="font-medium text-2xl sm:text-3xl tracking-tight text-gray-200">Calvin Klein</span>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="py-16 sm:py-24 border-b border-gray-100">
        <Container>
          <h2 className="text-3xl sm:text-5xl font-black text-center text-black tracking-tighter uppercase font-sans mb-12 sm:mb-16">
            NEW ARRIVALS
          </h2>
          {newArrivals.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => {
                const stats = reviewStats[product.id];
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rating={stats?.average_rating ?? 4.0}
                    reviewCount={stats?.review_count ?? 12}
                  />
                );
              })}
            </div>
          )}
          <div className="flex justify-center mt-12 sm:mt-16">
            <Link
              href="/products"
              className="border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 px-16 rounded-full text-base transition-all duration-300 w-full sm:w-auto text-center"
            >
              View All
            </Link>
          </div>
        </Container>
      </section>

      {/* 4. TOP SELLING */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-3xl sm:text-5xl font-black text-center text-black tracking-tighter uppercase font-sans mb-12 sm:mb-16">
            TOP SELLING
          </h2>
          {topSelling.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {topSelling.map((product) => {
                const stats = reviewStats[product.id];
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rating={stats?.average_rating ?? 4.5}
                    reviewCount={stats?.review_count ?? 8}
                  />
                );
              })}
            </div>
          )}
          <div className="flex justify-center mt-12 sm:mt-16">
            <Link
              href="/products"
              className="border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 px-16 rounded-full text-base transition-all duration-300 w-full sm:w-auto text-center"
            >
              View All
            </Link>
          </div>
        </Container>
      </section>

      {/* 5. BROWSE BY DRESS STYLE */}
      <section className="py-10">
        <Container>
          <div className="bg-[#F0F0F0] rounded-[32px] sm:rounded-[40px] px-6 py-14 sm:p-16">
            <h2 className="text-3xl sm:text-5xl font-black text-center text-black tracking-tighter uppercase font-sans mb-12 sm:mb-16">
              BROWSE BY DRESS STYLE
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Row 1: Casual (1/3) & Formal (2/3) */}
              <Link
                href="/products?category=Clothing"
                className="md:col-span-4 bg-white rounded-3xl h-60 sm:h-72 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition duration-300"
              >
                <span className="absolute top-6 left-6 text-xl sm:text-2xl font-bold text-black z-10">Casual</span>
                <div className="absolute right-0 bottom-0 w-3/5 h-4/5 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-tl-full overflow-hidden flex items-end justify-end">
                  <span className="text-gray-300 text-6xl font-black mr-4 mb-4 select-none">👕</span>
                </div>
              </Link>
              <Link
                href="/products?category=Clothing"
                className="md:col-span-8 bg-white rounded-3xl h-60 sm:h-72 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition duration-300"
              >
                <span className="absolute top-6 left-6 text-xl sm:text-2xl font-bold text-black z-10">Formal</span>
                <div className="absolute right-0 bottom-0 w-2/5 h-full bg-gradient-to-tr from-gray-100 to-gray-50 rounded-l-full overflow-hidden flex items-center justify-center">
                  <span className="text-gray-300 text-8xl select-none">🧥</span>
                </div>
              </Link>

              {/* Row 2: Party (2/3) & Gym (1/3) */}
              <Link
                href="/products?category=Clothing"
                className="md:col-span-8 bg-white rounded-3xl h-60 sm:h-72 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition duration-300"
              >
                <span className="absolute top-6 left-6 text-xl sm:text-2xl font-bold text-black z-10">Party</span>
                <div className="absolute right-0 bottom-0 w-2/5 h-full bg-gradient-to-tr from-gray-100 to-gray-50 rounded-l-full overflow-hidden flex items-center justify-center">
                  <span className="text-gray-300 text-8xl select-none">💃</span>
                </div>
              </Link>
              <Link
                href="/products?category=Clothing"
                className="md:col-span-4 bg-white rounded-3xl h-60 sm:h-72 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition duration-300"
              >
                <span className="absolute top-6 left-6 text-xl sm:text-2xl font-bold text-black z-10">Gym</span>
                <div className="absolute right-0 bottom-0 w-3/5 h-4/5 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-tl-full overflow-hidden flex items-end justify-end">
                  <span className="text-gray-300 text-6xl font-black mr-4 mb-4 select-none">🏋️</span>
                </div>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. OUR HAPPY CUSTOMERS TESTIMONIALS */}
      <section className="py-16 sm:py-24 pb-28">
        <Container>
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tighter uppercase font-sans">
              OUR HAPPY CUSTOMERS
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 hover:bg-gray-50 transition text-black">
                <ArrowLeft size={16} />
              </button>
              <button className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 hover:bg-gray-50 transition text-black">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div key={i} className="border border-gray-100 rounded-[20px] p-6 sm:p-8 flex flex-col gap-3 shadow-sm bg-white hover:border-gray-200 transition">
                {/* Yellow stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: test.rating }).map((_, idx) => (
                    <Star key={idx} size={16} className="fill-[#FFC700] text-[#FFC700]" />
                  ))}
                </div>
                {/* Name & Checkmark */}
                <div className="flex items-center gap-1.5 font-bold text-base text-black">
                  <span>{test.name}</span>
                  <span className="flex items-center justify-center size-4 bg-green-500 rounded-full text-white text-[9px]">
                    <Check size={10} strokeWidth={4} />
                  </span>
                </div>
                {/* Comment */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  &ldquo;{test.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. FOOTER WITH NEON GREEN */}
      <footer className="bg-[#00E676] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0A1141] tracking-tighter uppercase mb-4">
              SHOP.CO
            </h3>
            <p className="text-[#0A1141] opacity-80 text-sm">
              © 2024 Shop.co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
