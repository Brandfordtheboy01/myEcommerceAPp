"use client";

import { ArrowUpRight } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils/format";

interface VendorSalesChartProps {
  salesData: Array<{
    period: string;
    revenue: number;
    earnings: number;
  }>;
}

export function VendorSalesChart({ salesData }: VendorSalesChartProps) {
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

  function formatCurrencyTooltipValue(value: unknown) {
    return typeof value === "number" ? formatCurrency(value) : String(value ?? "");
  }

  return (
    <Card className="shadow-sm">
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
            <YAxis yAxisId="revenue" hide domain={[0, 'auto']} />
            <YAxis yAxisId="earnings" hide domain={[0, 'auto']} />
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
  );
}
