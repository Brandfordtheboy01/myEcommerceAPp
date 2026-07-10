"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <AuthShell title="Create your account" description="Join as a shopper or start selling today">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Account type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
                role === "customer"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40"
              )}
            >
              <ShoppingBag className="size-5" />
              Shop
            </button>
            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
                role === "vendor"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40"
              )}
            >
              <Store className="size-5" />
              Sell
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullname">Full name</Label>
          <Input id="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-muted-foreground">At least 6 characters</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
