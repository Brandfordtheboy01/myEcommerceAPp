import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductSearch } from "@/components/products/product-search";
import { ProductFilter } from "@/components/products/product-filter";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { PackageSearch } from "lucide-react";
import type { Product, ProductReviewStats } from "@/types/database";

interface ProductsPageProps {
  searchParams: Promise<{ 
    search?: string; 
    category?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search, category, minPrice, maxPrice, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .limit(48);

  // Search filter
  if (search) query = query.ilike("name", `%${search}%`);

  // Category filter (handle both single and multiple categories)
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    query = query.in("category_id", categories);
  }

  // Price range filter
  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));

  // Sort filter
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

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
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800">All Products</h1>
        <p className="text-sm text-slate-600 mt-2">
          Showing {products?.length ?? 0} products
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={null}>
          <ProductSearch />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Left Sidebar Filter */}
        <Suspense fallback={<div className="w-64 flex-shrink-0"></div>}>
          {categories && <ProductFilter categories={categories} />}
        </Suspense>

        {/* Products Grid */}
        <div className="flex-1">
          {(search || category || minPrice || maxPrice) && (
            <p className="mb-6 text-sm text-muted-foreground">
              {products?.length ?? 0} result{(products?.length ?? 0) !== 1 ? "s" : ""}
              {search && <> for &ldquo;{search}&rdquo;</>}
            </p>
          )}

          {!products?.length ? (
            <EmptyState
              icon={PackageSearch}
              title={search || category || minPrice || maxPrice ? "No products found" : "No products yet"}
              description={
                search || category || minPrice || maxPrice
                  ? "Try adjusting your filters or search terms."
                  : "Vendors can add products from their dashboard once approved."
              }
              actionLabel={search || category || minPrice || maxPrice ? "View all products" : undefined}
              actionHref={search || category || minPrice || maxPrice ? "/products" : undefined}
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
        </div>
      </div>
    </Container>
  );
}
