import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import { Package, Plus } from "lucide-react";

export default async function VendorProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("vendor_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Products" description="Manage your product catalog">
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="size-4" />
            Add product
          </Link>
        </Button>
      </PageHeader>

      {!products?.length ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start selling on the marketplace."
          actionLabel="Add product"
          actionHref="/vendor/products/new"
        />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card sm:p-5"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stock: {p.stock} · {p.stock === 0 ? "Out of stock" : "Available"}
                </p>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(p.price)}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
