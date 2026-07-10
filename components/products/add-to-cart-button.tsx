"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
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
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, price, imageUrl, stock });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button size="lg" className="w-full sm:w-auto" disabled={stock === 0} onClick={handleClick}>
      {stock === 0 ? (
        "Out of stock"
      ) : added ? (
        <>
          <Check className="size-4" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          Add to cart
        </>
      )}
    </Button>
  );
}
