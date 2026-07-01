import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function createVendorOrdersForOrder(orderId: string) {
  const supabase = createAdminClient();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(vendor_id)")
    .eq("order_id", orderId);

  if (!items?.length) return;

  const vendorIds = [
    ...new Set(
      items
        .map((i) => i.products?.vendor_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  for (const vendorId of vendorIds) {
    const { data: existing } = await supabase
      .from("vendor_orders")
      .select("id")
      .eq("order_id", orderId)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (existing) continue;

    const vendorItems = items.filter((i) => i.products?.vendor_id === vendorId);
    const subtotal = vendorItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { data: vendor } = await supabase
      .from("vendors")
      .select("commission_rate, balance, total_earnings")
      .eq("id", vendorId)
      .single();

    if (!vendor) continue;

    const commission = (subtotal * vendor.commission_rate) / 100;
    const earnings = subtotal - commission;

    const { data: vendorOrder } = await supabase
      .from("vendor_orders")
      .insert({
        order_id: orderId,
        vendor_id: vendorId,
        subtotal,
        commission_amount: commission,
        vendor_earnings: earnings,
        status: "processing",
      })
      .select("id")
      .single();

    if (!vendorOrder) continue;

    await supabase
      .from("order_items")
      .update({ vendor_order_id: vendorOrder.id })
      .eq("order_id", orderId)
      .in(
        "product_id",
        vendorItems.map((i) => i.product_id)
      );

    await supabase.from("vendor_transactions").insert({
      vendor_id: vendorId,
      type: "sale",
      amount: earnings,
      balance_after: vendor.balance + earnings,
      description: `Order #${orderId.slice(0, 8)}`,
      reference_id: vendorOrder.id,
      reference_type: "vendor_order",
    });

    await supabase
      .from("vendors")
      .update({
        balance: vendor.balance + earnings,
        total_earnings: vendor.total_earnings + earnings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorId);
  }
}
