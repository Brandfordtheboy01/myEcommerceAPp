import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  paid: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <Container size="md" className="py-8 sm:py-10">
      <PageHeader
        title="My orders"
        description="Track and manage your purchase history"
      />

      {!orders?.length ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you make a purchase, your orders will appear here with tracking details."
          actionLabel="Start shopping"
          actionHref="/"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <article className="group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold group-hover:text-primary">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("capitalize", statusColors[order.payment_status] ?? "")}>
                      {order.payment_status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {order.order_status}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(order.total_amount)}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
