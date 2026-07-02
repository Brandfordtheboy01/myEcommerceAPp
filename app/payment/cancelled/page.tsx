import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function PaymentCancelledPage() {
  return (
    <Container size="sm" className="py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Payment cancelled</h1>
        <p className="mt-3 text-muted-foreground">
          Your payment was not completed. Your cart items are still saved — you can try again when ready.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/cart">
              <ArrowLeft className="size-4" />
              Back to cart
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <ShoppingBag className="size-4" />
              Continue shopping
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
