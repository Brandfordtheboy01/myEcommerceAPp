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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
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

            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              <span className="hidden sm:inline">Marketplace</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {shopLinks
              .filter((l) => !l.auth || email)
              .map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
            {role === "vendor" && (
              <Link href="/vendor" className={navLinkClass("/vendor")}>
                Vendor
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className={navLinkClass("/admin")}>
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {email && (
              <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                <Link href="/wishlist" aria-label="Wishlist">
                  <Heart className="size-4" />
                </Link>
              </Button>
            )}

            <CartSheet />

            {email ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/orders">
                    <Package className="size-4" />
                    <span className="hidden md:inline">Orders</span>
                  </Link>
                </Button>
                {role === "vendor" && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendor" aria-label="Vendor dashboard">
                      <LayoutDashboard className="size-4" />
                    </Link>
                  </Button>
                )}
                {role === "admin" && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin" aria-label="Admin dashboard">
                      <Shield className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            )}

            {email && (
              <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground xl:flex">
                <User className="size-3.5" />
                <span className="max-w-[140px] truncate">{email}</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
