import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient, createVendorOrdersForOrder } from "@/lib/orders";

function verifyPaystackSignature(body: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  if (event.event === "charge.success") {
    const reference = event.data?.reference as string | undefined;
    const orderId = event.data?.metadata?.order_id as string | undefined;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "processing",
        payment_reference: reference,
        payment_method: "paystack",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await createVendorOrdersForOrder(orderId);
  }

  if (event.event === "charge.failed") {
    const orderId = event.data?.metadata?.order_id as string | undefined;
    if (orderId) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
