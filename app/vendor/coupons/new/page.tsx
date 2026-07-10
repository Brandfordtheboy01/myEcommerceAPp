"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

export default function NewCouponPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    discount: "",
    discount_type: "percentage" as "percentage" | "fixed",
    expiry_date: "",
    usage_limit: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        discount: parseFloat(form.discount),
        discount_type: form.discount_type,
        expiry_date: form.expiry_date || null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const err = data.error;
      setError(
        typeof err === "string"
          ? err
          : err?.fieldErrors
            ? Object.values(err.fieldErrors).flat().join("; ")
            : "Failed to create coupon"
      );
      return;
    }

    router.push("/vendor/coupons");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="New coupon" description="Discount applies only to your products in the cart" />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon code</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="SAVE10"
            required
            minLength={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Discount type</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["percentage", "fixed"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, discount_type: type })}
                className={cn(
                  "rounded-xl border-2 p-3 text-sm font-medium capitalize transition-all",
                  form.discount_type === type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">
            {form.discount_type === "percentage" ? "Percentage off" : "Fixed amount off (NGN)"}
          </Label>
          <Input
            id="discount"
            type="number"
            min="0"
            step={form.discount_type === "percentage" ? "1" : "0.01"}
            max={form.discount_type === "percentage" ? "100" : undefined}
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry date (optional)</Label>
            <Input
              id="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usage_limit">Usage limit (optional)</Label>
            <Input
              id="usage_limit"
              type="number"
              min="1"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/vendor/coupons">Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Creating..." : "Create coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
