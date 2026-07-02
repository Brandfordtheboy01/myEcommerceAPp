"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { ShoppingBag } from "lucide-react";
import type { VendorOrder } from "@/types/database";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("vendor_orders")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data as VendorOrder[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/vendor/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as VendorOrder["status"] } : o)));
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
      <PageHeader title="Orders" description="Fulfill and track customer orders" />

      {!orders.length ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="When customers purchase your products, orders will appear here for fulfillment."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(order.subtotal)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="capitalize">{order.status}</Badge>
                {order.status === "processing" && (
                  <Button size="sm" onClick={() => updateStatus(order.id, "shipped")}>
                    Mark shipped
                  </Button>
                )}
                {order.status === "shipped" && (
                  <Button size="sm" onClick={() => updateStatus(order.id, "delivered")}>
                    Mark delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
