import { format } from "date-fns";
import { Settings2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { KpiStrip } from "./_components/kpi-strip";
import { RecentOrders } from "./_components/recent-orders";
import { VendorManagement } from "./_components/vendor-management";
import { VendorPayouts } from "./_components/vendor-payouts";
import type { OrderRow } from "./_components/recent-orders-table/schema";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  // ─── Parallel fetches — admin only cares about vendors + payments ──────────
  const [
    { data: vendorsRaw },
    { data: vendorOrdersRaw },
    { data: payoutsRaw },
    { data: ordersRaw },
  ] = await Promise.all([
    // All vendors — for management table and KPIs
    supabase
      .from("vendors")
      .select("id, business_name, business_email, balance, total_earnings, commission_rate, status, created_at, users(email, fullname)")
      .order("created_at", { ascending: false }),
    // vendor_orders — for commission calculations and chart
    supabase
      .from("vendor_orders")
      .select("commission_amount, subtotal, created_at, vendor_id")
      .order("created_at", { ascending: false }),
    // Completed payouts
    supabase
      .from("vendor_payouts")
      .select("amount, status")
      .eq("status", "completed"),
    // Platform orders (admin view = payment status + commission earned)
    supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        payment_status,
        created_at,
        shipping_address,
        vendor_orders ( commission_amount, vendor_id )
      `)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const vendors = (vendorsRaw ?? []).map((v: any) => ({
    ...v,
    auth_email: Array.isArray(v.users) ? v.users[0]?.email : v.users?.email,
  }));
  const vendorOrders = vendorOrdersRaw ?? [];
  const orders = ordersRaw ?? [];


  // ─── KPI computations (admin's domain) ────────────────────────────────────
  const totalCommission = vendorOrders.reduce((sum, vo) => sum + Number(vo.commission_amount || 0), 0);
  const platformRevenue = vendorOrders.reduce((sum, vo) => sum + Number(vo.subtotal || 0), 0);
  const activeVendors = vendors.filter((v) => v.status === "approved").length;
  const pendingVendors = vendors.filter((v) => v.status === "pending").length;
  const totalPayoutsProcessed = (payoutsRaw ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const avgCommissionRate =
    vendors.length > 0
      ? vendors.reduce((sum, v) => sum + Number(v.commission_rate || 0), 0) / vendors.length
      : 0;

  // ─── Commission chart — last 6 months ─────────────────────────────────────
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const commByMonth = new Map<string, { commission: number; revenue: number }>();
  vendorOrders.forEach((vo) => {
    const m = months[new Date(vo.created_at).getMonth()];
    const existing = commByMonth.get(m) ?? { commission: 0, revenue: 0 };
    commByMonth.set(m, {
      commission: existing.commission + Number(vo.commission_amount || 0),
      revenue: existing.revenue + Number(vo.subtotal || 0),
    });
  });
  const now = new Date();
  const commissionData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const period = months[d.getMonth()];
    const data = commByMonth.get(period) ?? { commission: 0, revenue: 0 };
    return { period, ...data };
  });

  // ─── Recent orders — admin view: payment + commission only ─────────────────
  const recentOrders: OrderRow[] = orders.map((o: any) => {
    // Extract customer fullname from shipping_address JSONB
    let customer = "Customer";
    if (o.shipping_address) {
      const shippingAddress = typeof o.shipping_address === 'string'
        ? JSON.parse(o.shipping_address)
        : o.shipping_address;
      customer = shippingAddress?.fullname || "Customer";
    }
    
    const vendorOrderList = Array.isArray(o.vendor_orders) ? o.vendor_orders : [];
    const totalCommissionForOrder = vendorOrderList.reduce(
      (sum: number, vo: any) => sum + Number(vo.commission_amount || 0),
      0
    );
    const paymentMap: Record<string, OrderRow["payment"]> = {
      paid: "Paid",
      refunded: "Refunded",
      pending: "Pending",
      failed: "Pending",
    };
    return {
      id: `#${o.id.slice(0, 8).toUpperCase()}`,
      date: o.created_at,
      customer,
      payment: paymentMap[o.payment_status] ?? "Pending",
      total: `$${Number(o.total_amount).toFixed(2)}`,
      commission: `$${totalCommissionForOrder.toFixed(2)}`,
      vendorCount: new Set(vendorOrderList.map((vo: any) => vo.vendor_id)).size,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="all-time">
            <SelectTrigger className="w-34" id="admin-period" size="sm" aria-label="Select time period">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Button size="icon-sm" variant="outline" aria-label="Dashboard settings">
            <Settings2 />
          </Button>
        </div>
      </div>

      {/* Pending vendors alert strip */}
      {pendingVendors > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm">
          <span className="font-medium text-yellow-700 dark:text-yellow-300">
            {pendingVendors} vendor{pendingVendors !== 1 ? "s" : ""} awaiting approval
          </span>
          <span className="ml-2 text-muted-foreground">— review them in the Vendor Management section below.</span>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12">
        {/* KPI strip + commission chart — full width */}
        <KpiStrip
          totalCommission={totalCommission}
          platformRevenue={platformRevenue}
          activeVendors={activeVendors}
          pendingVendors={pendingVendors}
          totalPayoutsProcessed={totalPayoutsProcessed}
          avgCommissionRate={avgCommissionRate}
          commissionData={commissionData}
        />

        {/* Vendor Management — approve / reject / suspend */}
        <div className="lg:col-span-2 xl:col-span-7">
          <VendorManagement initialVendors={vendors} />
        </div>

        {/* Vendor Payout balances */}
        <div className="lg:col-span-2 xl:col-span-5">
          <VendorPayouts vendors={vendors} />
        </div>

        {/* Platform orders — payment + commission perspective only */}
        <div className="lg:col-span-2 xl:col-span-12">
          <RecentOrders orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}
