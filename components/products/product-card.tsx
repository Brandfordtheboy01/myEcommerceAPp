"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({ product, rating = 0, reviewCount = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Low stock
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/50 hover:bg-background"
            onClick={toggleWishlist}
          >
            <Heart className={`size-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </Link>
      <CardContent className="space-y-1 p-4">
        <Link href={`/products/${product.id}`} className="line-clamp-1 font-medium hover:underline">
          {product.name}
        </Link>
        {product.categories?.name && (
          <p className="text-xs text-muted-foreground">{product.categories.name}</p>
        )}
        <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)} ({reviewCount})
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={product.stock === 0}
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: primaryImage,
              stock: product.stock,
            })
          }
        >
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
