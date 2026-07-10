import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <Container size="sm" className="py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Payment successful!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for your purchase. Your order is being processed and vendors will be notified.
        </p>
        {order && (
          <p className="mt-2 text-sm font-medium">
            Order #{order.slice(0, 8).toUpperCase()}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {order && (
            <Button asChild variant="outline">
              <Link href={`/orders/${order}`}>
                <Package className="size-4" />
                View order
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/">
              Continue shopping
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
