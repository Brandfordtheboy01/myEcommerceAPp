import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!vendor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Complete vendor onboarding first.</p>
        <Button className="mt-4" asChild>
          <Link href="/vendor-register">Register as vendor</Link>
        </Button>
      </div>
    );
  }

  const [{ count: productCount }, { data: orders }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("vendor_orders").select("*").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
          <Badge className="mt-1" variant={vendor.status === "approved" ? "default" : "secondary"}>
            {vendor.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/vendor/products">Products</Link></Button>
          <Button variant="outline" asChild><Link href="/vendor/orders">Orders</Link></Button>
        </div>
      </div>

      {vendor.status !== "approved" && (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your vendor account is pending admin approval. You can add products once approved.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(vendor.balance)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total earnings</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(vendor.total_earnings)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{productCount ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recent orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{orders?.length ?? 0}</p></CardContent>
        </Card>
      </div>

      {orders && orders.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <span>#{o.id.slice(0, 8)}</span>
                <span>{formatCurrency(o.subtotal)}</span>
                <Badge variant="outline">{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
