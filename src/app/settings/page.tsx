import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: settings }, { data: events }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("account_settings").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("security_events").select("id, event_type, ip_address, user_agent, metadata, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
  ]);

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile ?? {}}
      settings={settings ?? null}
      events={events ?? []}
    />
  );
}
