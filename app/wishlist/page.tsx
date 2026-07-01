import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WishlistClient } from "./wishlist-client";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*, products(*, product_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <WishlistClient wishlist={wishlist ?? []} />;
}
