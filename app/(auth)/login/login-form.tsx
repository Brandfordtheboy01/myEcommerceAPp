"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <AuthShell title="Welcome Back" description="Sign in to your account to continue shopping">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3.5 focus-within:ring-1 focus-within:ring-[#1D52F7] transition">
            <Mail size={16} className="text-[#1D52F7] shrink-0" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="flex items-center gap-3 bg-[#F0F0F0] rounded-full px-4 py-3.5 focus-within:ring-1 focus-within:ring-[#1D52F7] transition">
            <Lock size={16} className="text-[#1D52F7] shrink-0" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="bg-transparent border-0 w-full p-0 text-sm focus:ring-0 focus:outline-none placeholder:text-gray-400 text-black font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-[#1D52F7] transition shrink-0"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
          className="w-full bg-[#1D52F7] hover:bg-[#1D52F7]/90 active:scale-[0.98] text-white font-bold py-4 rounded-full transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[#1D52F7] hover:text-[#1D52F7]/70 transition">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
