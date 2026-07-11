"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Check, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [showPanel, setShowPanel] = useState(false);

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

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
    >
      {/* Base image layer */}
      <div className="absolute inset-0 bg-[#F5F5F5]">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Subtle top gradient so heart icon stays visible on light images */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

      {/* Wishlist heart button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
      >
        <Heart
          size={18}
          className={cn("transition", isWishlisted ? "text-white" : "text-white/90")}
          fill={isWishlisted ? "white" : "none"}
        />
      </button>

      {/* Mobile reveal button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPanel(!showPanel);
        }}
        className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm transition hover:bg-white/40"
      >
        <ChevronUp
          size={20}
          className={cn("transition text-white", showPanel ? "rotate-180" : "")}
        />
      </button>

      {/* Hover info panel */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 transition-transform duration-300 ease-out",
          showPanel ? "translate-y-0" : "translate-y-[68%]",
          "sm:translate-y-[68%] sm:group-hover:translate-y-0",
          "bg-black/60 backdrop-blur-md border-t border-white/20",
          "rounded-2xl px-5 pt-5 pb-5 flex flex-col gap-3"
        )}
      >
        <p className="font-semibold text-white text-base leading-snug line-clamp-1 drop-shadow-sm">
          {product.name}
        </p>

        {(product.size || product.color) && (
          <div className="flex flex-wrap gap-2">
            {product.size && (
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-normal bg-white/30 text-white border-white/20 px-3 py-1"
              >
                {product.size}
              </Badge>
            )}
            {product.color && (
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-normal bg-white/30 text-white border-white/20 px-3 py-1"
              >
                {product.color}
              </Badge>
            )}
          </div>
        )}

        {product.description && (
          <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] uppercase tracking-wide text-white/70">Price</p>
            <p className="font-semibold text-white text-lg">{formatCurrency(product.price)}</p>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="rounded-full bg-white text-slate-900 hover:bg-white/90 px-4"
          >
            {added ? (
              <span className="flex items-center gap-1.5">
                <Check size={14} /> Added
              </span>
            ) : (
              "Add to cart"
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}