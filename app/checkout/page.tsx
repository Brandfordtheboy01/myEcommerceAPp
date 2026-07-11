"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Tag, Truck, ChevronRight, MapPin, Mail, User, Phone, Building } from "lucide-react";
import { Container } from "@/components/layout/container";
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
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal - couponDiscount + deliveryFee;
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
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 font-normal">
        <Link href="/" className="hover:text-black transition">Home</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link href="/cart" className="hover:text-black transition">Cart</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-black font-medium">Checkout</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl md:text-[40px] font-black uppercase tracking-tight text-black mb-8 md:mb-10">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
        {/* Left Column — Forms */}
        <div className="space-y-6">
          {/* Shipping Details Card */}
          <div className="border border-gray-100 rounded-[20px] p-5 md:p-7 bg-white">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center justify-center size-9 rounded-full bg-[#F0F0F0]">
                <Truck size={16} className="text-black" />
              </div>
              <h2 className="text-lg font-bold text-black">Shipping Details</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email — full width */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* Full Name — full width */}
              <div className="sm:col-span-2">
                <label htmlFor="fullname" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <User size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="fullname"
                    value={address.fullname}
                    onChange={(e) => setAddress({ ...address, fullname: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Phone
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="+233 123 456 789"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  City
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <Building size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Accra"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* Street — full width */}
              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Street Address
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123 Main Street"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  State / Region
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="Greater Accra"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Country
                </label>
                <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-black transition">
                  <Building size={16} className="text-gray-400 shrink-0" />
                  <input
                    id="country"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    placeholder="Ghana"
                    required
                    className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Card */}
          <div className="border border-gray-100 rounded-[20px] p-5 md:p-7 bg-white">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center size-9 rounded-full bg-[#F0F0F0]">
                <Tag size={16} className="text-black" />
              </div>
              <h2 className="text-lg font-bold text-black">Coupon Code</h2>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-full px-4 py-3 flex-1 focus-within:ring-1 focus-within:ring-black transition">
                <Tag size={16} className="text-gray-400 shrink-0" />
                <input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
                />
              </div>
              <button
                onClick={applyCoupon}
                disabled={!couponCode.trim()}
                className="bg-black hover:bg-black/90 active:scale-95 text-white font-bold text-sm px-7 py-3 rounded-full transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            <p className="mt-2.5 text-xs text-gray-400">
              Applies to products from that vendor only
            </p>
            {couponError && <p className="mt-2 text-sm text-red-500 font-medium">{couponError}</p>}
            {couponDiscount > 0 && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ Coupon applied{couponVendorName ? ` for ${couponVendorName}` : ""} — you saved {formatCurrency(couponDiscount)}
              </p>
            )}
          </div>
        </div>

        {/* Right Column — Order Summary */}
        <aside className="border border-gray-100 rounded-[20px] p-5 md:p-7 bg-white lg:sticky lg:top-24">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Order Summary</h2>

          {/* Items List */}
          <div className="space-y-4 mb-6">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center gap-3">
                <div className="relative size-14 bg-[#F0F0F0] rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center">
                  {i.imageUrl ? (
                    <Image src={i.imageUrl} alt={i.name} fill className="object-contain p-1" unoptimized />
                  ) : (
                    <div className="text-[8px] text-gray-400">No img</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-black line-clamp-1">{i.name}</p>
                  <p className="text-xs text-gray-400">× {i.quantity}</p>
                </div>
                <span className="text-sm font-bold text-black shrink-0">{formatCurrency(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 my-5" />

          {/* Summary Figures */}
          <div className="space-y-4 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-black">{formatCurrency(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Coupon Discount</span>
                <span className="font-bold text-red-500">-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-bold text-black">{formatCurrency(deliveryFee)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 my-5" />

          <div className="flex justify-between text-lg md:text-xl font-bold text-black mb-6">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-[15px] px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Pay CTA */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-black hover:bg-black/90 active:scale-[0.98] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2.5 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Lock size={16} className="stroke-[2.5px]" />
            {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Payments secured by Paystack
          </p>
        </aside>
      </div>
    </div>
  );
}
