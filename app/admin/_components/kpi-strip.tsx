"use client";

import { ArrowUpRight, DollarSign, Store, TrendingUp, Users, Clock, Percent } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils/format";

interface CommissionDataPoint {
  period: string;
  commission: number;
  revenue: number;
}

interface AdminKpiStripProps {
  totalCommission: number;
  platformRevenue: number;
  activeVendors: number;
  pendingVendors: number;
  totalPayoutsProcessed: number;
  avgCommissionRate: number;
  commissionData: CommissionDataPoint[];
}

const chartConfig = {
  commission: {
    label: "Commission",
    color: "var(--foreground)",
  },
  revenue: {
    label: "GMV",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatTooltipValue(value: unknown) {
  return typeof value === "number" ? formatCurrency(value) : String(value ?? "");
}

export function KpiStrip({
  totalCommission,
  platformRevenue,
  activeVendors,
  pendingVendors,
  totalPayoutsProcessed,
  avgCommissionRate,
  commissionData,
}: AdminKpiStripProps) {
  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        {/* Left — 6 admin KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
          <Card className="h-full rounded-none border-0 border-b ring-0 md:border-r">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Platform Commission</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {formatCurrency(totalCommission)}
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <DollarSign className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Admin cut from all vendor orders</div>
            </CardContent>
          </Card>

          <Card className="h-full rounded-none border-0 border-b ring-0">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Gross Merchandise Value</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {formatCurrency(platformRevenue)}
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <TrendingUp className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Total value of all orders</div>
            </CardContent>
          </Card>

          <Card className="h-full rounded-none border-0 border-b ring-0 md:border-r">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Active Vendors</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {activeVendors.toLocaleString()}
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <Store className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Approved, live on the platform</div>
            </CardContent>
          </Card>

          <Card className="h-full rounded-none border-0 border-b ring-0">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Pending Approvals</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {pendingVendors.toLocaleString()}
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <Clock className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={`text-sm ${pendingVendors > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                {pendingVendors > 0 ? "Needs your review" : "All vendors reviewed"}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full rounded-none border-0 border-b ring-0 md:border-r md:border-b-0">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Payouts Processed</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {formatCurrency(totalPayoutsProcessed)}
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <Users className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Total paid out to vendors</div>
            </CardContent>
          </Card>

          <Card className="h-full rounded-none border-0 ring-0">
            <CardHeader>
              <CardTitle className="font-normal text-sm">Avg Commission Rate</CardTitle>
              <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                {avgCommissionRate.toFixed(1)}%
              </CardDescription>
              <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                <Percent className="size-3 text-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Across all vendor agreements</div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Commission earnings chart */}
        <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
          <CardHeader>
            <CardTitle className="font-normal">Commission Overview</CardTitle>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-74 w-full">
              <ComposedChart
                accessibilityLayer
                data={commissionData}
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              >
                <defs>
                  <filter id="commission-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feFlood floodColor="var(--color-commission)" floodOpacity="0.35" />
                    <feComposite in2="blur" operator="in" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid yAxisId="revenue" vertical={false} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  height={30}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis yAxisId="commission" hide domain={[0, "auto"]} />
                <YAxis yAxisId="revenue" hide domain={[0, "auto"]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-44"
                      labelFormatter={(v) => `Period: ${v}`}
                      formatter={(value, name, item) => (
                        <>
                          <div
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex flex-1 items-center justify-between leading-none">
                            <span className="text-muted-foreground">{String(name ?? "")}</span>
                            <span className="font-medium font-mono text-foreground tabular-nums">
                              {formatTooltipValue(value)}
                            </span>
                          </div>
                        </>
                      )}
                    />
                  }
                  cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                />
                <Bar
                  yAxisId="revenue"
                  barSize={4}
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  name="GMV"
                  opacity={0.18}
                  radius={[6, 6, 0, 0]}
                />
                <Area
                  yAxisId="commission"
                  dataKey="commission"
                  fill="none"
                  filter="url(#commission-glow)"
                  name="Commission"
                  stroke="var(--color-commission)"
                  strokeWidth={1.8}
                  type="linear"
                  activeDot={{
                    r: 4,
                    fill: "var(--background)",
                    stroke: "var(--color-commission)",
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
  );
}
