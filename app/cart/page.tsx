"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const total = getTotal();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <Container size="sm" className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our marketplace and find something you love."
          actionLabel="Start shopping"
          actionHref="/"
        />
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <PageHeader
        title="Shopping cart"
        description={`${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card sm:gap-6 sm:p-5"
            >
              <Link
                href={`/products/${item.productId}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24"
              >
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="line-clamp-2 font-medium hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(item.price)} each
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-lg border bg-muted/50 p-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>

                  <p className="w-24 text-right font-semibold sm:w-28">
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border bg-card p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatCurrency(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-success">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-base font-semibold">
            <span>Estimated total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Button className="mt-6 w-full" size="lg" asChild>
            <Link href="/checkout">
              Proceed to checkout
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Button variant="outline" className="mt-3 w-full" asChild>
            <Link href="/">Continue shopping</Link>
          </Button>

          <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>Secure checkout powered by Paystack. Your payment information is encrypted.</p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
