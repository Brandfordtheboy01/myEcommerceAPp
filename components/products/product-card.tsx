"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag, Check } from "lucide-react";
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {product.stock > 0 && product.stock <= 5 && (
          <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground">
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Sold out
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 size-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
            isWishlisted && "text-destructive"
          )}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("size-4", isWishlisted && "fill-current")} />
        </Button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {product.categories?.name && (
            <span className="text-xs font-medium uppercase tracking-wide text-primary">
              {product.categories.name}
            </span>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              <span>({reviewCount})</span>
            </div>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
          <Button
            size="sm"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            className="shrink-0"
          >
            {added ? (
              <>
                <Check className="size-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
