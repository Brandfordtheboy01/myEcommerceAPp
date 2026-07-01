import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentCancelledPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Payment cancelled</h1>
      <p className="mt-2 text-muted-foreground">Your order was not completed.</p>
      <div className="mt-6 flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/cart">Back to cart</Link>
        </Button>
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
