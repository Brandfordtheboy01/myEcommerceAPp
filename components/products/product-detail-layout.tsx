"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, Minus, Plus, ChevronRight, SlidersHorizontal, MoreHorizontal, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/products/product-card";
import type { Product, Review, ProductReviewStats } from "@/types/database";

interface ProductDetailLayoutProps {
  product: Product & {
    categories?: { name: string } | null;
    product_images?: Array<{ id: string; image_url: string; is_primary: boolean }>;
    vendors?: { business_name: string; status: string } | null;
  };
  stats: ProductReviewStats | null;
  reviews: Array<Review & { users?: { fullname: string | null; email: string } | null }>;
  sameVendorProducts: Product[];
  otherVendorProducts: Product[];
  recommendedReviewStats: Record<string, ProductReviewStats>;
}

// Exact mock matches for pricing discounts from the SHOP.CO design
const PRODUCT_MOCK_DISCOUNTS: Record<string, { original: number; percent: number }> = {
  "One Life Graphic T-shirt": { original: 300, percent: 40 },
  "ONE LIFE GRAPHIC T-SHIRT": { original: 300, percent: 40 },
  "Skinny Fit Jeans": { original: 260, percent: 20 },
  "Sleeve Striped T-shirt": { original: 160, percent: 30 },
  "Vertical Striped Shirt": { original: 232, percent: 10 },
};

const MOCK_COLORS = [
  { name: "Olive Green", value: "#4F533E" },
  { name: "Forest Green", value: "#314F4A" },
  { name: "Navy Blue", value: "#31344F" },
];

const MOCK_SIZES = ["Small", "Medium", "Large", "X-Large"];

// Mock reviews from the screenshot to enrich review count and matches design
const MOCK_REVIEWS = [
  {
    id: "mock-1",
    author: "Samantha D.",
    rating: 4.5,
    comment: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
    date: "August 14, 2023",
  },
  {
    id: "mock-2",
    author: "Alex M.",
    rating: 5,
    comment: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
    date: "August 15, 2023",
  },
  {
    id: "mock-3",
    author: "Ethan R.",
    rating: 4.5,
    comment: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
    date: "August 16, 2023",
  },
  {
    id: "mock-4",
    author: "Olivia P.",
    rating: 4,
    comment: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
    date: "August 17, 2023",
  },
  {
    id: "mock-5",
    author: "Liam K.",
    rating: 5,
    comment: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
    date: "August 18, 2023",
  },
  {
    id: "mock-6",
    author: "Ava H.",
    rating: 4.5,
    comment: "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this t-shirt a conversation starter.",
    date: "August 19, 2023",
  },
];

const MOCK_FAQS = [
  {
    question: "What is the return policy?",
    answer: "We offer a 30-day return policy for all unworn and unwashed items. Returns are easy and free.",
  },
  {
    question: "How do I choose the right size?",
    answer: "Please refer to our size guide. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a slim fit.",
  },
  {
    question: "Where are your products manufactured?",
    answer: "Our garments are responsibly manufactured in certified facilities using high-quality organic cotton.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days. Express shipping options are available at checkout.",
  },
];

export function ProductDetailLayout({
  product,
  stats,
  reviews: dbReviews,
  sameVendorProducts,
  otherVendorProducts,
  recommendedReviewStats,
}: ProductDetailLayoutProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(MOCK_COLORS[0].value);
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Rating & Reviews");
  const [addedState, setAddedState] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img) => img.is_primary)?.image_url ??
    images[0]?.image_url ??
    null;

  // Active Main Image URL
  const activeImage = images[activeImgIndex]?.image_url ?? primaryImage;

  // Pricing calculations
  const mockDiscount = PRODUCT_MOCK_DISCOUNTS[product.name] || (product.price > 150 ? { original: Math.round(product.price * 1.25), percent: 20 } : null);
  const hasDiscount = !!mockDiscount;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImage,
      stock: product.stock,
    }, quantity);
    setAddedState(true);
    setTimeout(() => setAddedState(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in to leave a review");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, rating, comment }),
      });

      if (res.ok) {
        const { data } = await res.json();
        setLocalReviews([data, ...localReviews]);
        setComment("");
        setShowReviewForm(false);
      } else {
        const { error } = await res.json();
        alert(error || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine DB reviews and mock reviews to populate list
  const allReviewsCombined = [
    ...localReviews.map(r => ({
      id: r.id,
      author: currentUser?.user_metadata?.fullname || currentUser?.email?.split("@")[0] || "You",
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      isDb: true,
    })),
    ...dbReviews.map(r => ({
      id: r.id,
      author: r.users?.fullname || r.users?.email?.split("@")[0] || "Verified Buyer",
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      isDb: true,
    })),
    ...MOCK_REVIEWS
  ];

  // Helper to render stars
  const renderStars = (score: number) => {
    const stars = [];
    const floor = Math.floor(score);
    const hasHalf = score % 1 >= 0.4;
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={16} className="fill-[#FFC700] text-[#FFC700]" />);
      } else if (i === floor + 1 && hasHalf) {
        stars.push(
          <span key={i} className="relative inline-block text-gray-200">
            <Star size={16} className="text-gray-200 fill-gray-200" />
            <span className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star size={16} className="fill-[#FFC700] text-[#FFC700]" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-200 fill-gray-200" />);
      }
    }
    return stars;
  };

  // Combine recommendations
  const allRecommendations = [...sameVendorProducts, ...otherVendorProducts].slice(0, 4);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 md:mb-10 font-normal">
        <Link href="/" className="hover:text-black transition">Home</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link href="/products" className="hover:text-black transition">Shop</Link>
        {product.categories?.name && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <Link href={`/products?category=${product.categories.name}`} className="hover:text-black transition">
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-black font-medium line-clamp-1">{product.name}</span>
      </div>

      {/* Main product configuration block */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        {/* Left: Gallery */}
        <div className="flex flex-col-reverse md:grid md:grid-cols-[130px_1fr] gap-4">
          {/* Thumbnails list */}
          {images.length > 0 ? (
            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImgIndex(i)}
                  className={cn(
                    "relative aspect-square w-20 md:w-full bg-[#F0F0F0] rounded-[15px] overflow-hidden p-2 border-2 transition duration-200",
                    activeImgIndex === i ? "border-black" : "border-transparent opacity-80 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* Large display */}
          <div className="relative aspect-square md:aspect-[4/5] w-full bg-[#F0F0F0] rounded-[20px] overflow-hidden flex items-center justify-center">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 md:p-12 transition-transform duration-500 hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="text-gray-400 text-sm">No Image Available</div>
            )}
          </div>
        </div>

        {/* Right: Info Configurator */}
        <div className="flex flex-col">
          {/* Title */}
          <h1 className="text-2xl md:text-[40px] leading-tight font-black uppercase tracking-tight text-black">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3.5">
            <div className="flex items-center gap-0.5">
              {renderStars(stats?.average_rating || 4.5)}
            </div>
            <span className="text-sm font-medium text-black">
              {(stats?.average_rating || 4.5).toFixed(1)}/
              <span className="text-gray-400">5</span>
            </span>
          </div>

          {/* Price strip */}
          <div className="flex items-center gap-3.5 mt-4">
            <span className="text-2xl md:text-3xl font-extrabold text-black">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-2xl md:text-3xl font-extrabold text-gray-300 line-through">
                  {formatCurrency(mockDiscount.original)}
                </span>
                <span className="bg-red-50 text-red-500 text-xs md:text-sm font-bold px-3 py-1 rounded-full">
                  -{mockDiscount.percent}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-500 mt-5 leading-relaxed">
            {product.description || "This high-quality product is perfect for any occasion. Crafted from premium, durable, and breathable fabric, it offers superior comfort and effortless style."}
          </p>

          <div className="h-px bg-gray-100 my-6" />

          {/* Color Picker */}
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-3">Select Colors</h3>
            <div className="flex gap-3">
              {MOCK_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  style={{ backgroundColor: color.value }}
                  className="size-9 rounded-full flex items-center justify-center transition border border-black/10 active:scale-90"
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <Check size={14} className="text-white stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Size Picker */}
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-3">Choose Size</h3>
            <div className="flex flex-wrap gap-2.5">
              {MOCK_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-medium transition active:scale-95",
                    selectedSize === size
                      ? "bg-black text-white"
                      : "bg-[#F0F0F0] text-gray-600 hover:bg-[#EAEAEA]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Quantity & Buy CTAs */}
          <div className="flex gap-4 items-center">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-5 py-3.5 w-32 shrink-0">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="text-black hover:text-black/70 active:scale-90 transition"
              >
                <Minus size={16} className="stroke-[2.5px]" />
              </button>
              <span className="font-bold text-black text-base select-none">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                className="text-black hover:text-black/70 active:scale-90 transition"
              >
                <Plus size={16} className="stroke-[2.5px]" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn(
                "flex-1 bg-black text-white hover:bg-black/90 font-bold rounded-full py-4 text-center cursor-pointer transition-all duration-200 active:scale-95",
                product.stock <= 0 && "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
              )}
            >
              {product.stock <= 0 ? (
                "Out of stock"
              ) : addedState ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={18} className="stroke-[2.5px]" /> Added
                </span>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs list section */}
      <div className="mt-16 md:mt-24">
        {/* Tabs Row */}
        <div className="flex border-b border-gray-100 justify-between items-center text-center">
          {["Product Details", "Rating & Reviews", "FAQs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-4 text-sm sm:text-base font-medium transition border-b-2",
                activeTab === tab
                  ? "border-black text-black font-semibold"
                  : "border-transparent text-gray-400 hover:text-black"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="py-8">
          {activeTab === "Product Details" && (
            <div className="grid gap-6 md:grid-cols-2 leading-relaxed text-gray-600">
              <div>
                <h3 className="text-lg font-bold text-black mb-3">Product Overview</h3>
                <p className="text-sm">
                  This product is manufactured under strict quality controls to guarantee durability and style. Its organic construction makes it highly breathable, easy to wash, and perfect for active and leisure styles.
                </p>
                {product.vendors?.business_name && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-semibold text-black">Sold by:</span>
                    <span>{product.vendors.business_name} ({product.vendors.status})</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-6 rounded-[20px] border border-gray-100">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Specifications</h3>
                <dl className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Category</dt>
                    <dd className="font-semibold text-black">{product.categories?.name || "General"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Stock Available</dt>
                    <dd className="font-semibold text-black">{product.stock} units</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Color Palette</dt>
                    <dd className="font-semibold text-black">Olive, Forest, Navy</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Sizes</dt>
                    <dd className="font-semibold text-black">S, M, L, XL</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === "Rating & Reviews" && (
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-black">All Reviews</h3>
                  <span className="text-xs sm:text-sm text-gray-400">({allReviewsCombined.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Slider Icon Button */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] text-black hover:bg-gray-200 transition">
                    <SlidersHorizontal size={16} />
                  </button>
                  {/* Latest Sort Dropdown */}
                  <select className="hidden sm:block border-0 bg-[#F0F0F0] rounded-full py-2.5 px-4 text-sm font-bold text-black focus:outline-none cursor-pointer">
                    <option>Latest</option>
                    <option>Highest Rating</option>
                    <option>Lowest Rating</option>
                  </select>
                  {/* Write a Review Button */}
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-black text-white hover:bg-black/90 font-bold rounded-full py-2.5 px-5 sm:px-6 text-xs sm:text-sm transition duration-200 active:scale-95"
                  >
                    Write a Review
                  </button>
                </div>
              </div>

              {/* Review Input Box */}
              {showReviewForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-[20px] border border-gray-100 relative">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                  >
                    <X size={18} />
                  </button>
                  <h4 className="text-base font-bold text-black mb-4">Write Your Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition active:scale-90"
                          >
                            <Star
                              size={24}
                              className={cn(
                                star <= rating ? "fill-[#FFC700] text-[#FFC700]" : "text-gray-200 fill-gray-200"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comments</label>
                      <textarea
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your detailed experience here..."
                        className="w-full bg-white border border-gray-200 rounded-[15px] p-3 text-sm focus:outline-none focus:border-black placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-black/90 transition disabled:bg-gray-300"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews Grid */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {allReviewsCombined.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-100 rounded-[20px] p-6 relative flex flex-col justify-between hover:shadow-sm transition bg-white"
                  >
                    <button className="absolute top-6 right-6 text-gray-400 hover:text-black">
                      <MoreHorizontal size={18} />
                    </button>
                    <div>
                      {/* Rating Stars */}
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                      {/* Name + Verified Badge */}
                      <div className="flex items-center gap-1.5 mt-3">
                        <span className="font-bold text-black text-base sm:text-lg">{review.author}</span>
                        {/* Green Verified Seal */}
                        <span className="inline-flex items-center justify-center w-[15px] h-[15px] bg-green-500 text-white rounded-full text-[9px] font-bold">
                          ✓
                        </span>
                      </div>
                      {/* Content */}
                      <p className="text-gray-500 text-xs sm:text-sm mt-3 leading-relaxed">
                        &quot;{review.comment}&quot;
                      </p>
                    </div>
                    {/* Timestamp */}
                    <div className="text-gray-400 text-xs sm:text-sm font-medium mt-6">
                      Posted on {review.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Reviews Button */}
              <div className="flex justify-center mt-10">
                <button className="border border-gray-200 hover:bg-gray-50 text-black font-semibold text-sm rounded-full py-3.5 px-9 transition duration-200 active:scale-95">
                  Load More Reviews
                </button>
              </div>
            </div>
          )}

          {activeTab === "FAQs" && (
            <div className="max-w-[700px] mx-auto divide-y divide-gray-100">
              {MOCK_FAQS.map((faq, i) => (
                <div key={i} className="py-4">
                  <h4 className="font-bold text-black text-sm sm:text-base mb-1.5">{faq.question}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended section */}
      {allRecommendations.length > 0 && (
        <div className="mt-16 md:mt-24 border-t border-gray-100 pt-16">
          <h2 className="text-3xl md:text-4xl font-black text-black text-center mb-10 tracking-tight uppercase">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {allRecommendations.map((rec) => {
              const rStats = recommendedReviewStats[rec.id];
              return (
                <ProductCard
                  key={rec.id}
                  product={rec}
                  rating={rStats?.average_rating ?? 4.0}
                  reviewCount={rStats?.review_count ?? 1}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
