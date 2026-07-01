import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

export default async function VendorProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("vendor_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My products</h1>
        <Button asChild><Link href="/vendor/products/new">Add product</Link></Button>
      </div>

      {!products?.length ? (
        <p className="text-muted-foreground">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">Stock: {p.stock}</p>
                </div>
                <p className="font-semibold">{formatCurrency(p.price)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
