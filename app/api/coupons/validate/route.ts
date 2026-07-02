import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/orders";
import { resolveCouponForCart } from "@/lib/coupons";
import { validateCouponSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = validateCouponSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { code, items } = parsed.data;
  const admin = createAdminClient();

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await admin
    .from("products")
    .select("id, vendor_id, price")
    .in("id", productIds);

  if (!products || products.length !== items.length) {
    return NextResponse.json({ error: "Some products not found" }, { status: 400 });
  }

  const cartLines = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id)!;
    if (product.price !== item.price) {
      return null;
    }
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      vendor_id: product.vendor_id,
    };
  });

  if (cartLines.some((line) => line === null)) {
    return NextResponse.json({ error: "Product prices have changed. Refresh your cart." }, { status: 400 });
  }

  const result = await resolveCouponForCart(admin, code, cartLines.filter(Boolean) as NonNullable<(typeof cartLines)[0]>[]);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { data: vendor } = await admin
    .from("vendors")
    .select("business_name")
    .eq("id", result.coupon.vendor_id)
    .single();

  return NextResponse.json({
    data: {
      code: result.coupon.code,
      discount_amount: result.discount_amount,
      eligible_subtotal: result.eligible_subtotal,
      discount_type: result.coupon.discount_type,
      discount: result.coupon.discount,
      vendor_name: vendor?.business_name ?? "Vendor",
    },
  });
}
