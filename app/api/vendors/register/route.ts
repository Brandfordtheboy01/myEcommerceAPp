import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/orders";
import { vendorRegisterSchema } from "@/lib/validations";
import { formatZodError, logger } from "@/lib/logger";

export async function POST(request: Request) {
  const scope = "api/vendors/register";

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logger.error(scope, "SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { error: "Server misconfiguration: missing service role key" },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      logger.error(scope, "Auth lookup failed", { error: authError.message });
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    if (!user) {
      logger.warn(scope, "Unauthenticated vendor registration attempt");
      return NextResponse.json(
        { error: "You must be signed in to register as a vendor" },
        { status: 401 }
      );
    }

    logger.info(scope, "Vendor registration started", { userId: user.id, email: user.email });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      logger.error(scope, "Invalid JSON body", { userId: user.id });
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = vendorRegisterSchema.safeParse(body);
    if (!parsed.success) {
      const message = formatZodError(parsed.error);
      logger.warn(scope, "Validation failed", { userId: user.id, message, body });
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing, error: existingError } = await admin
      .from("vendors")
      .select("id, status")
      .eq("id", user.id)
      .maybeSingle();

    if (existingError) {
      logger.error(scope, "Failed to check existing vendor", {
        userId: user.id,
        error: existingError.message,
        code: existingError.code,
      });
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      logger.info(scope, "Vendor profile already exists", { userId: user.id, status: existing.status });
      return NextResponse.json(
        { error: "Vendor profile already exists", vendor: existing },
        { status: 400 }
      );
    }

    const { data: userRow, error: userLookupError } = await admin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (userLookupError) {
      logger.error(scope, "Failed to lookup users row", {
        userId: user.id,
        error: userLookupError.message,
      });
      return NextResponse.json({ error: userLookupError.message }, { status: 500 });
    }

    if (!userRow) {
      logger.warn(scope, "Missing public.users row — creating profile", { userId: user.id });

      const { error: userInsertError } = await admin.from("users").insert({
        id: user.id,
        email: user.email ?? "",
        fullname: (user.user_metadata?.fullname as string) ?? user.email ?? "User",
        role: "customer",
      });

      if (userInsertError) {
        logger.error(scope, "Failed to create users row", {
          userId: user.id,
          error: userInsertError.message,
          code: userInsertError.code,
        });
        return NextResponse.json(
          { error: `Could not create user profile: ${userInsertError.message}` },
          { status: 500 }
        );
      }
    }

    const { data: vendor, error: vendorError } = await admin
      .from("vendors")
      .insert({ id: user.id, ...parsed.data })
      .select()
      .single();

    if (vendorError) {
      logger.error(scope, "Vendor insert failed", {
        userId: user.id,
        error: vendorError.message,
        code: vendorError.code,
        details: vendorError.details,
        hint: vendorError.hint,
        payload: parsed.data,
      });
      return NextResponse.json({ error: vendorError.message }, { status: 500 });
    }

    logger.info(scope, "Vendor row created", { userId: user.id, vendorId: vendor.id });

    const { error: roleError } = await admin
      .from("users")
      .update({ role: "vendor" })
      .eq("id", user.id);

    if (roleError) {
      logger.error(scope, "Failed to update user role (vendor row exists)", {
        userId: user.id,
        error: roleError.message,
      });
      return NextResponse.json(
        {
          error: "Vendor profile created but role update failed. Contact support.",
          vendor,
        },
        { status: 500 }
      );
    }

    logger.info(scope, "Vendor registration complete", { userId: user.id, vendorId: vendor.id });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error(scope, "Unhandled exception", { error: message, stack: err instanceof Error ? err.stack : undefined });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
