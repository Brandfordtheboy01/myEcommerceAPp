"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

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
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join as a customer or vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="flex gap-2">
                <Button type="button" variant={role === "customer" ? "default" : "outline"} onClick={() => setRole("customer")} className="flex-1">
                  Customer
                </Button>
                <Button type="button" variant={role === "vendor" ? "default" : "outline"} onClick={() => setRole("vendor")} className="flex-1">
                  Vendor
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
