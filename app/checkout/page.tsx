"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, toKobo } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({
    fullname: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
  });

  const total = getTotal();
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  const config = {
    reference: "",
    email,
    amount: toKobo(total),
    publicKey,
  };

  const initializePayment = usePaystackPayment(config);

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
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create order");
      return;
    }

    const order = data.order;

    initializePayment({
      reference: `order_${order.id}_${Date.now()}`,
      metadata: { order_id: order.id, custom_fields: [] },
      onSuccess: () => {
        clearCart();
        router.push(`/payment/success?order=${order.id}`);
      },
      onClose: () => router.push("/payment/cancelled"),
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p>Your cart is empty.</p>
        <Button className="mt-4" asChild><Link href="/">Go shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-sm">
              <span>{i.name} × {i.quantity}</span>
              <span>{formatCurrency(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <Button className="mt-6 w-full" size="lg" onClick={handlePay} disabled={loading}>
        {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
      </Button>
    </div>
  );
}
