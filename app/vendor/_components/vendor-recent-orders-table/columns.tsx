import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { VendorOrderRow } from "./schema";

function formatOrderDate(date: string) {
  return format(parseISO(date), "h:mm a, d MMM yyyy");
}

function StatusBadge({ status }: { status: VendorOrderRow["status"] }) {
  const statusLower = status.toLowerCase();

  if (statusLower === "delivered") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Delivered
      </Badge>
    );
  }

  if (statusLower === "cancelled") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Cancelled
      </Badge>
    );
  }

  if (statusLower === "shipped") {
    return (
      <Badge
        className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Shipped
      </Badge>
    );
  }

  if (statusLower === "processing") {
    return (
      <Badge
        className="border-blue-700/25 text-blue-700 dark:border-blue-300/25 dark:text-blue-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current animate-pulse" />
        Processing
      </Badge>
    );
  }

  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Pending
    </Badge>
  );
}

export const vendorRecentOrdersColumns: ColumnDef<VendorOrderRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all orders"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select order ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="font-medium leading-none">#{row.original.id.slice(0, 8).toUpperCase()}</div>
        <div className="text-muted-foreground text-xs truncate max-w-[150px]" title={row.original.items}>
          {row.original.items}
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    id: "statusSummary",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: (row, _columnId, value) => {
      if (!value || value === "All") return true;
      return row.original.status.toLowerCase() === String(value).toLowerCase();
    },
  },
  {
    accessorKey: "subtotal",
    header: () => <div className="w-28">Total / Earnings</div>,
    cell: ({ row }) => (
      <div className="w-28 flex flex-col gap-0.5 tabular-nums">
        <div className="font-medium">${Number(row.original.subtotal).toFixed(2)}</div>
        <div className="text-muted-foreground text-xs">
          Earned: ${Number(row.original.earnings).toFixed(2)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="w-44">Date</div>,
    cell: ({ row }) => <div className="w-44 text-muted-foreground">{formatOrderDate(row.original.date)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-end">
            <Button aria-label="Open order actions" size="icon" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
            <DropdownMenuItem>Copy Order ID</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
    enableSorting: false,
  },
];
