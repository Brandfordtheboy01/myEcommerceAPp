import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, shipping_address } = parsed.data;
  const productIds = items.map((i) => i.product_id);

  const { data: products } = await supabase
    .from("products")
    .select("id, stock, price")
    .in("id", productIds);

  if (!products || products.length !== items.length) {
    return NextResponse.json({ error: "Some products not found" }, { status: 400 });
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for product ${item.product_id}` },
        { status: 400 }
      );
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: subtotal,
      subtotal_amount: subtotal,
      shipping_address,
      payment_status: "pending",
      order_status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
  }

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    quantity: i.quantity,
    price: i.price,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);

  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
