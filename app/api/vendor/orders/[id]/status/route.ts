import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateVendorOrderStatusSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateVendorOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: vendorOrder } = await supabase
    .from("vendor_orders")
    .select("id, vendor_id")
    .eq("id", id)
    .single();

  if (!vendorOrder || vendorOrder.vendor_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("vendor_orders")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vendor_order: data });
}
