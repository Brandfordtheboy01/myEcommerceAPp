"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardNavProps {
  items: NavItem[];
  title: string;
}

export function DashboardNav({ items, title }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <aside className="mb-8 lg:mb-0 lg:w-56 lg:shrink-0">
      <p className="mb-3 hidden text-xs font-medium uppercase tracking-wider text-muted-foreground lg:block">
        {title}
      </p>
      <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/vendor" && item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
