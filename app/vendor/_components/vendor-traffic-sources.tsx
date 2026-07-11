"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Bar, BarChart, LabelList, type LabelProps, XAxis, YAxis } from "recharts";
import { siEbay, siGoogle, siMeta, siShopify, siTiktok } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

interface VendorTrafficSourcesProps {
  vendorId: string;
}

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

function getDeterministicTrafficSources(vendorId: string) {
  const rand = createSeedRandom(vendorId);
  const totalVisitsBase = Math.floor(rand() * 5000) + 1500; // 1500 to 6500 total visits

  const rawShares = [rand() + 0.5, rand() + 0.3, rand() + 0.2, rand() + 0.1, rand() * 0.5];
  const sumShares = rawShares.reduce((s, v) => s + v, 0);
  const shares = rawShares.map((v) => Math.round((v / sumShares) * 100));

  const diff = 100 - shares.reduce((s, v) => s + v, 0);
  shares[0] += diff;

  const names = ["Meta", "Google", "Shopify", "TikTok", "eBay"] as const;
  const icons = [siMeta, siGoogle, siShopify, siTiktok, siEbay] as const;

  return names.map((name, index) => {
    const share = shares[index];
    const visitsVal = Math.round((totalVisitsBase * share) / 100);
    const changePct = Math.round(rand() * 26 - 10); // -10% to +16%
    const change = changePct >= 0 ? `+${changePct}%` : `${changePct}%`;

    return {
      name,
      visits: visitsVal.toLocaleString(),
      share,
      change,
      icon: icons[index],
    };
  });
}

const trafficSourcesConfig = {
  share: {
    label: "Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type IconLabelProps = {
  height?: number | string;
  index?: number;
  width?: number | string;
  x?: number | string;
  y?: number | string;
};

type SourceLabelProps = LabelProps & {
  index?: number;
};

type SourceChangeLabelProps = LabelProps & {
  value?: number | string;
};

function getNumber(value: number | string | undefined) {
  return typeof value === "number" ? value : Number(value);
}

export function VendorTrafficSources({ vendorId }: VendorTrafficSourcesProps) {
  const [sources] = useState(() => getDeterministicTrafficSources(vendorId));

  const totalVisits = sources.reduce((sum, s) => sum + Number(s.visits.replace(/,/g, "")), 0);
  const formattedTotalVisits = totalVisits >= 1000 ? `${(totalVisits / 1000).toFixed(1)}K` : totalVisits;

  function TrafficSourceIconLabel({ height, index, width, x, y }: IconLabelProps) {
    if (typeof index !== "number") {
      return null;
    }

    const source = sources[index];
    const xValue = getNumber(x);
    const yValue = getNumber(y);
    const widthValue = getNumber(width);
    const heightValue = getNumber(height);

    if (
      !source ||
      Number.isNaN(xValue) ||
      Number.isNaN(yValue) ||
      Number.isNaN(widthValue) ||
      Number.isNaN(heightValue)
    ) {
      return null;
    }

    const iconSize = 16;
    const iconX = Math.max(xValue + 10, xValue + widthValue - iconSize - 10);
    const iconY = yValue + (heightValue - iconSize) / 2;

    return (
      <foreignObject height={iconSize} x={iconX} y={iconY} width={iconSize}>
        <SimpleIcon icon={source.icon} className="size-4 fill-foreground" />
      </foreignObject>
    );
  }

  function TrafficSourceNameLabel({ height, index, x, y }: SourceLabelProps) {
    if (typeof index !== "number") {
      return null;
    }

    const source = sources[index];
    const xValue = getNumber(x);
    const yValue = getNumber(y);
    const heightValue = getNumber(height);

    if (!source || Number.isNaN(xValue) || Number.isNaN(yValue) || Number.isNaN(heightValue)) {
      return null;
    }

    return (
      <text dominantBaseline="middle" textAnchor="start" x={2} y={yValue + heightValue / 2}>
        <tspan className="fill-foreground font-medium" fontSize={13} x={2} y={yValue + heightValue / 2 - 7}>
          {source.name}
        </tspan>
        <tspan className="fill-muted-foreground" fontSize={12} x={2} y={yValue + heightValue / 2 + 11}>
          {source.visits}
        </tspan>
      </text>
    );
  }

  function TrafficSourceChangeLabel({ height, value, y }: SourceChangeLabelProps) {
    const yValue = getNumber(y);
    const heightValue = getNumber(height);

    if (typeof value !== "string" || Number.isNaN(yValue) || Number.isNaN(heightValue)) {
      return null;
    }

    const isNegative = value.startsWith("-");

    return (
      <text
        className={isNegative ? "fill-destructive" : "fill-green-700 dark:fill-green-300"}
        dominantBaseline="middle"
        dx={-6}
        fontSize={13}
        textAnchor="end"
        x="100%"
        y={yValue + heightValue / 2}
      >
        {value}
      </text>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Traffic Sources</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {formattedTotalVisits} visits
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={trafficSourcesConfig} className="h-54 w-full">
          <BarChart
            accessibilityLayer
            barCategoryGap={12}
            data={sources}
            layout="vertical"
            margin={{ bottom: 0, left: 100, right: 50, top: 0 }}
          >
            <defs>
              <pattern
                height="4"
                id="vendor-traffic-source-background-pattern"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
                width="4"
              >
                <rect height="6" width="6" fill="var(--muted)" fillOpacity="0.5" />
                <line
                  stroke="var(--muted-foreground)"
                  strokeOpacity="0.10"
                  strokeWidth="1.25"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="6"
                />
              </pattern>
            </defs>
            <XAxis dataKey="share" domain={[0, 100]} hide type="number" />
            <YAxis dataKey="name" hide type="category" />
            <Bar
              background={{ fill: "url(#vendor-traffic-source-background-pattern)", radius: 8 }}
              barSize={36}
              dataKey="share"
              fill="var(--color-share)"
              fillOpacity={0.5}
              name="Visits"
              radius={8}
              stroke="var(--color-share)"
              strokeOpacity={0.1}
              strokeWidth={0.5}
            >
              <LabelList content={<TrafficSourceNameLabel />} dataKey="name" />
              <LabelList content={<TrafficSourceIconLabel />} dataKey="share" />
              <LabelList content={<TrafficSourceChangeLabel />} dataKey="change" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
