import type { SupabaseClient } from "@supabase/supabase-js";
import type { Coupon } from "@/types/database";

export type CartLineForCoupon = {
  product_id: string;
  quantity: number;
  price: number;
  vendor_id: string | null;
};

export function calculateDiscountAmount(coupon: Coupon, eligibleSubtotal: number): number {
  if (eligibleSubtotal <= 0) return 0;

  const raw =
    coupon.discount_type === "percentage"
      ? (eligibleSubtotal * coupon.discount) / 100
      : coupon.discount;

  return Math.round(Math.min(raw, eligibleSubtotal) * 100) / 100;
}

export function getEligibleSubtotal(
  items: CartLineForCoupon[],
  vendorId: string
): number {
  return items
    .filter((item) => item.vendor_id === vendorId)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export async function fetchCouponByCode(
  supabase: SupabaseClient,
  code: string
): Promise<{ coupon: Coupon | null; error: string | null }> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return { coupon: null, error: error.message };
  }

  if (!data) {
    return { coupon: null, error: "Invalid coupon code" };
  }

  const coupon = data as Coupon;

  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return { coupon: null, error: "Coupon has expired" };
  }

  if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
    return { coupon: null, error: "Coupon usage limit reached" };
  }

  return { coupon, error: null };
}

export async function resolveCouponForCart(
  supabase: SupabaseClient,
  code: string,
  items: CartLineForCoupon[]
): Promise<
  | { ok: true; coupon: Coupon; discount_amount: number; eligible_subtotal: number }
  | { ok: false; error: string }
> {
  const { coupon, error } = await fetchCouponByCode(supabase, code);

  if (!coupon || error) {
    return { ok: false, error: error ?? "Invalid coupon code" };
  }

  if (!coupon.vendor_id) {
    return { ok: false, error: "Coupon is not linked to a vendor" };
  }

  const eligibleSubtotal = getEligibleSubtotal(items, coupon.vendor_id);

  if (eligibleSubtotal <= 0) {
    return {
      ok: false,
      error: "This coupon does not apply to any items in your cart",
    };
  }

  const discount_amount = calculateDiscountAmount(coupon, eligibleSubtotal);

  return { ok: true, coupon, discount_amount, eligible_subtotal: eligibleSubtotal };
}

export async function incrementCouponUsage(
  supabase: SupabaseClient,
  couponId: string
): Promise<void> {
  const { data: coupon } = await supabase
    .from("coupons")
    .select("usage_count")
    .eq("id", couponId)
    .single();

  if (!coupon) return;

  await supabase
    .from("coupons")
    .update({ usage_count: coupon.usage_count + 1 })
    .eq("id", couponId);
}
