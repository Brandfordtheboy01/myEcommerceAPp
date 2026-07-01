"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Vendor } from "@/types/database";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      setVendors((data as Vendor[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: status as Vendor["status"] } : v)));
    }
  }

  if (loading) return <p className="p-8 text-center text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Dashboard</Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Vendor management</h1>

      {!vendors.length ? (
        <p className="text-muted-foreground">No vendors registered.</p>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{vendor.business_name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.business_email}</p>
                </div>
                <Badge variant={vendor.status === "approved" ? "default" : "secondary"}>
                  {vendor.status}
                </Badge>
                {vendor.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(vendor.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(vendor.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
