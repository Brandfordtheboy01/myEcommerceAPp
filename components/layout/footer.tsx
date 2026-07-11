"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ShoppingBag, Heart, HelpCircle } from "lucide-react";
import { Container } from "@/components/layout/container";

const footerLinks = {
  shop: [
    { href: "/", label: "All products" },
    { href: "/cart", label: "Cart" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/orders", label: "My orders" },
  ],
  account: [
    { href: "/login", label: "Sign in" },
    { href: "/register", label: "Create account" },
    { href: "/vendor-register", label: "Sell on Marketplace" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  if (isDashboard) return null;

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <Container className="py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              Marketplace
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              A multi-vendor marketplace connecting shoppers with independent sellers. Secure payments, trusted vendors.
            </p>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="size-4 text-primary" />
              Shop
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Heart className="size-4 text-primary" />
              Account
            </h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <HelpCircle className="size-4 text-primary" />
              Support
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Secure Paystack checkout</li>
              <li>Order tracking included</li>
              <li>Vendor-verified sellers</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for multi-vendor commerce
          </p>
        </div>
      </Container>
    </footer>
  );
}
