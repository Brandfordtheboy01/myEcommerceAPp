import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

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

  const primaryImage =
    product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url ??
    product.product_images?.[0]?.image_url ??
    null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div className="space-y-4">
          {product.categories?.name && (
            <Badge variant="secondary">{product.categories.name}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.vendors?.business_name && (
            <p className="text-sm text-muted-foreground">
              Sold by {product.vendors.business_name}
            </p>
          )}
          <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
          {stats && (
            <p className="text-sm text-muted-foreground">
              {stats.average_rating} ★ · {stats.review_count} reviews
            </p>
          )}
          <p className="text-muted-foreground">{product.description ?? "No description."}</p>
          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">{product.stock} in stock</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>
          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={product.price}
            stock={product.stock}
            imageUrl={primaryImage}
          />
          <Link href="/" className="block text-sm text-muted-foreground hover:underline">
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
