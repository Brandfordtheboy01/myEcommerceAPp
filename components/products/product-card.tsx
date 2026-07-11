"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviewCount?: number;
}

// Exact mock matches for pricing discounts from the SHOP.CO design
const PRODUCT_DISCOUNTS: Record<string, { original: number; percent: number }> = {
  "Skinny Fit Jeans": { original: 260, percent: 20 },
  "Sleeve Striped T-shirt": { original: 160, percent: 30 },
  "Vertical Striped Shirt": { original: 232, percent: 10 },
};

export function ProductCard({ product, rating = 0, reviewCount = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ??
    product.product_images?.[0]?.image_url ??
    null;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist?product_id=${product.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const discount = PRODUCT_DISCOUNTS[product.name];
  const hasDiscount = !!discount;
  const outOfStock = product.stock <= 0;

  // Render yellow star ratings
  const renderStars = (score: number) => {
    const stars = [];
    const floor = Math.floor(score);
    const hasHalf = score % 1 >= 0.4;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={14} className="fill-[#FFC700] text-[#FFC700]" />);
      } else if (i === floor + 1 && hasHalf) {
        // Simple representation of half star using partially colored star
        stars.push(
          <span key={i} className="relative inline-block text-gray-200">
            <Star size={14} className="text-gray-200 fill-gray-200" />
            <span className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star size={14} className="fill-[#FFC700] text-[#FFC700]" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-200 fill-gray-200" />);
      }
    }
    return stars;
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex w-full flex-col bg-transparent transition-all duration-300"
    >
      {/* Image Wrapper - light gray background, rounded container */}
      <div className="relative w-full aspect-square bg-[#F0F0F0] rounded-[20px] overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}

        {/* Wishlist Icon Overlay */}
        <button
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-black/5 hover:bg-white transition duration-200"
        >
          <Heart
            size={15}
            className={cn("transition-colors", isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500")}
          />
        </button>

        {outOfStock && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
            Sold Out
          </span>
        )}

        {/* Add to Cart Button - Shows on hover for desktop, always on mobile */}
        {!outOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: primaryImage,
                stock: product.stock,
              });
            }}
            className="absolute bottom-3 right-3 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#1D52F7] text-white shadow-lg lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:duration-200 opacity-100 hover:bg-[#1D52F7]/90 transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>

      {/* Info Content Area */}
      <div className="flex flex-col gap-1 mt-3">
        {/* Title */}
        <h3 className="font-bold text-black text-sm sm:text-base line-clamp-1 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {/* Star Rating Section */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-0.5">
            {renderStars(rating || 4.0)}
          </div>
          <span className="text-xs sm:text-sm text-black font-medium">
            {(rating || 4.0).toFixed(1)}/
            <span className="text-gray-400">5</span>
          </span>
        </div>

        {/* Price Row with optional discount values */}
        <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
          <span className="text-base sm:text-lg font-bold text-black">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs sm:text-sm font-bold text-gray-400 line-through">
                {formatCurrency(discount.original)}
              </span>
              <span className="bg-red-50 text-red-500 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount.percent}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}