"use client";

import { useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";

interface VendorBalanceRow {
  id: string;
  business_name: string;
  balance: number;
  total_earnings: number;
  commission_rate: number;
  status: "pending" | "approved" | "rejected" | "suspended";
}

interface VendorPayoutsProps {
  vendors: VendorBalanceRow[];
}

export function VendorPayouts({ vendors }: VendorPayoutsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const totalBalance = vendors.reduce((sum, v) => sum + v.balance, 0);
  const totalEarnings = vendors.reduce((sum, v) => sum + v.total_earnings, 0);

  function StatusBadge({ status }: { status: VendorBalanceRow["status"] }) {
    if (status === "approved") {
      return (
        <Badge className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300" variant="outline">
          Active
        </Badge>
      );
    }
    if (status === "suspended") {
      return (
        <Badge className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300" variant="outline">
          Suspended
        </Badge>
      );
    }
    if (status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return (
      <Badge className="border-gray-500/25 text-gray-500" variant="outline">
        Pending
      </Badge>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Vendor Payouts</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {formatCurrency(totalBalance)} outstanding
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-0">
        {/* Summary Strip */}
        <div className="grid grid-cols-2 gap-px bg-border mx-4 mb-2 rounded-lg overflow-hidden border">
          <div className="bg-card px-4 py-3">
            <div className="text-xs text-muted-foreground">Total Vendor Earnings</div>
            <div className="text-lg font-medium tabular-nums">{formatCurrency(totalEarnings)}</div>
          </div>
          <div className="bg-card px-4 py-3">
            <div className="text-xs text-muted-foreground">Pending Balance</div>
            <div className="text-lg font-medium tabular-nums">{formatCurrency(totalBalance)}</div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 **:data-[slot=table-head]:h-9 **:data-[slot=table-head]:px-4 **:data-[slot=table-head]:font-normal **:data-[slot=table-head]:text-xs">
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Total Earned</TableHead>
                <TableHead>Balance Owed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:px-4 **:data-[slot=table-cell]:py-3">
              {vendors.length > 0 ? (
                vendors.slice(0, 8).map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <span className="font-medium text-sm">{vendor.business_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {vendor.commission_rate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm tabular-nums">{formatCurrency(vendor.total_earnings)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm tabular-nums font-medium ${vendor.balance > 0 ? "text-yellow-700 dark:text-yellow-400" : "text-muted-foreground"}`}>
                        {formatCurrency(vendor.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={vendor.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    No vendor payout data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
