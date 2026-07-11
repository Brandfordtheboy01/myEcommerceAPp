"use client";

import { useState } from "react";
import { Check, Search, X, Ban, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Vendor {
  id: string;
  business_name: string;
  business_email: string | null;
  auth_email?: string;          // from users table join
  status: "pending" | "approved" | "rejected" | "suspended";
  created_at: string;
}

interface VendorManagementProps {
  initialVendors: Vendor[];
}

export function VendorManagement({ initialVendors }: VendorManagementProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("pending");
  const [actionId, setActionId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        const updatedVendor = json.vendor;
        if (updatedVendor) {
          setVendors((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: updatedVendor.status } : v))
          );
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionId(null);
    }
  }

  // Filter vendors based on status and search query
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (vendor.business_email?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus =
      activeFilter === "All" || vendor.status.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  function StatusBadge({ status }: { status: Vendor["status"] }) {
    if (status === "approved") {
      return (
        <Badge
          className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
          variant="outline"
        >
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge variant="destructive">
          Rejected
        </Badge>
      );
    }
    if (status === "suspended") {
      return (
        <Badge
          className="border-gray-500/25 text-gray-500 dark:border-gray-300/25 dark:text-gray-300"
          variant="outline"
        >
          Suspended
        </Badge>
      );
    }
    return (
      <Badge
        className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
        variant="outline"
      >
        Pending
      </Badge>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Vendor Management</CardTitle>
        <CardDescription className="text-foreground text-xl leading-none tracking-tight">
          {vendors.filter((v) => v.status === "pending").length} pending approvals
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup
            className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30 w-fit"
            onValueChange={(value) => {
              if (value) setActiveFilter(value);
            }}
            size="sm"
            spacing={1}
            type="single"
            value={activeFilter}
          >
            <ToggleGroupItem value="All">All</ToggleGroupItem>
            <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
            <ToggleGroupItem value="approved">Approved</ToggleGroupItem>
            <ToggleGroupItem value="rejected">Rejected</ToggleGroupItem>
          </ToggleGroup>

          <div className="relative w-full max-w-[260px]">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Business Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{vendor.business_name}</span>
                        <span className="text-muted-foreground text-xs">
                          {vendor.business_email || vendor.auth_email || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={vendor.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {actionId === vendor.id ? (
                          <RefreshCw className="size-4 animate-spin text-muted-foreground mr-2" />
                        ) : vendor.status === "pending" ? (
                          <>
                            <Button
                              onClick={() => updateStatus(vendor.id, "approved")}
                              size="sm"
                              className="bg-green-700 hover:bg-green-800 text-white dark:bg-green-600 dark:hover:bg-green-700 h-8 px-2.5"
                            >
                              <Check className="size-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              onClick={() => updateStatus(vendor.id, "rejected")}
                              size="sm"
                              variant="destructive"
                              className="h-8 px-2.5"
                            >
                              <X className="size-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        ) : vendor.status === "approved" ? (
                          <Button
                            onClick={() => updateStatus(vendor.id, "suspended")}
                            size="sm"
                            variant="outline"
                            className="border-yellow-600/30 text-yellow-600 hover:bg-yellow-600/10 dark:text-yellow-400 h-8 px-2.5"
                          >
                            <Ban className="size-3.5 mr-1" /> Suspend
                          </Button>
                        ) : (
                          <Button
                            onClick={() => updateStatus(vendor.id, "approved")}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5"
                          >
                            <Check className="size-3.5 mr-1" /> Re-approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No vendors found matching criteria.
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
