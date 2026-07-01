import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vendors</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{vendorCount ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending approvals</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{pendingVendors ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{productCount ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{orderCount ?? 0}</p></CardContent>
        </Card>
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <Link href="/admin/vendors">Manage vendors</Link>
      </Button>
    </div>
  );
}
