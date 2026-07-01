import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, balance, total_earnings")
    .eq("id", user.id)
    .single();

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const [
    { count: productCount },
    { data: vendorOrders },
    { data: products },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("vendor_orders").select("*").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id, name, stock").eq("vendor_id", vendor.id).limit(5),
  ]);

  const totalOrders = vendorOrders?.length ?? 0;
  const pendingOrders = vendorOrders?.filter((o) => o.status === "pending" || o.status === "processing").length ?? 0;
  const totalSales = vendorOrders?.reduce((sum, o) => sum + Number(o.subtotal), 0) ?? 0;

  return NextResponse.json({
    balance: vendor.balance,
    total_earnings: vendor.total_earnings,
    product_count: productCount ?? 0,
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    total_sales: totalSales,
    recent_orders: vendorOrders ?? [],
    top_products: products ?? [],
  });
}
