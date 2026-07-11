import { format } from "date-fns";
import Link from "next/link";
import { Settings2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { VendorKpiStrip } from "./_components/vendor-kpi-strip";
import { VendorTopProducts } from "./_components/vendor-top-products";
import { VendorInventory } from "./_components/vendor-inventory";
import { VendorReviews } from "./_components/vendor-reviews";
import { VendorRecentOrders } from "./_components/vendor-recent-orders";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
        <p className="text-muted-foreground">Complete vendor onboarding to access your dashboard.</p>
        <Button className="mt-6" asChild>
          <Link href="/vendor-register">Register as vendor</Link>
        </Button>
      </div>
    );
  }

  const [
    { count: productCount },
    { count: activeCouponsCount },
    { data: vendorOrdersRaw },
    { data: productsRaw },
    { data: reviewsRaw },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("vendor_id", vendor.id).eq("is_active", true),
    supabase
      .from("vendor_orders")
      .select(`
        id,
        order_id,
        subtotal,
        commission_amount,
        vendor_earnings,
        status,
        created_at,
        orders (
          id,
          users (
            fullname
          )
        ),
        order_items (
          id,
          quantity,
          price,
          products (
            name
          )
        )
      `)
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false }),
    supabase.from("products").select("*, categories(name)").eq("vendor_id", vendor.id).order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*, products!inner(name, vendor_id), users(fullname)")
      .eq("products.vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Calculate sales data for chart (group by month)
  const salesData = await calculateSalesData(supabase, vendor.id);

  // Get top products by sales
  const topProductsData = await getTopProducts(supabase, vendor.id);

  // Calculate review stats
  const reviewStats = reviewsRaw && reviewsRaw.length > 0 
    ? {
        averageRating: reviewsRaw.reduce((sum, r) => sum + r.rating, 0) / reviewsRaw.length,
        totalReviews: reviewsRaw.length,
      }
    : { averageRating: 0, totalReviews: 0 };

  // Calculate average order value
  const totalSubtotal = (vendorOrdersRaw || []).reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const avgOrderValue = (vendorOrdersRaw || []).length > 0 ? totalSubtotal / (vendorOrdersRaw || []).length : 0;

  // Format orders for the table
  const formattedOrders = (vendorOrdersRaw || []).map((order: any) => {
    // Determine customer name - handle both array and single object cases
    let customer = "Customer";
    if (order.orders) {
      const ordersData = Array.isArray(order.orders) ? order.orders[0] : order.orders;
      if (ordersData?.users) {
        const usersData = Array.isArray(ordersData.users) ? ordersData.users[0] : ordersData.users;
        customer = usersData?.fullname || "Customer";
      }
    }

    // Determine items description
    let itemsDescription = "0 items";
    let totalItems = 0;
    if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
      totalItems = order.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      const firstItemName = order.order_items[0].products?.name || "Product";
      if (order.order_items.length === 1) {
        itemsDescription = `${firstItemName} x${order.order_items[0].quantity || 1}`;
      } else {
        itemsDescription = `${firstItemName} + ${totalItems - (order.order_items[0].quantity || 1)} other items`;
      }
    }

    return {
      id: order.order_id,
      order_id: order.order_id,
      customer,
      subtotal: Number(order.subtotal || 0),
      commission: Number(order.commission_amount || 0),
      earnings: Number(order.vendor_earnings || 0),
      status: (order.status || "Pending") as any,
      created_at: order.created_at,
      items: itemsDescription,
      date: order.created_at,
    };
  });

  // Format reviews
  const formattedReviews = (reviewsRaw || []).map((review: any) => {
    let customer = "Customer";
    if (review.users && !Array.isArray(review.users)) {
      customer = review.users.fullname || "Customer";
    }

    let productName = "Product";
    if (review.products && !Array.isArray(review.products)) {
      productName = review.products.name || "Product";
    }

    return {
      id: review.id,
      customer,
      rating: review.rating,
      comment: review.comment || "",
      product_name: productName,
      created_at: review.created_at,
    };
  });

  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">{vendor.business_name}</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Badge variant={vendor.status === "approved" ? "default" : "secondary"} className="capitalize">
            {vendor.status}
          </Badge>

          <Select defaultValue="this-month">
            <SelectTrigger className="w-34" id="vendor-period" size="sm" aria-label="Select time period">
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Button size="icon-sm" variant="outline" aria-label="Dashboard settings">
            <Settings2 />
          </Button>
        </div>
      </div>

      {vendor.status !== "approved" && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300">
          Your vendor account is pending admin approval. You can prepare products, but they won&apos;t be visible until approved.
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12">
        <VendorKpiStrip
          balance={vendor.balance || 0}
          totalEarnings={vendor.total_earnings || 0}
          productCount={productCount ?? 0}
          orderCount={vendorOrdersRaw?.length ?? 0}
          activeCoupons={activeCouponsCount ?? 0}
          avgOrderValue={avgOrderValue}
          salesData={salesData}
        />

        <div className="lg:col-span-1 xl:col-span-4">
          <VendorTopProducts products={topProductsData} />
        </div>
        <div className="lg:col-span-1 xl:col-span-4">
          <VendorInventory products={productsRaw || []} />
        </div>
        <div className="lg:col-span-1 xl:col-span-4">
          <VendorReviews 
            reviews={formattedReviews} 
            averageRating={reviewStats.averageRating} 
            totalReviews={reviewStats.totalReviews} 
          />
        </div>
        
        <div className="lg:col-span-2 xl:col-span-12">
          <VendorRecentOrders orders={formattedOrders} />
        </div>
      </div>
    </div>
  );
}

async function calculateSalesData(supabase: any, vendorId: string) {
  const { data: orders } = await supabase
    .from("vendor_orders")
    .select("created_at, subtotal, vendor_earnings")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: true });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (!orders || orders.length === 0) {
    const defaultResult = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = months[date.getMonth()];
      defaultResult.push({
        period: monthKey,
        revenue: 0,
        earnings: 0,
      });
    }
    return defaultResult;
  }

  // Group by month
  const monthlyData = new Map<string, { revenue: number; earnings: number }>();

  orders.forEach((order: any) => {
    const date = new Date(order.created_at);
    const monthKey = months[date.getMonth()];
    const current = monthlyData.get(monthKey) || { revenue: 0, earnings: 0 };
    monthlyData.set(monthKey, {
      revenue: current.revenue + Number(order.subtotal || 0),
      earnings: current.earnings + Number(order.vendor_earnings || 0),
    });
  });

  // Return last 6 months of data
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = months[date.getMonth()];
    const data = monthlyData.get(monthKey) || { revenue: 0, earnings: 0 };
    result.push({
      period: monthKey,
      revenue: data.revenue,
      earnings: data.earnings,
    });
  }

  return result;
}

async function getTopProducts(supabase: any, vendorId: string) {
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity, price, products!inner(name, categories(name))")
    .eq("products.vendor_id", vendorId);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Aggregate by product
  const productMap = new Map<string, { name: string; category: string; sales: number; revenue: number }>();

  orderItems.forEach((item: any) => {
    const product = item.products;
    if (!product) return;

    const current = productMap.get(item.product_id) || {
      name: product.name,
      category: product.categories?.name || "Uncategorized",
      sales: 0,
      revenue: 0,
    };

    productMap.set(item.product_id, {
      name: product.name,
      category: product.categories?.name || "Uncategorized",
      sales: current.sales + (item.quantity || 0),
      revenue: current.revenue + ((item.quantity || 0) * Number(item.price || 0)),
    });
  });

  // Sort by sales and return top 5
  return Array.from(productMap.entries())
    .sort((a, b) => b[1].sales - a[1].sales)
    .slice(0, 5)
    .map(([id, p], index) => ({
      id,
      ...p,
    }));
}
