"use client";

import { useState } from "react";
import { format, subMinutes } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface VendorTrafficProps {
  vendorId: string;
}

const trafficIntervalMinutes = 15;
const totalPoints = 100;

function createSeedRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function getDeterministicTrafficData(vendorId: string) {
  const rand = createSeedRandom(vendorId);
  const data = [];
  const now = new Date();

  // Baseline traffic level determined by vendor name/id
  const baseTraffic = Math.floor(rand() * 200) + 100; // 100 to 300 base

  for (let i = totalPoints - 1; i >= 0; i--) {
    const timestamp = subMinutes(now, i * trafficIntervalMinutes).toISOString();

    // Create a wave pattern for day/night cycle based on hour
    const dateObj = new Date(timestamp);
    const hour = dateObj.getHours();
    const timeFactor = Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 0.5 + 0.5; // 0 to 1

    // Random noise
    const noise = rand() * 0.4 - 0.2; // -20% to +20%

    // Calculate views/visitors
    const visitors = Math.max(
      10,
      Math.round(baseTraffic * (timeFactor + 0.2) * (1 + noise))
    );

    // Conversions (orders) - usually 1% to 3% of visitors
    const conversionRand = rand();
    let conversions = 0;
    if (visitors > 150 && conversionRand > 0.95) {
      conversions = Math.floor(rand() * 3) + 1;
    } else if (visitors > 80 && conversionRand > 0.98) {
      conversions = 1;
    }

    data.push({
      timestamp,
      visitors,
      conversions,
    });
  }

  return data;
}

const trafficConfig = {
  visitors: {
    label: "Views",
    color: "var(--chart-3)",
  },
  conversions: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatTrafficTooltipLabel(value: string) {
  return format(new Date(value), "h:mm a, do MMMM yyyy");
}

export function VendorTraffic({ vendorId }: VendorTrafficProps) {
  const [trafficData] = useState(() => getDeterministicTrafficData(vendorId));
  const firstTrafficTimestamp = trafficData[0].timestamp;
  const lastTrafficTimestamp = trafficData.at(-1)?.timestamp ?? "";

  // Sum total views
  const totalViews = trafficData.reduce((sum, d) => sum + d.visitors, 0);
  const formattedViews = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews;

  function formatTrafficTick(value: string) {
    if (value === firstTrafficTimestamp) {
      return "24h ago";
    }
    return value === lastTrafficTimestamp ? "now" : "";
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Product Views</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {formattedViews} views
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={trafficConfig} className="h-54 w-full">
          <AreaChart accessibilityLayer data={trafficData} margin={{ bottom: 0, left: 0, right: 0, top: 8 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="timestamp"
              tick={{ fontSize: 11 }}
              tickFormatter={formatTrafficTick}
              tickLine={false}
              tickMargin={10}
              ticks={[firstTrafficTimestamp, lastTrafficTimestamp]}
            />
            <YAxis axisLine={false} domain={[0, "auto"]} tickLine={false} tickMargin={6} width={36} yAxisId="traffic" />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(value) => formatTrafficTooltipLabel(String(value))} />}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <ChartLegend align="right" verticalAlign="top" className="justify-end" content={<ChartLegendContent />} />
            <Area
              dataKey="visitors"
              dot={false}
              fill="url(#fillViews)"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              type="stepAfter"
              yAxisId="traffic"
            />
            <Line
              dataKey="conversions"
              dot={false}
              stroke="var(--color-conversions)"
              strokeLinecap="round"
              strokeWidth={1.5}
              type="stepAfter"
              yAxisId="traffic"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
