"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({ product, rating = 0, reviewCount = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

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

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImage,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-lg"
    >
      {/* Image — fixed aspect ratio, object-contain so nothing is ever cropped */}
      <div className="relative w-full aspect-square bg-slate-50">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
        >
          <Heart
            size={16}
            className={cn("transition", isWishlisted ? "text-rose-500" : "text-slate-500")}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {outOfStock && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5">
        <p className="line-clamp-1 text-sm font-medium text-slate-900">{product.name}</p>

        {(product.size || product.color) && (
          <p className="line-clamp-1 text-xs text-slate-500">
            {[product.size, product.color].filter(Boolean).join(" · ")}
          </p>
        )}

        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-600">
              {rating.toFixed(1)}{" "}
              <span className="text-slate-400">({reviewCount})</span>
            </span>
          </div>
        )}

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-slate-900">
            {formatCurrency(product.price)}
          </span>

          <Button
            size="icon"
            variant="outline"
            disabled={outOfStock}
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className={cn(
              "h-9 w-9 rounded-full border-slate-300 transition",
              added && "border-emerald-500 text-emerald-600"
            )}
          >
            {added ? <Check size={16} /> : <ShoppingBag size={16} />}
          </Button>
        </div>
      </div>
    </Link>
  );
}