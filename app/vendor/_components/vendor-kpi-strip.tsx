"use client";

import { ArrowUpRight, DollarSign, Package, ShoppingBag, TrendingUp, Percent, ReceiptText } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils/format";

interface VendorKpiStripProps {
  balance: number;
  totalEarnings: number;
  productCount: number;
  orderCount: number;
  activeCoupons: number;
  avgOrderValue: number;
  salesData: Array<{
    period: string;
    revenue: number;
    earnings: number;
  }>;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--foreground)",
  },
  earnings: {
    label: "Earnings",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export function VendorKpiStrip({
  balance,
  totalEarnings,
  productCount,
  orderCount,
  activeCoupons,
  avgOrderValue,
  salesData,
}: VendorKpiStripProps) {
  const formatCurrencyCompact = (value: number) => formatCurrency(value);

  function formatCurrencyTooltipValue(value: unknown) {
    return typeof value === "number" ? formatCurrency(value) : String(value ?? "");
  }

  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-12">
          {/* Left Grid: 6 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Available Balance</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {formatCurrency(balance)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <DollarSign className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">Ready</span>
                  <span className="text-muted-foreground"> for payout</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Total Earnings</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {formatCurrency(totalEarnings)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <TrendingUp className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">Lifetime</span>
                  <span className="text-muted-foreground"> vendor earnings</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Total Orders</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {orderCount}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ShoppingBag className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">All-time</span>
                  <span className="text-muted-foreground"> order count</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Average Order</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {formatCurrencyCompact(avgOrderValue)}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ReceiptText className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">Average size per order</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r md:border-b-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Products Listed</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {productCount}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Package className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">Active items in catalog</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Active Coupons</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {activeCoupons}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Percent className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">Live</span>
                  <span className="text-muted-foreground"> promotional codes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Card: Sales Overview Chart */}
          <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
            <CardHeader>
              <CardTitle className="font-normal">Sales Overview</CardTitle>
              <CardAction>
                <ArrowUpRight className="size-4" />
              </CardAction>
            </CardHeader>

            <CardContent>
              <ChartContainer config={chartConfig} className="h-74 w-full">
                <ComposedChart
                  accessibilityLayer
                  data={salesData}
                  margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                >
                  <defs>
                    <filter id="sales-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="var(--color-revenue)" floodOpacity="0.35" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid yAxisId="earnings" vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    height={30}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis yAxisId="revenue" hide domain={[0, "auto"]} />
                  <YAxis yAxisId="earnings" hide domain={[0, "auto"]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => `Period: ${value}`}
                        formatter={(value, name, item) => (
                          <>
                            <div
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <div className="flex flex-1 items-center justify-between leading-none">
                              <span className="text-muted-foreground">{String(name ?? "")}</span>
                              <span className="font-medium font-mono text-foreground tabular-nums">
                                {formatCurrencyTooltipValue(value)}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                    cursor={{
                      stroke: "var(--border)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Bar
                    yAxisId="earnings"
                    barSize={4}
                    dataKey="earnings"
                    fill="var(--color-earnings)"
                    name="Earnings"
                    opacity={0.18}
                    radius={[6, 6, 0, 0]}
                  />
                  <Area
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="none"
                    filter="url(#sales-line-glow)"
                    name="Revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.8}
                    type="linear"
                    activeDot={{
                      r: 4,
                      fill: "var(--background)",
                      stroke: "var(--color-revenue)",
                      strokeWidth: 2,
                    }}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
