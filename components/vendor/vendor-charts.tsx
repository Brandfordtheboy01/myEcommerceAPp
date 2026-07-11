"use client";

import { ArrowUpRight } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data representing a rolling sales overview
const salesData = [
  { period: "Jan", revenue: 4820, profit: 1150 },
  { period: "Feb", revenue: 5140, profit: 1430 },
  { period: "Mar", revenue: 4920, profit: 1270 },
  { period: "Apr", revenue: 5480, profit: 1425 },
  { period: "May", revenue: 5840, profit: 1510 },
  { period: "Jun", revenue: 6280, profit: 1630 },
  { period: "Jul", revenue: 6820, profit: 1770 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--foreground)",
  },
  profit: {
    label: "Profit",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatCurrencyTooltipValue(value: unknown) {
  return typeof value === "number" ? `$${value.toLocaleString()}` : String(value ?? "");
}

export function VendorCharts() {
  return (
    <Card className="h-full rounded-xl border-0 ring-1 ring-foreground/10 shadow-sm mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-normal text-lg">Sales Overview</CardTitle>
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
            <CartesianGrid yAxisId="profit" vertical={false} />
            <XAxis
              dataKey="period"
              axisLine={false}
              height={30}
              tick={{ fontSize: 10 }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis yAxisId="revenue" hide domain={[3000, 10000]} />
            <YAxis yAxisId="profit" hide domain={[0, 6000]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-40"
                  labelFormatter={(value) => `Sales Period: ${value}`}
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
              yAxisId="profit"
              barSize={6}
              dataKey="profit"
              fill="var(--color-profit)"
              name="Profit"
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
              strokeWidth={2}
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
  );
}
