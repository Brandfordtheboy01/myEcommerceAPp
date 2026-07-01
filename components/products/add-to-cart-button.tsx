"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export function AddToCartButton({ productId, name, price, stock, imageUrl }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      size="lg"
      disabled={stock === 0}
      onClick={() => addItem({ productId, name, price, imageUrl, stock })}
    >
      {stock === 0 ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
