import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as Record<string, string> | null;

  return (
    <Container size="md" className="py-8 sm:py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/orders">
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("capitalize", statusColors[order.payment_status] ?? "")}>
            Payment: {order.payment_status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {order.order_status}
          </Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Order items</h2>
          <ul className="mt-4 space-y-3">
            {order.order_items?.map((item: { id: string; quantity: number; price: number; products?: { name: string } }) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span>
                  {item.products?.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
          {order.discount_amount > 0 && (
            <p className="mt-2 text-sm text-success">
              Includes {formatCurrency(order.discount_amount)} coupon discount
            </p>
          )}
        </section>

        {address && (
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="font-semibold">Shipping address</h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{address.fullname}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.postal_code}</p>
              <p>{address.country}</p>
              {address.phone && <p className="pt-2">{address.phone}</p>}
            </address>
          </section>
        )}
      </div>
    </Container>
  );
}
