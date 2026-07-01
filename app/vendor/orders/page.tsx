"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
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

  if (loading) return <p className="p-8 text-center text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/vendor" className="text-sm text-muted-foreground hover:underline">← Dashboard</Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Vendor orders</h1>

      {!orders.length ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(order.subtotal)}</p>
                </div>
                <Badge>{order.status}</Badge>
                <div className="flex gap-2">
                  {order.status === "processing" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "shipped")}>Mark shipped</Button>
                  )}
                  {order.status === "shipped" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "delivered")}>Mark delivered</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
