"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import type { Coupon } from "@/types/database";

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleActive(id: string, is_active: boolean) {
    const res = await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active } : c)));
    }
  }

  async function removeCoupon(id: string) {
    const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Coupons" description="Create discount codes for your products">
        <Button asChild>
          <Link href="/vendor/coupons/new">
            <Plus className="size-4" />
            New coupon
          </Link>
        </Button>
      </PageHeader>

      {!coupons.length ? (
        <EmptyState
          icon={Tag}
          title="No coupons yet"
          description="Offer percentage or fixed discounts on your products. Customers apply codes at checkout."
          actionLabel="Create coupon"
          actionHref="/vendor/coupons/new"
        />
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-lg font-semibold">{coupon.code}</p>
                  <Badge variant={coupon.is_active ? "default" : "secondary"}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount}% off your products`
                    : `${formatCurrency(coupon.discount)} off your products`}
                  {coupon.expiry_date &&
                    ` · Expires ${new Date(coupon.expiry_date).toLocaleDateString()}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Used {coupon.usage_count}
                  {coupon.usage_limit != null ? ` / ${coupon.usage_limit}` : ""} times
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(coupon.id, !coupon.is_active)}
                >
                  {coupon.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeCoupon(coupon.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
