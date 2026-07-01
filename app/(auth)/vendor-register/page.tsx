"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    business_name: "",
    business_description: "",
    business_email: "",
    business_phone: "",
    tax_id: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("[vendor-register] auth check failed:", authError.message);
      }

      setIsSignedIn(Boolean(user));
      setAuthChecked(true);

      if (!user) {
        console.warn("[vendor-register] no session — user must sign in first");
      } else {
        console.info("[vendor-register] session ok:", user.id);
      }
    }

    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    console.info("[vendor-register] submitting", { business_name: form.business_name });

    try {
      const res = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type") ?? "";
      let data: { error?: string; vendor?: { id: string } } = {};

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("[vendor-register] non-JSON response", { status: res.status, text: text.slice(0, 200) });
        throw new Error(
          res.status === 401
            ? "Session expired. Please sign in again."
            : `Server returned an unexpected response (${res.status})`
        );
      }

      console.info("[vendor-register] API response", { status: res.status, data });

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Registration failed. Check the server logs for details.";
        setError(message);
        return;
      }

      setSuccess(true);
      console.info("[vendor-register] success, redirecting to /vendor");

      setTimeout(() => {
        router.push("/vendor");
        router.refresh();
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error("[vendor-register] submit error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need an active session before completing vendor onboarding.
              This often happens when email confirmation is still pending.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/login?redirect=/vendor-register">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Vendor onboarding</CardTitle>
          <CardDescription>
            Complete your business profile. An admin will review your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business name *</Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_description">Description</Label>
              <Input
                id="business_description"
                value={form.business_description}
                onChange={(e) => setForm({ ...form, business_description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_email">Business email</Label>
              <Input
                id="business_email"
                type="email"
                value={form.business_email}
                onChange={(e) => setForm({ ...form, business_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_phone">Phone</Label>
              <Input
                id="business_phone"
                value={form.business_phone}
                onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={form.tax_id}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                Application submitted! Redirecting to your dashboard...
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? "Submitting..." : success ? "Submitted" : "Submit application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
