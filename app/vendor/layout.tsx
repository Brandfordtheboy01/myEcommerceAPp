import { LayoutDashboard, Package, ShoppingBag, Plus, Tag } from "lucide-react";
import { Container } from "@/components/layout/container";
import { DashboardNav } from "@/components/layout/dashboard-nav";

const vendorNav = [
  { href: "/vendor", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/vendor/products", label: "Products", icon: <Package className="size-4" /> },
  { href: "/vendor/products/new", label: "Add product", icon: <Plus className="size-4" /> },
  { href: "/vendor/orders", label: "Orders", icon: <ShoppingBag className="size-4" /> },
  { href: "/vendor/coupons", label: "Coupons", icon: <Tag className="size-4" /> },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav items={vendorNav} title="Vendor" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
