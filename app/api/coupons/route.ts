import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCouponSchema } from "@/lib/validations";

async function getApprovedVendor(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, status")
    .eq("id", userId)
    .single();

  if (!vendor || vendor.status !== "approved") {
    return null;
  }

  return vendor;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendor = await getApprovedVendor(supabase, user.id);
  if (!vendor) {
    return NextResponse.json({ error: "Approved vendor account required" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendor = await getApprovedVendor(supabase, user.id);
  if (!vendor) {
    return NextResponse.json({ error: "Approved vendor account required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createCouponSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: parsed.data.code,
      discount: parsed.data.discount,
      discount_type: parsed.data.discount_type,
      vendor_id: vendor.id,
      expiry_date: parsed.data.expiry_date
        ? new Date(`${parsed.data.expiry_date}T23:59:59`).toISOString()
        : null,
      usage_limit: parsed.data.usage_limit ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, is_active } = body;

  if (!id || typeof is_active !== "boolean") {
    return NextResponse.json({ error: "Coupon id and is_active are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("coupons")
    .update({ is_active })
    .eq("id", id)
    .eq("vendor_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Coupon not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Coupon id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id)
    .eq("vendor_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
