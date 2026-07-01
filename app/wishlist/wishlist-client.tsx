"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import type { Wishlist } from "@/types/database";

interface WishlistClientProps {
  wishlist: Wishlist[];
}

export function WishlistClient({ wishlist }: WishlistClientProps) {
  const [items, setItems] = useState<Wishlist[]>(wishlist);

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((item) => item.product_id !== productId));
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Heart className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Save products you love by clicking the heart icon.
          </p>
          <Link href="/">
            <Button className="mt-4">Browse products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = item.products;
          if (!product) return null;

          const primaryImage =
            product.product_images?.find((img) => img.is_primary)?.image_url ??
            product.product_images?.[0]?.image_url ??
            null;

          return (
            <Card key={item.id} className="overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square bg-muted">
                  {primaryImage ? (
                    <Image src={primaryImage} alt={product.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                  )}
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
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
