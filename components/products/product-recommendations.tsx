import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/layout/container";
import { Store, Sparkles } from "lucide-react";
import type { Product, ProductReviewStats } from "@/types/database";

interface ProductRecommendationsProps {
  currentProductId: string;
  currentVendorId: string;
  currentCategoryId: string;
  sameVendorProducts: Product[];
  otherVendorProducts: Product[];
  reviewStats: Record<string, ProductReviewStats>;
}

export function ProductRecommendations({
  currentProductId,
  currentVendorId,
  currentCategoryId,
  sameVendorProducts,
  otherVendorProducts,
  reviewStats,
}: ProductRecommendationsProps) {
  return (
    <div className="mt-16 space-y-12">
      {/* Same Vendor Products */}
      {sameVendorProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">More from this vendor</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sameVendorProducts.map((product) => {
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
        </div>
      )}

      {/* Similar Products from Other Vendors */}
      {otherVendorProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Similar products you might like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {otherVendorProducts.map((product) => {
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
        </div>
      )}
    </div>
  );
}