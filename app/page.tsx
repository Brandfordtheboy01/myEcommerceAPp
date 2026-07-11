import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductSearch } from "@/components/products/product-search";
import { CategoryFilter } from "@/components/products/category-filter";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroSection } from "@/components/layout/hero-section";
import { CategoriesMarquee } from "@/components/layout/categories-marquee";
import { PackageSearch } from "lucide-react";
import type { Product, ProductReviewStats } from "@/types/database";

interface HomePageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .order("created_at", { ascending: false })
    .limit(24);

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category_id", category);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("id, name").order("name"),
  ]);

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
    <>
      <HeroSection />
      <CategoriesMarquee />

      <Container className="py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Latest Products</h2>
            <p className="text-sm text-slate-600 mt-2">
              Discover our newest arrivals from trusted vendors
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              {products?.length ?? 0} Products
            </div>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={null}>
              <CategoryFilter categories={categories} activeCategory={category} />
            </Suspense>
          </div>
        )}

        {(search || category) && (
          <div className="mb-6 flex items-center gap-2">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {products?.length ?? 0} result{(products?.length ?? 0) !== 1 ? "s" : ""}
            </div>
            {search && (
              <span className="text-sm text-muted-foreground">
                for &ldquo;{search}&rdquo;
              </span>
            )}
          </div>
        )}

        {!products?.length ? (
          <EmptyState
            icon={PackageSearch}
            title={search || category ? "No products found" : "No products yet"}
            description={
              search || category
                ? "Try a different search term or browse all categories."
                : "Vendors can add products from their dashboard once approved."
            }
            actionLabel={search || category ? "View all products" : undefined}
            actionHref={search || category ? "/" : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
      </Container>
    </>
  );
}
