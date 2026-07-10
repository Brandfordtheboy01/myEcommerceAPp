import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils/format";
import { Wallet, TrendingUp, Package, ShoppingBag } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
        <p className="text-muted-foreground">Complete vendor onboarding to access your dashboard.</p>
        <Button className="mt-6" asChild>
          <Link href="/vendor-register">Register as vendor</Link>
        </Button>
      </div>
    );
  }

  const [{ count: productCount }, { data: orders }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("vendor_orders").select("*").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Available balance", value: formatCurrency(vendor.balance), icon: Wallet },
    { label: "Total earnings", value: formatCurrency(vendor.total_earnings), icon: TrendingUp },
    { label: "Products listed", value: String(productCount ?? 0), icon: Package },
    { label: "Recent orders", value: String(orders?.length ?? 0), icon: ShoppingBag },
  ];

  return (
    <>
      <PageHeader title={vendor.business_name} description="Manage your store and track performance">
        <Badge variant={vendor.status === "approved" ? "default" : "secondary"} className="capitalize">
          {vendor.status}
        </Badge>
      </PageHeader>

      {vendor.status !== "approved" && (
        <div className="mb-6 rounded-xl border border-warning bg-warning/50 p-4 text-sm text-warning-foreground">
          Your vendor account is pending admin approval. You can prepare products, but they won&apos;t be visible until approved.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders && orders.length > 0 && (
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-sm">
                <span className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span>{formatCurrency(o.subtotal)}</span>
                <Badge variant="outline" className="capitalize">{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
