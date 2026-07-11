"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shield,
  Heart,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSheet } from "@/components/cart/cart-sheet";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  if (isDashboard) return null;

  const itemCount = useCartStore((s) => s.getItemCount());
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setRole(null);
        setEmail(null);
        return;
      }
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data) setRole(data.role as UserRole);
    });
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setRole(null);
    setEmail(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-3xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile menu toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1 text-black hover:text-gray-600 transition"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
              SHOP.CO
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-black">
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-gray-600 transition">
              <span>Shop</span>
              <ChevronDown size={14} />
              {/* Simple hover dropdown for categories */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-200 py-2 z-50">
                <Link href="/products" className="block px-4 py-2 hover:bg-gray-50 text-sm">All Clothes</Link>
                <Link href="/products?category=Clothing" className="block px-4 py-2 hover:bg-gray-50 text-sm">New In Clothing</Link>
                <Link href="/products?category=Electronics" className="block px-4 py-2 hover:bg-gray-50 text-sm">Electronics</Link>
              </div>
            </div>
            <Link href="/products?sort=price-asc" className="hover:text-gray-600 transition">
              On Sale
            </Link>
            <Link href="/products" className="hover:text-gray-600 transition">
              New Arrivals
            </Link>
            <a href="#brands" className="hover:text-gray-600 transition">
              Brands
            </a>
          </nav>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-4 text-gray-400 size-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F0F0] text-black pl-12 pr-4 py-2.5 rounded-full text-sm outline-none border-none placeholder-gray-400 focus:ring-1 focus:ring-black transition"
            />
          </form>

          {/* Right Action Icons (Cart, Profile, Mobile Search) */}
          <div className="flex items-center gap-2 sm:gap-4 text-black">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition"
              aria-label="Toggle search bar"
            >
              <Search size={22} />
            </button>

            {/* Cart Sheet */}
            <CartSheet triggerClassName="p-1.5 hover:bg-gray-100 rounded-full transition text-black border-none" />

            {/* Profile Dropdown */}
            {email ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center outline-none">
                    <UserIcon size={22} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-1 z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 truncate border-b border-gray-100">
                    Logged in as <span className="font-semibold block text-gray-700">{email}</span>
                  </div>
                  {role === "vendor" && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/vendor" className="flex items-center gap-2 py-2">
                        <Store size={16} />
                        <span>Vendor Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {role === "admin" && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2 py-2">
                        <Shield size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/orders" className="flex items-center gap-2 py-2">
                      <LayoutDashboard size={16} />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/wishlist" className="flex items-center gap-2 py-2">
                      <Heart size={16} />
                      <span>My Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100 my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
                    <div className="flex items-center gap-2 py-2 w-full">
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center"
                aria-label="Login"
              >
                <UserIcon size={22} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Row (Expandable) */}
        {showMobileSearch && (
          <div className="md:hidden pb-4 px-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 text-gray-400 size-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F0F0F0] text-black pl-10 pr-10 py-2 rounded-full text-xs outline-none border-none placeholder-gray-400 focus:ring-1 focus:ring-black"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3.5 text-gray-400 hover:text-black transition"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer (Radix-based Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 rounded-r-3xl p-6 bg-white">
          <SheetHeader className="pb-6 border-b border-gray-100">
            <SheetTitle className="text-2xl font-black text-black text-left">
              SHOP.CO
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-6 mt-8 text-lg font-bold text-black">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Shop Pages</span>
              <Link href="/products" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1">
                All Products
              </Link>
              <Link href="/products?category=Clothing" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1">
                Clothing Only
              </Link>
              <Link href="/products?sort=price-asc" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1">
                On Sale
              </Link>
            </div>
            
            {email && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">My Account</span>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1">
                  Orders
                </Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1">
                  Wishlist
                </Link>
                {role === "vendor" && (
                  <Link href="/vendor" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1 text-green-600">
                    Vendor Dashboard
                  </Link>
                )}
                {role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="hover:text-gray-600 transition pl-1 text-indigo-600">
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              {email ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-full text-sm font-medium transition cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-3 bg-black hover:bg-gray-800 text-white rounded-full text-sm font-medium text-center transition"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
