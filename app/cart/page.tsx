"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to get started.</p>
        <Button className="mt-6" asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <p className="w-20 text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-6">
        <p className="text-lg font-semibold">Total: {formatCurrency(getTotal())}</p>
        <Button asChild>
          <Link href="/checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
