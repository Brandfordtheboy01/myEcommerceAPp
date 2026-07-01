"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Store, User, LogOut, LayoutDashboard, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";
import type { UserRole } from "@/types/database";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data) setRole(data.role as UserRole);
    });
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setRole(null);
    setEmail(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Store className="size-5" />
          Marketplace
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className={pathname === "/" ? "font-medium" : "text-muted-foreground hover:text-foreground"}>
            Shop
          </Link>
          {role === "vendor" && (
            <Link href="/vendor" className="text-muted-foreground hover:text-foreground">
              Vendor
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {email && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="size-4" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="size-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 size-5 justify-center p-0 text-[10px]">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {email ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders">
                  <User className="size-4" />
                  Orders
                </Link>
              </Button>
              {role === "vendor" && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/vendor"><LayoutDashboard className="size-4" /></Link>
                </Button>
              )}
              {role === "admin" && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin"><Shield className="size-4" /></Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
