import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type NotificationUpdateBody = {
  id?: unknown;
  all?: unknown;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("dashboard_notifications")
    .select(
      "id, title, message, type, href, is_read, created_at, read_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[DASHBOARD NOTIFICATIONS GET]", error);

    return NextResponse.json(
      { error: "Unable to load notifications." },
      { status: 500 },
    );
  }

  const notifications = (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    href: item.href,
    read: item.is_read,
    createdAt: item.created_at,
    readAt: item.read_at,
  }));

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  let body: NotificationUpdateBody;

  try {
    body = (await request.json()) as NotificationUpdateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const readAt = new Date().toISOString();

  let update = supabase
    .from("dashboard_notifications")
    .update({
      is_read: true,
      read_at: readAt,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (body.all !== true) {
    if (
      typeof body.id !== "string" ||
      body.id.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "A notification ID or all flag is required.",
        },
        { status: 400 },
      );
    }

    update = update.eq("id", body.id);
  }

  const { error } = await update;

  if (error) {
    console.error(
      "[DASHBOARD NOTIFICATIONS PATCH]",
      error,
    );

    return NextResponse.json(
      { error: "Unable to update notifications." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}