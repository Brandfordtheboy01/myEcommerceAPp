"use client";

import { ArrowUpRight } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number; // quantity sold
  revenue: number; // total revenue
}

interface VendorTopProductsProps {
  products: Product[];
}

export function VendorTopProducts({ products }: VendorTopProductsProps) {
  const totalQuantity = products.reduce((sum, p) => sum + p.sales, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  // Group by category for distribution
  const categoryMap = new Map<string, number>();
  products.forEach((product) => {
    const current = categoryMap.get(product.category) || 0;
    categoryMap.set(product.category, current + product.sales);
  });

  const categoryColors = [
    "var(--chart-3)",
    "var(--chart-2)",
    "var(--chart-1)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const categories = Array.from(categoryMap.entries())
    .map(([name, qty], index) => ({
      name,
      share: totalQuantity > 0 ? Math.round((qty / totalQuantity) * 100) : 0,
      color: categoryColors[index % categoryColors.length],
    }))
    .filter((c) => c.share > 0);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Top Products</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {products.length > 0 ? `${Math.round((products.slice(0, 3).reduce((sum, p) => sum + p.revenue, 0) / (totalRevenue || 1)) * 100)}% of sales` : "0% of sales"}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {categories.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div aria-label="Sales by category" className="flex h-2 gap-1 overflow-hidden bg-muted rounded-md" role="img">
              {categories.map((category) => (
                <div
                  aria-hidden="true"
                  key={category.name}
                  style={{
                    backgroundColor: category.color,
                    width: `${category.share}%`,
                  }}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <div className="flex items-center gap-1" key={category.name}>
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-muted-foreground text-xs">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2">No category data available</div>
        )}

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs">Products</div>
          <div className="text-muted-foreground text-xs">Share</div>
          <div className="text-muted-foreground text-xs">Sales</div>

          {products.length > 0 ? (
            products.slice(0, 3).map((product) => {
              const sharePercent = totalRevenue > 0 ? Math.round((product.revenue / totalRevenue) * 100) : 0;
              return (
                <div className="contents text-sm" key={product.id}>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{product.name}</div>
                    <div className="text-muted-foreground text-xs">{product.category}</div>
                  </div>
                  <div className="self-center text-muted-foreground tabular-nums">{sharePercent}%</div>
                  <div className="self-center font-medium tabular-nums">{formatCurrency(product.revenue)}</div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
              No product sales yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
