"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";

interface CartSheetProps {
  triggerClassName?: string;
}

export function CartSheet({ triggerClassName }: CartSheetProps) {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName} aria-label="Open cart">
          <span className="relative">
            <ShoppingCart className="size-4" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]">
                {itemCount > 9 ? "9+" : itemCount}
              </Badge>
            )}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <ShoppingCart className="size-5" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Add items while you browse — they’ll show up here.</p>
            <Button asChild className="mt-6">
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto px-4 pb-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 rounded-xl border bg-card p-3">
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                      ) : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.productId}`} className="line-clamp-2 text-sm font-medium hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.price)}</p>

                      <div className="mt-3 flex items-center justify-between gap-3">
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
            </div>

            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-semibold">{formatCurrency(total)}</p>
              </div>
              <Button asChild className="mt-4 w-full" size="lg">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/cart">View full cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

