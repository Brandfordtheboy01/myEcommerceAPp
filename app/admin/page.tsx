import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Users, Package, ShoppingCart, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: vendorCount },
    { count: pendingVendors },
    { count: productCount },
    { count: orderCount },
  ] = await Promise.all([
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total vendors", value: vendorCount ?? 0, icon: Users },
    { label: "Pending approvals", value: pendingVendors ?? 0, icon: Clock, highlight: (pendingVendors ?? 0) > 0 },
    { label: "Products", value: productCount ?? 0, icon: Package },
    { label: "Orders", value: orderCount ?? 0, icon: ShoppingCart },
  ];

  return (
    <>
      <PageHeader
        title="Admin dashboard"
        description="Platform overview and management"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${stat.highlight ? "text-warning-foreground" : ""}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(pendingVendors ?? 0) > 0 && (
        <Card className="mt-6 border-warning bg-warning/30 shadow-card">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Vendors awaiting approval</p>
              <p className="text-sm text-muted-foreground">
                {pendingVendors} vendor{pendingVendors !== 1 ? "s" : ""} need your review
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/vendors">Review vendors</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
