import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/orders";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: vendorOrder } = await admin
    .from("vendor_orders")
    .select(`
      order_id,
      orders (
        id,
        total_amount,
        payment_status,
        payment_method,
        payment_reference,
        shipping_address,
        users (
          fullname
        )
      ),
      order_items (
        id,
        quantity,
        price,
        products (
          name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!vendorOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(vendorOrder);
}
