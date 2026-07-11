"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Store,
  LogOut,
  LayoutDashboard,
  Shield,
  Heart,
  Menu,
  Package,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { CartSheet } from "@/components/cart/cart-sheet";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

const shopLinks = [
  { href: "/", label: "Shop" },
  { href: "/orders", label: "Orders", auth: true },
  { href: "/wishlist", label: "Wishlist", auth: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  if (isDashboard) return null;

  const itemCount = useCartStore((s) => s.getItemCount());
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setRole(null);
        setEmail(null);
        return;
      }
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
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const mobileNavLinks = [
    ...shopLinks.filter((l) => !l.auth || email),
    ...(role === "vendor" ? [{ href: "/vendor", label: "Vendor dashboard" }] : []),
    ...(role === "admin" ? [{ href: "/admin", label: "Admin dashboard" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

          <Link href="/" className="relative text-4xl font-semibold text-slate-700">
            <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/" className={pathname === "/" ? "text-primary font-medium" : "hover:text-primary transition"}>Home</Link>
            <Link href="/products" className={pathname === "/products" ? "text-primary font-medium" : "hover:text-primary transition"}>Shop</Link>
            {email && (
              <Link href="/orders" className={pathname === "/orders" ? "text-primary font-medium" : "hover:text-primary transition"}>Orders</Link>
            )}
            {email && (
              <Link href="/wishlist" className={pathname === "/wishlist" ? "text-primary font-medium" : "hover:text-primary transition"}>Wishlist</Link>
            )}

            <CartSheet />

            {role === "vendor" && (
              <Link href="/vendor" className="text-sm hover:text-primary transition">Vendor</Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className="text-sm hover:text-primary transition">Admin</Link>
            )}

            {email ? (
              <Button 
                size="sm" 
                onClick={handleLogout}
                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                Logout
              </Button>
            ) : (
              <Button 
                size="sm" 
                asChild
                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Store className="size-5 text-primary" />
                    Marketplace
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {mobileNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={navLinkClass(link.href)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!email && (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={navLinkClass("/login")}
                    >
                      Sign in
                    </Link>
                  )}
                  {email && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Sign out
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <hr className="border-gray-300" />
    </nav>
  );
}
