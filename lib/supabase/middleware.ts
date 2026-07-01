import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path.startsWith("/products") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/vendor-register") ||
    path.startsWith("/cart") ||
    path.startsWith("/checkout") ||
    path.startsWith("/payment") ||
    path.startsWith("/api/webhooks");

  if (!user && !isPublic) {
    // API routes must return JSON errors — never redirect to login (breaks fetch + leaves UI stuck)
    if (path.startsWith("/api/")) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/vendor") || path.startsWith("/admin"))) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (path.startsWith("/vendor")) {
      const { data: vendorProfile } = await supabase
        .from("vendors")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const canAccessVendor =
        profile?.role === "vendor" ||
        profile?.role === "admin" ||
        Boolean(vendorProfile);

      if (!canAccessVendor) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (path.startsWith("/admin") && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
