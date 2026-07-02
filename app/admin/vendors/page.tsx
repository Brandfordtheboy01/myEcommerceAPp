"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Users } from "lucide-react";
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
      <PageHeader
        title="Vendor management"
        description="Review and approve vendor applications"
      />

      {!vendors.length ? (
        <EmptyState
          icon={Users}
          title="No vendors yet"
          description="Vendor applications will appear here for review."
        />
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{vendor.business_name}</p>
                <p className="text-sm text-muted-foreground">{vendor.business_email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={vendor.status === "approved" ? "default" : "secondary"} className="capitalize">
                  {vendor.status}
                </Badge>
                {vendor.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(vendor.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(vendor.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
