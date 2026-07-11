import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Store, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductReviews } from "@/components/products/product-reviews";
import { ProductRecommendations } from "@/components/products/product-recommendations";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Product, ProductReviewStats } from "@/types/database";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name), product_images(*), vendors(business_name, status)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: stats } = await supabase
    .from("product_review_stats")
    .select("*")
    .eq("product_id", id)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, users(fullname, email)")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  // Fetch recommendations
  const [
    { data: sameVendorProducts },
    { data: otherVendorProducts },
  ] = await Promise.all([
    // Products from same vendor (excluding current product)
    supabase
      .from("products")
      .select("*, categories(name), product_images(*)")
      .eq("vendor_id", product.vendor_id)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(4),
    // Products from other vendors in same category (excluding current product and vendor)
    supabase
      .from("products")
      .select("*, categories(name), product_images(*)")
      .eq("category_id", product.category_id)
      .neq("id", id)
      .neq("vendor_id", product.vendor_id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  // Get review stats for recommended products
  const allRecommendedProductIds = [
    ...(sameVendorProducts ?? []).map((p) => p.id),
    ...(otherVendorProducts ?? []).map((p) => p.id),
  ];

  let recommendedReviewStats: Record<string, ProductReviewStats> = {};
  if (allRecommendedProductIds.length > 0) {
    const { data: recommendedStats } = await supabase
      .from("product_review_stats")
      .select("*")
      .in("product_id", allRecommendedProductIds);

    recommendedReviewStats = Object.fromEntries(
      (recommendedStats ?? []).map((s) => [s.product_id, s as ProductReviewStats])
    );
  }

  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img: { is_primary: boolean }) => img.is_primary)?.image_url ??
    images[0]?.image_url ??
    null;

  return (
    <Container className="py-8 sm:py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to shop
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-card">
            {primaryImage ? (
              <Image src={primaryImage} alt={product.name} fill className="object-cover" unoptimized priority />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: { id: string; image_url: string }) => (
                <div
                  key={img.id}
                  className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                >
                  <Image src={img.image_url} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {product.categories?.name && (
              <Badge variant="secondary">{product.categories.name}</Badge>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge className="bg-warning text-warning-foreground">Low stock</Badge>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          {product.vendors?.business_name && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="size-4" />
              Sold by <span className="font-medium text-foreground">{product.vendors.business_name}</span>
            </div>
          )}

          {stats && stats.review_count > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < Math.round(stats.average_rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.average_rating} · {stats.review_count} review{stats.review_count !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <p className="mt-6 text-3xl font-semibold">{formatCurrency(product.price)}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <Package className="size-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-success font-medium">{product.stock} in stock</span>
            ) : (
              <span className="font-medium text-destructive">Out of stock</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description ?? "No description provided for this product."}
          </p>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              imageUrl={primaryImage}
            />
          </div>
        </div>
      </div>

      <div className="mt-16 border-t pt-12">
        <ProductReviews
          productId={product.id}
          initialReviews={reviews ?? []}
          averageRating={stats?.average_rating ?? 0}
          reviewCount={stats?.review_count ?? 0}
        />
      </div>

      <ProductRecommendations
        currentProductId={product.id}
        currentVendorId={product.vendor_id}
        currentCategoryId={product.category_id}
        sameVendorProducts={sameVendorProducts ?? []}
        otherVendorProducts={otherVendorProducts ?? []}
        reviewStats={recommendedReviewStats}
      />
    </Container>
  );
}
