import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import type { Product, ProductReviewStats } from "@/types/database";

export interface FeaturedCollectionSectionProps {
  heading?: string;
  eyebrow?: string;
  intro?: string;
  cta?: { label: string; href: string };
  products: Product[];
  reviewStats: Record<string, ProductReviewStats>;
  className?: string;
}

export function FeaturedCollectionSection({
  heading = "Featured products",
  eyebrow,
  intro,
  cta,
  products,
  reviewStats,
  className,
}: FeaturedCollectionSectionProps) {
  const headingId = "featured-collection-heading";

  return (
    <section
      className={cn("py-section-md bg-background", className)}
      aria-labelledby={heading ? headingId : undefined}
    >
      <Container>
        <div className="mb-10">
          {eyebrow && (
            <p className="text-eyebrow uppercase text-muted-foreground mb-3">{eyebrow}</p>
          )}
          <h2 id={headingId} className="text-h2 text-foreground">
            {heading}
          </h2>
          {intro && (
            <p className="mt-4 max-w-prose text-lead text-muted-foreground">{intro}</p>
          )}
          {cta && (
            <a
              href={cta.href}
              className="mt-6 inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors duration-base ease-standard"
            >
              {cta.label}
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
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
        ) : (
          <p className="text-muted-foreground">No featured products yet.</p>
        )}
      </Container>
    </section>
  );
}
