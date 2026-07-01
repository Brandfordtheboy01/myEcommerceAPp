import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-green-600">Payment successful</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you! Your order is being processed.
        {order && ` Order #${order.slice(0, 8)}`}
      </p>
      <div className="mt-6 flex justify-center gap-4">
        {order && (
          <Button asChild variant="outline">
            <Link href={`/orders/${order}`}>View order</Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
