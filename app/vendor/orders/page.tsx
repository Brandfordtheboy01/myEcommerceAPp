"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Search, RefreshCw, Package, ChevronDown, ChevronUp, MapPin, CreditCard } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";

interface OrderRow {
  id: string;
  vendor_order_id: string;
  order_id: string;
  customer: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number;
  earnings: number;
  items: string;
  created_at: string;
  fullOrder?: {
    total_amount: string;
    payment_status: string;
    payment_method: string;
    payment_reference: string;
    shipping_address: string;
    order_items: Array<{
      quantity: number;
      price: number;
      products: { name: string };
    }>;
  };
}

const orderFilters = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
type OrderFilter = (typeof orderFilters)[number];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
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
            shipping_address
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
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      // Format orders
      const formattedOrders = (data || []).map((order: any) => {
        // Determine customer name from shipping_address JSONB
        let customer = "Customer";
        if (order.orders) {
          const ordersData = Array.isArray(order.orders) ? order.orders[0] : order.orders;
          if (ordersData?.shipping_address) {
            const shippingAddress = typeof ordersData.shipping_address === 'string'
              ? JSON.parse(ordersData.shipping_address)
              : ordersData.shipping_address;
            customer = shippingAddress?.fullname || "Customer";
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
          vendor_order_id: order.id,
          order_id: order.order_id,
          customer,
          subtotal: Number(order.subtotal || 0),
          earnings: Number(order.vendor_earnings || 0),
          status: (order.status || "Pending") as OrderRow["status"],
          items: itemsDescription,
          created_at: order.created_at,
        };
      });

      setOrders(formattedOrders);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/vendor/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as OrderRow["status"] } : o)));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionId(null);
    }
  }

  async function toggleOrderDetails(order: OrderRow) {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    // Fetch detailed order data from API
    try {
      const res = await fetch(`/api/vendor/orders/${order.vendor_order_id}/details`);
      if (!res.ok) {
        console.error('Failed to fetch order details');
        return;
      }

      const data = await res.json();
      const fullOrderData = data.orders;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                fullOrder: fullOrderData ? {
                  total_amount: fullOrderData.total_amount,
                  payment_status: fullOrderData.payment_status,
                  payment_method: fullOrderData.payment_method,
                  payment_reference: fullOrderData.payment_reference,
                  shipping_address: fullOrderData.shipping_address,
                  order_items: data.order_items || [],
                } : undefined,
              }
            : o
        )
      );
      setExpandedOrderId(order.id);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  }

  function OrderDetailsRow({ order }: { order: OrderRow }) {
    if (!order.fullOrder) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <div className="bg-muted/30 p-4 text-sm text-muted-foreground">
              No detailed order information available.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    const shippingAddress = typeof order.fullOrder.shipping_address === 'string'
      ? JSON.parse(order.fullOrder.shipping_address)
      : order.fullOrder.shipping_address;

    return (
      <TableRow>
        <TableCell colSpan={6} className="p-0">
          <div className="bg-muted/30 p-4 space-y-4">
            {/* Shipping Address */}
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Shipping Address</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{shippingAddress?.fullname || 'N/A'}</p>
                  <p>{shippingAddress?.phone || 'N/A'}</p>
                  <p>{shippingAddress?.street || 'N/A'}</p>
                  <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}</p>
                  <p>{shippingAddress?.country || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex items-start gap-3">
              <CreditCard className="size-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Payment Information</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Status: <span className="capitalize">{order.fullOrder.payment_status}</span></p>
                  <p>Method: {order.fullOrder.payment_method || 'N/A'}</p>
                  <p>Reference: {order.fullOrder.payment_reference || 'N/A'}</p>
                  <p>Total: {formatCurrency(Number(order.fullOrder.total_amount))}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex items-start gap-3">
              <Package className="size-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Order Items</p>
                <div className="text-sm space-y-2">
                  {order.fullOrder.order_items && order.fullOrder.order_items.length > 0 ? (
                    order.fullOrder.order_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>{item.products?.name || 'Product'} × {item.quantity}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No items found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Filter orders based on status and search query
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.items.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      activeFilter === "All" || order.status.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  function StatusBadge({ status }: { status: OrderRow["status"] }) {
    const statusLower = status.toLowerCase();

    if (statusLower === "delivered") {
      return (
        <Badge
          className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
          variant="outline"
        >
          Delivered
        </Badge>
      );
    }

    if (statusLower === "cancelled") {
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );
    }

    if (statusLower === "shipped") {
      return (
        <Badge
          className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300"
          variant="outline"
        >
          Shipped
        </Badge>
      );
    }

    if (statusLower === "processing") {
      return (
        <Badge
          className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300"
          variant="outline"
        >
          Processing
        </Badge>
      );
    }

    return (
      <Badge
        className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
        variant="outline"
      >
        Pending
      </Badge>
    );
  }

  function formatOrderDate(date: string) {
    return format(parseISO(date), "h:mm a, d MMM yyyy");
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Orders</CardTitle>
        <CardDescription className="text-foreground text-xl leading-none tracking-tight">
          {orders.length} total orders
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup
            className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30 w-fit"
            onValueChange={(value) => {
              if (value) setActiveFilter(value as OrderFilter);
            }}
            size="sm"
            spacing={1}
            type="single"
            value={activeFilter}
          >
            {orderFilters.map((filter) => (
              <ToggleGroupItem key={filter} value={filter}>
                {filter}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="relative w-full max-w-[260px]">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Order Details</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total / Earnings</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleOrderDetails(order)}
                          >
                            {expandedOrderId === order.id ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                          <div className="flex flex-col gap-0.5">
                            <div className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-muted-foreground text-xs truncate max-w-[150px]" title={order.items}>
                              {order.items}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.customer}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 tabular-nums">
                          <div className="font-medium text-sm">{formatCurrency(order.subtotal)}</div>
                          <div className="text-muted-foreground text-xs">
                            Earned: {formatCurrency(order.earnings)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatOrderDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {actionId === order.id ? (
                            <RefreshCw className="size-4 animate-spin text-muted-foreground mr-2" />
                          ) : order.status === "Processing" ? (
                            <Button
                              onClick={() => updateStatus(order.id, "shipped")}
                              size="sm"
                              className="h-8 px-2.5"
                            >
                              Mark shipped
                            </Button>
                          ) : order.status === "Shipped" ? (
                            <Button
                              onClick={() => updateStatus(order.id, "delivered")}
                              size="sm"
                              className="h-8 px-2.5"
                            >
                              Mark delivered
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">No actions</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order.id && <OrderDetailsRow order={order} />}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Package className="size-8 text-muted-foreground/50" />
                        <p>No orders yet. When customers purchase your products, orders will appear here.</p>
                      </div>
                    ) : (
                      "No orders found matching criteria."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
