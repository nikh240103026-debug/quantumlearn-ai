import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedbackPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#111318]">
      <FeedbackClient />
    </main>
  );
}