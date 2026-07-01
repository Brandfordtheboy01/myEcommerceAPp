import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/orders" className="text-sm text-muted-foreground hover:underline">
        ← Back to orders
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
      <div className="mt-2 flex gap-2">
        <Badge variant="outline">{order.payment_status}</Badge>
        <Badge>{order.order_status}</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.order_items?.map((item: { id: string; quantity: number; price: number; products?: { name: string } }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.products?.name} × {item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
