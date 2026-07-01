import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import type { Product, ProductReviewStats } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .order("created_at", { ascending: false })
    .limit(24);

  const productIds = (products ?? []).map((p) => p.id);
  let reviewStats: Record<string, ProductReviewStats> = {};

  if (productIds.length > 0) {
    const { data: stats } = await supabase
      .from("product_review_stats")
      .select("*")
      .in("product_id", productIds);

    reviewStats = Object.fromEntries(
      (stats ?? []).map((s) => [s.product_id, s as ProductReviewStats])
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop the marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Browse products from multiple vendors in one place.
        </p>
      </div>

      {!products?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p>No products yet. Vendors can add products from their dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(products as Product[]).map((product) => {
            const stats = reviewStats[product.id];
            return (
              <ProductCard
                key={product.id}
                product={product}
                rating={stats?.average_rating ?? 0}
                reviewCount={stats?.review_count ?? 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
