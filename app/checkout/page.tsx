"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Tag, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, toPesewas } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag } from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: () => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Window is not available"));
  if (window.PaystackPop) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack script")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponVendorName, setCouponVendorName] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [address, setAddress] = useState({
    fullname: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Ghana",
    postal_code: "",
  });

  const subtotal = getTotal();
  const total = subtotal - couponDiscount;
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  async function applyCoupon() {
    if (!couponCode.trim()) return;

    setCouponError(null);
    setCouponVendorName(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          items: items.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
        setCouponDiscount(0);
        setAppliedCouponCode(null);
        return;
      }

      setCouponDiscount(data.data.discount_amount);
      setCouponVendorName(data.data.vendor_name);
      setAppliedCouponCode(couponCode.trim().toUpperCase());
    } catch {
      setCouponError("Failed to apply coupon");
      setAppliedCouponCode(null);
    }
  }

  async function handlePay() {
    if (!publicKey) {
      setError("Paystack public key not configured");
      return;
    }
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        shipping_address: address,
        coupon_code: appliedCouponCode || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create order");
      return;
    }

    const order = data.order;

    try {
      await loadPaystackScript();

      const handler = window.PaystackPop?.setup({
        key: publicKey,
        email,
        amount: toPesewas(order.total_amount),
        currency: "GHS",
        ref: `order_${order.id}_${Date.now()}`,
        metadata: { order_id: order.id, custom_fields: [] },
        callback: () => {
          clearCart();
          router.push(`/payment/success?order=${order.id}`);
        },
        onClose: () => router.push("/payment/cancelled"),
      });

      if (!handler) {
        setError("Unable to initialize Paystack payment");
        return;
      }

      handler.openIframe();
    } catch {
      setError("Failed to load Paystack. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <Container size="sm" className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to checkout"
          description="Your cart is empty. Add some products before proceeding to checkout."
          actionLabel="Browse products"
          actionHref="/"
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/cart">
            <ArrowLeft className="size-4" />
            Back to cart
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Checkout"
        description="Complete your order with secure payment"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Shipping details</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullname">Full name</Label>
                <Input id="fullname" value={address.fullname} onChange={(e) => setAddress({ ...address, fullname: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="street">Street address</Label>
                <Input id="street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Coupon code</h2>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button onClick={applyCoupon} disabled={!couponCode.trim()} variant="secondary">
                Apply
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Applies to products from that vendor only
            </p>
            {couponError && <p className="mt-2 text-sm text-destructive">{couponError}</p>}
            {couponDiscount > 0 && (
              <p className="mt-2 text-sm text-success">
                Coupon applied{couponVendorName ? ` for ${couponVendorName}` : ""} — you saved {formatCurrency(couponDiscount)}
              </p>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border bg-card p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4 text-sm">
                <span className="line-clamp-1 text-muted-foreground">
                  {i.name} <span className="text-foreground">× {i.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-{formatCurrency(couponDiscount)}</dd>
              </div>
            )}
          </dl>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <Button className="mt-6 w-full" size="lg" onClick={handlePay} disabled={loading}>
            <Lock className="size-4" />
            {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Payments secured by Paystack
          </p>
        </aside>
      </div>
    </Container>
  );
}
