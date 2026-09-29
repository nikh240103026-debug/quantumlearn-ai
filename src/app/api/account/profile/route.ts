import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
const ALLOWED_LEVELS = new Set(["beginner", "basic", "intermediate", "advanced"]);
const ALLOWED_GENDERS = new Set(["male", "female", "non_binary", "prefer_not_to_say"]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const [profileResult, settingsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("account_settings").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (profileResult.error) {
    console.error("[ACCOUNT PROFILE GET]", profileResult.error);
    return NextResponse.json({ error: "Unable to load your profile." }, { status: 500 });
  }

  return NextResponse.json({
    profile: profileResult.data,
    settings: settingsResult.data,
    email: user.email ?? null,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: allowed } = await supabase.rpc("consume_account_rate_limit", {
    p_user_id: user.id,
    p_action: "profile_write",
    p_limit: 30,
    p_window_seconds: 60,
  });
  if (allowed === false) return NextResponse.json({ error: "Too many account changes. Please wait a minute and try again." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  const stringFields = ["full_name", "city", "institute", "branch", "phone", "learning_goal", "bio", "avatar_url", "learning_level"];

  for (const field of stringFields) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
      }
      updates[field] = typeof value === "string" ? value.trim() || null : value;
    }
  }

  if ("username" in body) {
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    if (username && !USERNAME_RE.test(username)) {
      return NextResponse.json({ error: "Username must be 3–24 characters using letters, numbers, or underscores." }, { status: 400 });
    }
    updates.username = username || null;
  }


  if ("gender" in body) {
    if (typeof body.gender !== "string" || !ALLOWED_GENDERS.has(body.gender)) {
      return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
    }
    updates.gender = body.gender;
  }

  if ("quantum_experience" in body) {
    if (typeof body.quantum_experience !== "string" || !ALLOWED_LEVELS.has(body.quantum_experience)) {
      return NextResponse.json({ error: "Invalid learning level." }, { status: 400 });
    }
    updates.quantum_experience = body.quantum_experience;
  }

  if ("age" in body && body.age !== null) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 13 || age > 100) {
      return NextResponse.json({ error: "Age must be between 13 and 100." }, { status: 400 });
    }
    updates.age = age;
  }

  if (Object.keys(updates).length > 0) {
    updates.last_profile_update_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
      }
      console.error("[ACCOUNT PROFILE PATCH]", error);
      return NextResponse.json({ error: "Unable to save your profile." }, { status: 500 });
    }

    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "profile_updated",
      metadata: { fields: Object.keys(updates).filter((field) => field !== "last_profile_update_at") },
    });

    return NextResponse.json({ profile: data });
  }

  const settingsPayload = ["notification_preferences", "learning_preferences", "ai_tutor_preferences", "privacy_settings"]
    .filter((key) => key in body)
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});

  if (Object.keys(settingsPayload).length > 0) {
    const { data, error } = await supabase
      .from("account_settings")
      .upsert({ user_id: user.id, ...settingsPayload, updated_at: new Date().toISOString() })
      .select("*")
      .single();

    if (error) {
      console.error("[ACCOUNT SETTINGS PATCH]", error);
      return NextResponse.json({ error: "Unable to save your settings." }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  }

  return NextResponse.json({ ok: true });
}
