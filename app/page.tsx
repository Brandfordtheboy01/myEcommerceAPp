import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductSearch } from "@/components/products/product-search";
import { CategoryFilter } from "@/components/products/category-filter";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
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
      <section className="gradient-hero border-b min-h-[100vh] flex items-center">
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Discover products from trusted vendors
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              One marketplace, endless choices. Shop securely and track every order.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-xl">
            <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-muted" />}>
              <ProductSearch defaultValue={search ?? ""} />
            </Suspense>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {categories && categories.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={null}>
              <CategoryFilter categories={categories} activeCategory={category} />
            </Suspense>
          </div>
        )}

        {(search || category) && (
          <p className="mb-6 text-sm text-muted-foreground">
            {products?.length ?? 0} result{(products?.length ?? 0) !== 1 ? "s" : ""}
            {search && <> for &ldquo;{search}&rdquo;</>}
          </p>
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
      </Container>
    </>
  );
}
