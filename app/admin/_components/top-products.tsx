import { ArrowUpRight } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  share: number;   // percentage of total revenue
  sales: string;   // formatted currency string
}

interface CategoryRow {
  name: string;
  share: number;
  color: string;
}

interface TopProductsProps {
  products: ProductRow[];
  categories: CategoryRow[];
  topSharePercent: number;
}

export function TopProducts({ products, categories, topSharePercent }: TopProductsProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Top Products</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {topSharePercent}% of sales
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {categories.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div aria-label="Sales by category" className="flex h-2 gap-1 overflow-hidden rounded-md bg-muted" role="img">
              {categories.map((category) => (
                <div
                  aria-hidden="true"
                  key={category.name}
                  className="rounded-md"
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
        ) : null}

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs">Products</div>
          <div className="text-muted-foreground text-xs">Share</div>
          <div className="text-muted-foreground text-xs">Sales</div>

          {products.length > 0 ? (
            products.map((product) => (
              <div className="contents text-sm" key={product.id}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{product.name}</div>
                  <div className="text-muted-foreground text-xs">{product.category}</div>
                </div>
                <div className="self-center text-muted-foreground tabular-nums">{product.share}%</div>
                <div className="self-center font-medium tabular-nums">{product.sales}</div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-sm text-muted-foreground">
              No product sales yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
