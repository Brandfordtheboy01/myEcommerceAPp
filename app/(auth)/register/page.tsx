"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Store, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { fullname, role } },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError("Account could not be created. Please try again.");
      return;
    }

    if (role === "vendor") {
      if (data.session) {
        router.push("/vendor-register");
      } else {
        setError(
          "Account created. Please confirm your email, then sign in to complete vendor onboarding."
        );
      }
    } else {
      router.push("/");
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <AuthShell title="Create Account" description="Join as a shopper or start selling today">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account type selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[15px] border-2 p-4 text-sm font-bold transition-all active:scale-95",
                role === "customer"
                  ? "border-black bg-black text-white"
                  : "border-gray-100 bg-[#F0F0F0] text-gray-600 hover:border-gray-300"
              )}
            >
              <ShoppingBag className="size-5" />
              Shop
            </button>
            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[15px] border-2 p-4 text-sm font-bold transition-all active:scale-95",
                role === "vendor"
                  ? "border-black bg-black text-white"
                  : "border-gray-100 bg-[#F0F0F0] text-gray-600 hover:border-gray-300"
              )}
            >
              <Store className="size-5" />
              Sell
            </button>
          </div>
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="fullname" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3.5 focus-within:ring-1 focus-within:ring-black transition">
            <User size={16} className="text-gray-400 shrink-0" />
            <input
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="John Doe"
              required
              className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3.5 focus-within:ring-1 focus-within:ring-black transition">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3.5 focus-within:ring-1 focus-within:ring-black transition">
            <Lock size={16} className="text-gray-400 shrink-0" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-black transition shrink-0"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 ml-1">At least 6 characters</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-[15px] px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black hover:bg-black/90 active:scale-[0.98] text-white font-bold py-4 rounded-full transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-black hover:text-black/70 transition">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
