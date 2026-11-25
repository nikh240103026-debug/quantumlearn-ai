import "server-only";

import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { adminErrorResponse, requireAdminApi } from "@/lib/admin";
import { getAgeStatus, ageBlocks, AGE_MESSAGE } from "@/lib/age-gate";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A message that is safe to show the user.
export class ApiFailure extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export type ApiContext = {
  user: User;
  role: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  admin: ReturnType<typeof createSupabaseAdminClient>;
};

/** Runs a handler for a signed-in user and turns errors into JSON. */
export async function withUser(
  label: string,
  handler: (context: ApiContext) => Promise<unknown>,
  options: { allowAnyAge?: boolean } = {},
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiFailure("Please sign in first.", 401);

    if (!options.allowAnyAge && ageBlocks(await getAgeStatus(user.id))) {
      throw new ApiFailure(AGE_MESSAGE, 403);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const result = await handler({
      user,
      role: profile?.role ?? "student",
      supabase,
      admin: createSupabaseAdminClient(),
    });

    return result instanceof NextResponse ? result : NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof ApiFailure) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(`[${label}]`, error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export function requireTeacher(role: string) {
  if (role !== "tutor" && role !== "admin") {
    throw new ApiFailure("Only teachers can do this.", 403);
  }
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {
    // Reported below.
  }
  throw new ApiFailure("Invalid request.", 400);
}

export function textField(value: unknown, name: string, max: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ApiFailure(`${name} is required.`, 400);
  if (text.length > max) throw new ApiFailure(`${name} can be up to ${max} characters.`, 400);
  return text;
}

export function idField(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new ApiFailure("Not found.", 404);
  return value;
}

export function dateField(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ApiFailure("Enter a valid date.", 400);
  }
  return value;
}

/** Throws if a Supabase result failed, otherwise returns its data. */
export function unwrap<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}

export async function limitRate(context: ApiContext, action: string, limit: number, seconds: number) {
  const { data, error } = await context.supabase.rpc("consume_account_rate_limit", {
    p_user_id: context.user.id,
    p_action: action,
    p_limit: limit,
    p_window_seconds: seconds,
  });
  if (error) throw error;
  if (data === false) throw new ApiFailure("Too many attempts. Please try again later.", 429);
}

/** Runs a handler for an admin, who must have passed two-factor if they use it. */
export async function withAdmin(
  label: string,
  handler: (context: Awaited<ReturnType<typeof requireAdminApi>>) => Promise<unknown>,
): Promise<NextResponse> {
  try {
    const result = await handler(await requireAdminApi());
    return result instanceof NextResponse ? result : NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof ApiFailure) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return adminErrorResponse(error, "Something went wrong. Please try again.", `[${label}]`);
  }
}

/** An https link without a username, port or bare IP address. */
export function httpsField(value: unknown, name: string): URL {
  let url: URL | null = null;
  try {
    url = new URL(textField(value, name, 500));
  } catch (error) {
    if (error instanceof ApiFailure) throw error;
  }
  if (!url || url.protocol !== "https:" || url.username || url.port || !/\.[a-z]{2,}$/i.test(url.hostname)) {
    throw new ApiFailure(`${name} must be a full https:// link.`, 400);
  }
  return url;
}

export function wholeNumber(value: unknown, name: string, min: number, max: number): number {
  const number = Number(value);
  if (value === "" || value === null || !Number.isInteger(number) || number < min || number > max) {
    throw new ApiFailure(`${name} must be a whole number from ${min} to ${max}.`, 400);
  }
  return number;
}
