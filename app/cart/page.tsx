"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronRight, Tag } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils/format";

// Dynamic mock helper to match the SHOP.CO screenshot sizes/colors exactly
function getItemDetails(name: string, index: number) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("gradient")) {
    return { size: "Large", color: "White" };
  }
  if (lowercaseName.includes("checkered")) {
    return { size: "Medium", color: "Red" };
  }
  if (lowercaseName.includes("skinny") || lowercaseName.includes("jeans")) {
    return { size: "Large", color: "Blue" };
  }
  const sizes = ["Small", "Medium", "Large", "X-Large"];
  const colors = ["White", "Red", "Blue", "Black", "Olive"];
  return {
    size: sizes[index % sizes.length],
    color: colors[index % colors.length],
  };
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const subtotal = getTotal();
  const discountAmount = subtotal * 0.20; // 20% discount as shown in mockup (-20%)
  const deliveryFee = subtotal > 0 ? 15 : 0; // $15 delivery fee as shown in mockup
  const total = subtotal - discountAmount + deliveryFee;

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
    <Container className="py-6 md:py-10 max-w-[1240px]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 font-normal">
        <Link href="/" className="hover:text-black transition">Home</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-black font-medium">Cart</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl md:text-[40px] font-black uppercase tracking-tight text-black mb-6 md:mb-8">
        Your Cart
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_505px] lg:items-start">
        {/* Left Column: Cart Items List */}
        <div className="border border-gray-100 rounded-[20px] p-4 md:p-6 bg-white space-y-4 md:space-y-6">
          {items.map((item, idx) => {
            const { size, color } = getItemDetails(item.name, idx);
            return (
              <div key={item.productId} className="flex gap-4 border-b border-gray-100 pb-4 md:pb-6 last:border-b-0 last:pb-0">
                {/* Image Wrapper */}
                <Link
                  href={`/products/${item.productId}`}
                  className="relative size-24 md:size-[124px] shrink-0 bg-[#F0F0F0] rounded-[15px] overflow-hidden flex items-center justify-center"
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
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Details Wrapper */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="relative pr-8">
                    {/* Title */}
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-bold text-black text-base md:text-xl line-clamp-1 hover:text-black/70 transition"
                    >
                      {item.name}
                    </Link>

                    {/* Size and Color attributes */}
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Size: <span className="text-gray-600">{size}</span>
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Color: <span className="text-gray-600">{color}</span>
                    </p>

                    {/* Delete Action button absolute top right */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="absolute top-0.5 right-0 text-red-500 hover:text-red-600 transition active:scale-90"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} className="md:size-[22px]" />
                    </button>
                  </div>

                  {/* Price and Quantity row */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-black text-xl md:text-2xl">
                      {formatCurrency(item.price)}
                    </span>

                    {/* Quantity Selector pill */}
                    <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-4 py-2 w-28 md:w-32">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="text-black hover:text-black/70 active:scale-90 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} className="stroke-[2.5px]" />
                      </button>
                      <span className="font-bold text-black text-sm select-none">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="text-black hover:text-black/70 active:scale-90 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} className="stroke-[2.5px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
        <aside className="border border-gray-100 rounded-[20px] p-5 md:p-6 bg-white lg:sticky lg:top-24">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Order Summary</h2>

          {/* Details list */}
          <div className="space-y-5 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-black">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discount (-20%)</span>
              <span className="font-bold text-red-500">-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-bold text-black">{formatCurrency(deliveryFee)}</span>
            </div>
          </div>

          <div className="my-5 border-t border-gray-100" />

          {/* Total row */}
          <div className="flex justify-between text-lg md:text-xl font-bold text-black mb-6">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {/* Promo code area */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-full px-4 py-3.5 flex-1 focus-within:ring-1 focus-within:ring-black transition">
              <Tag size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Add promo code"
                className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
              />
            </div>
            <button className="bg-black hover:bg-black/90 active:scale-95 text-white font-bold text-sm px-7 py-3.5 rounded-full transition duration-200">
              Apply
            </button>
          </div>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="w-full bg-black hover:bg-black/90 active:scale-95 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2.5 transition duration-200"
          >
            Go to Checkout
            <ArrowRight size={16} className="stroke-[2.5px]" />
          </Link>
        </aside>
      </div>
    </Container>
  );
}
