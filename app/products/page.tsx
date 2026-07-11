import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilter } from "@/components/products/product-filter";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { PackageSearch } from "lucide-react";
import type { Product, ProductReviewStats } from "@/types/database";

interface ProductsPageProps {
  searchParams: Promise<{ 
    search?: string; 
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    size?: string;
    color?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search, category, minPrice, maxPrice, sort, size, color } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .limit(48);

  // Search filter
  if (search) query = query.ilike("name", `%${search}%`);

  // Category filter
  if (category) {
    query = query.eq("category_id", category);
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

  // Fetch reviews for products to display correct stars
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

  // Determine page title based on active category
  let pageTitle = "All Clothes";
  if (category && categories) {
    const activeCat = categories.find((c) => c.id === category);
    if (activeCat) pageTitle = activeCat.name;
  }

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-6 sm:py-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 font-normal">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-black font-medium">{pageTitle}</span>
        </div>

        {/* Two Column Layout (Sidebar + Catalog Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3 w-full lg:sticky lg:top-24">
            <Suspense fallback={<div className="h-96 bg-gray-50 rounded-2xl animate-pulse"></div>}>
              {categories && <ProductFilter categories={categories} />}
            </Suspense>
          </div>

          {/* Right Column: Catalog Grid */}
          <div className="lg:col-span-9 flex-1">
            
            {/* Catalog Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-black font-sans uppercase tracking-tight">
                  {pageTitle}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Showing 1-{products?.length ?? 0} of {products?.length ?? 0} Products
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm">
                <span className="text-gray-500">Sort by:</span>
                <select 
                  className="bg-transparent text-black font-bold outline-none cursor-pointer border-none py-1 focus:ring-0"
                  defaultValue={sort || "newest"}
                >
                  <option value="newest">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            {!products?.length ? (
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description="Try adjusting your filters or search terms."
                actionLabel="View all products"
                actionHref="/products"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 sm:gap-6">
                {(products as Product[]).map((product) => {
                  const stats = reviewStats[product.id];
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      rating={stats?.average_rating ?? 4.0}
                      reviewCount={stats?.review_count ?? 15}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {products && products.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-12 sm:mt-16 text-xs sm:text-sm">
                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-black font-medium transition cursor-pointer">
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  <span className="flex items-center justify-center size-8 sm:size-9 rounded-lg bg-black text-white font-bold">1</span>
                  <span className="flex items-center justify-center size-8 sm:size-9 text-gray-500 hover:text-black font-medium cursor-pointer transition">2</span>
                  <span className="flex items-center justify-center size-8 sm:size-9 text-gray-500 hover:text-black font-medium cursor-pointer transition">3</span>
                  <span className="text-gray-400 px-1">...</span>
                  <span className="flex items-center justify-center size-8 sm:size-9 text-gray-500 hover:text-black font-medium cursor-pointer transition">8</span>
                  <span className="flex items-center justify-center size-8 sm:size-9 text-gray-500 hover:text-black font-medium cursor-pointer transition">9</span>
                  <span className="flex items-center justify-center size-8 sm:size-9 text-gray-500 hover:text-black font-medium cursor-pointer transition">10</span>
                </div>

                <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-black font-medium transition cursor-pointer">
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </Container>
    </div>
  );
}
