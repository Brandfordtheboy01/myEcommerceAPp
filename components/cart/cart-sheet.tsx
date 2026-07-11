"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";

// Mock size/color helpers to match SHOP.CO design
function getItemMeta(name: string, idx: number) {
  const n = name.toLowerCase();
  if (n.includes("gradient")) return { size: "Large", color: "White" };
  if (n.includes("checkered")) return { size: "Medium", color: "Red" };
  if (n.includes("skinny") || n.includes("jeans")) return { size: "Large", color: "Blue" };
  const sizes = ["Small", "Medium", "Large", "X-Large"];
  const colors = ["White", "Red", "Blue", "Black", "Olive"];
  return { size: sizes[idx % sizes.length], color: colors[idx % colors.length] };
}

interface CartSheetProps {
  triggerClassName?: string;
}

export function CartSheet({ triggerClassName }: CartSheetProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            {isMounted && itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]">
                {itemCount > 9 ? "9+" : itemCount}
              </Badge>
            )}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-white p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <SheetTitle className="text-xl font-black uppercase tracking-tight text-black">
            Your Cart
            {isMounted && itemCount > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-400 normal-case tracking-normal">
                ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex items-center justify-center size-16 rounded-full bg-[#F0F0F0]">
              <ShoppingCart className="size-6 text-gray-400" />
            </div>
            <p className="font-bold text-black text-lg">Your cart is empty</p>
            <p className="mt-1.5 text-sm text-gray-400 max-w-[240px]">
              Add items while you browse — they&apos;ll show up here.
            </p>
            <Link
              href="/"
              className="mt-6 bg-black text-white font-bold text-sm rounded-full px-8 py-3 hover:bg-black/90 active:scale-95 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable cart items */}
            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const meta = getItemMeta(item.name, idx);
                  return (
                    <div
                      key={item.productId}
                      className="flex gap-3.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      {/* Product image */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative size-[100px] shrink-0 bg-[#F0F0F0] rounded-[12px] overflow-hidden flex items-center justify-center"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <div className="text-[10px] text-gray-400">No Image</div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div className="relative pr-7">
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-bold text-black text-sm line-clamp-1 hover:text-black/70 transition"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Size: <span className="text-gray-500">{meta.size}</span>
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Color: <span className="text-gray-500">{meta.color}</span>
                          </p>

                          {/* Delete button - top right */}
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="absolute top-0 right-0 text-red-400 hover:text-red-500 transition active:scale-90"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Price + quantity row */}
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="font-bold text-black text-base">
                            {formatCurrency(item.price)}
                          </span>

                          {/* Pill quantity selector */}
                          <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-3 py-1.5 w-24">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="text-black hover:text-black/60 active:scale-90 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} className="stroke-[2.5px]" />
                            </button>
                            <span className="font-bold text-black text-xs select-none">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="text-black hover:text-black/60 active:scale-90 transition"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} className="stroke-[2.5px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer summary */}
            <div className="border-t border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-bold text-black">{formatCurrency(total)}</span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full bg-black hover:bg-black/90 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 transition duration-200"
              >
                Go to Checkout
                <ArrowRight size={14} className="stroke-[2.5px]" />
              </Link>

              {/* View full cart link */}
              <Link
                href="/cart"
                className="w-full border border-gray-200 hover:bg-gray-50 text-black font-semibold text-sm py-3 rounded-full flex items-center justify-center transition duration-200 active:scale-[0.98]"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
