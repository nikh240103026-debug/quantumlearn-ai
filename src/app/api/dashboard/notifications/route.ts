import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type NotificationUpdateBody = {
  id?: unknown;
  all?: unknown;
};

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: NotificationUpdateBody;
  try {
    body = (await request.json()) as NotificationUpdateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let update = supabase
    .from("dashboard_notifications")
    .update({ is_read: true })
    .eq("user_id", user.id);

  if (body.all !== true) {
    if (typeof body.id !== "string" || body.id.length === 0) {
      return NextResponse.json(
        { error: "A notification ID or all flag is required." },
        { status: 400 },
      );
    }

    update = update.eq("id", body.id);
  }

  const { error } = await update;

  if (error) {
    console.error("[DASHBOARD NOTIFICATIONS PATCH]", error);
    return NextResponse.json(
      { error: "Unable to update notifications." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

