import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProductSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const vendor = searchParams.get("vendor");
  const search = searchParams.get("search");

  let query = supabase
    .from("products")
    .select("*, categories(name), product_images(*)")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category_id", category);
  if (vendor) query = query.eq("vendor_id", vendor);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;

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

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, status")
    .eq("id", user.id)
    .single();

  if (!vendor || vendor.status !== "approved") {
    return NextResponse.json({ error: "Approved vendor account required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { image_url, ...productData } = parsed.data;

  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...productData, vendor_id: vendor.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (image_url) {
    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: product.id,
      image_url,
      is_primary: true,
    });

    if (imageError) {
      console.error("Failed to insert product image:", imageError);
      // Optionally delete the product if image insertion fails
      await supabase.from("products").delete().eq("id", product.id);
      return NextResponse.json({ error: "Failed to associate image with product" }, { status: 500 });
    }
  }

  return NextResponse.json({ product }, { status: 201 });
}
