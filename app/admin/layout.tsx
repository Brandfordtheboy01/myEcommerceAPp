import { LayoutDashboard, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { DashboardNav } from "@/components/layout/dashboard-nav";

const adminNav = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/vendors", label: "Vendors", icon: <Users className="size-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav items={adminNav} title="Admin" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
