"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Container } from "@/components/layout/container";
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
      <Container className="py-8 sm:py-10">
        <PageHeader title="Wishlist" description="Products you've saved for later" />
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for easy access later."
          actionLabel="Browse products"
          actionHref="/"
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        title="Wishlist"
        description={`${items.length} saved item${items.length !== 1 ? "s" : ""}`}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = item.products;
          if (!product) return null;

          const primaryImage =
            product.product_images?.find((img) => img.is_primary)?.image_url ??
            product.product_images?.[0]?.image_url ??
            null;

          return (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:shadow-card-hover"
            >
              <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] bg-muted">
                {primaryImage ? (
                  <Image src={primaryImage} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                )}
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`} className="line-clamp-2 font-medium hover:text-primary">
                  {product.name}
                </Link>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(product.price)}</p>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </Container>
  );
}
