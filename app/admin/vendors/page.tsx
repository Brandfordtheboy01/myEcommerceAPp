"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Separator } from "@/components/ui/separator";
import { Users, DollarSign, Wallet, Calendar, MapPin, Phone, Mail, Building2, TrendingUp, Check, X, Ban, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { Vendor } from "@/types/database";

interface VendorDetail {
  id: string;
  business_name: string;
  business_email: string | null;
  business_description: string | null;
  business_phone: string | null;
  business_address: any;
  tax_id: string | null;
  logo_url: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  commission_rate: number;
  payout_method: any;
  payout_details: any;
  balance: number;
  total_earnings: number;
  approved_at: string | null;
  rejected_at: string | null;
  suspended_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_fullname?: string;
  order_count?: number;
  total_orders_value?: number;
  last_order_date?: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("vendors")
        .select("*, users(email, fullname)")
        .order("created_at", { ascending: false });
      
      const vendorsWithStats = await Promise.all(
        (data as any[]).map(async (vendor) => {
          const [{ count: orderCount }, { data: orders }] = await Promise.all([
            supabase.from("vendor_orders").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id),
            supabase.from("vendor_orders").select("subtotal, created_at").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(1),
          ]);
          
          return {
            ...vendor,
            user_email: vendor.users?.email,
            user_fullname: vendor.users?.fullname,
            order_count: orderCount || 0,
            total_orders_value: orderCount || 0, // Would need aggregation
            last_order_date: orders?.[0]?.created_at,
          };
        })
      );
      
      setVendors(vendorsWithStats as VendorDetail[]);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    const res = await fetch(`/api/admin/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: status as Vendor["status"] } : v)));
    }
    setActionId(null);
  }

  function getStatusBadge(status: string) {
    if (status === "approved") {
      return <Badge className="border-green-600/30 text-green-600 dark:border-green-400/30 dark:text-green-400" variant="outline">Approved</Badge>;
    }
    if (status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (status === "suspended") {
      return <Badge className="border-yellow-600/30 text-yellow-600 dark:border-yellow-400/30 dark:text-yellow-400" variant="outline">Suspended</Badge>;
    }
    return <Badge className="border-blue-600/30 text-blue-600 dark:border-blue-400/30 dark:text-blue-400" variant="outline">Pending</Badge>;
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
        description="Review and manage vendor applications and accounts"
      />

      {!vendors.length ? (
        <EmptyState
          icon={Users}
          title="No vendors yet"
          description="Vendor applications will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    {vendor.logo_url && (
                      <img src={vendor.logo_url} alt={vendor.business_name} className="size-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{vendor.business_name}</p>
                        {getStatusBadge(vendor.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{vendor.business_email || vendor.user_email}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wallet className="size-3" />
                          {formatCurrency(vendor.balance)} balance
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="size-3" />
                          {formatCurrency(vendor.total_earnings)} earned
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-3" />
                          {vendor.commission_rate}% commission
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setExpandedVendorId(expandedVendorId === vendor.id ? null : vendor.id)}>
                      {expandedVendorId === vendor.id ? (
                        <>
                          <ChevronUp className="size-4 mr-2" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                    {vendor.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(vendor.id, "approved")} disabled={actionId === vendor.id}>
                          <Check className="size-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(vendor.id, "rejected")} disabled={actionId === vendor.id}>
                          <X className="size-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {vendor.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(vendor.id, "suspended")} disabled={actionId === vendor.id}>
                        <Ban className="size-4 mr-1" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {expandedVendorId === vendor.id && (
                <CardContent className="border-t p-5 space-y-6">
                  {/* Financial Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Wallet className="size-4" />
                          Balance
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(vendor.balance)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="size-4" />
                          Total Earnings
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(vendor.total_earnings)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <DollarSign className="size-4" />
                          Commission Rate
                        </div>
                        <p className="text-2xl font-bold">{vendor.commission_rate}%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="size-4" />
                          Orders
                        </div>
                        <p className="text-2xl font-bold">{vendor.order_count || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Business Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="size-4" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Business Name</label>
                        <p className="font-medium">{vendor.business_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Business Email</label>
                        <p className="font-medium">{vendor.business_email || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Business Phone</label>
                        <p className="font-medium">{vendor.business_phone || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Tax ID</label>
                        <p className="font-medium">{vendor.tax_id || "—"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-muted-foreground">Business Description</label>
                        <p className="font-medium">{vendor.business_description || "—"}</p>
                      </div>
                      {vendor.business_address && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="size-4" />
                            Business Address
                          </label>
                          <p className="font-medium">{typeof vendor.business_address === 'string' ? vendor.business_address : JSON.stringify(vendor.business_address)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Account Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="size-4" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Account Owner</label>
                        <p className="font-medium">{vendor.user_fullname || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="size-4" />
                          Account Email
                        </label>
                        <p className="font-medium">{vendor.user_email || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="size-4" />
                          Joined Date
                        </label>
                        <p className="font-medium">{new Date(vendor.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Status</label>
                        <p className="font-medium">{getStatusBadge(vendor.status)}</p>
                      </div>
                      {vendor.approved_at && (
                        <div>
                          <label className="text-sm text-muted-foreground">Approved Date</label>
                          <p className="font-medium">{new Date(vendor.approved_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {vendor.rejected_at && (
                        <div>
                          <label className="text-sm text-muted-foreground">Rejected Date</label>
                          <p className="font-medium">{new Date(vendor.rejected_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {vendor.suspended_at && (
                        <div>
                          <label className="text-sm text-muted-foreground">Suspended Date</label>
                          <p className="font-medium">{new Date(vendor.suspended_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {vendor.rejection_reason && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Rejection Reason</label>
                          <p className="font-medium text-destructive">{vendor.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payout Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Wallet className="size-4" />
                      Payout Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Payout Method</label>
                        <p className="font-medium">{vendor.payout_method ? typeof vendor.payout_method === 'string' ? vendor.payout_method : JSON.stringify(vendor.payout_method) : "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Payout Details</label>
                        <p className="font-medium">{vendor.payout_details ? typeof vendor.payout_details === 'string' ? vendor.payout_details : JSON.stringify(vendor.payout_details) : "—"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    {vendor.status === "pending" && (
                      <>
                        <Button onClick={() => updateStatus(vendor.id, "approved")} disabled={actionId === vendor.id}>
                          <Check className="size-4 mr-2" />
                          Approve Vendor
                        </Button>
                        <Button variant="destructive" onClick={() => updateStatus(vendor.id, "rejected")} disabled={actionId === vendor.id}>
                          <X className="size-4 mr-2" />
                          Reject Vendor
                        </Button>
                      </>
                    )}
                    {vendor.status === "approved" && (
                      <Button variant="outline" onClick={() => updateStatus(vendor.id, "suspended")} disabled={actionId === vendor.id}>
                        <Ban className="size-4 mr-2" />
                        Suspend Vendor
                      </Button>
                    )}
                    {vendor.status === "suspended" && (
                      <Button onClick={() => updateStatus(vendor.id, "approved")} disabled={actionId === vendor.id}>
                        <Check className="size-4 mr-2" />
                        Reactivate Vendor
                      </Button>
                    )}
                    {vendor.status === "rejected" && (
                      <Button onClick={() => updateStatus(vendor.id, "approved")} disabled={actionId === vendor.id}>
                        <Check className="size-4 mr-2" />
                        Re-approve Vendor
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
