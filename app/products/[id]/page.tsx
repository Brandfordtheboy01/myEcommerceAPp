import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailLayout } from "@/components/products/product-detail-layout";
import type { ProductReviewStats } from "@/types/database";

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

  return (
    <ProductDetailLayout
      product={product}
      stats={stats}
      reviews={reviews ?? []}
      sameVendorProducts={sameVendorProducts ?? []}
      otherVendorProducts={otherVendorProducts ?? []}
      recommendedReviewStats={recommendedReviewStats}
    />
  );
}
