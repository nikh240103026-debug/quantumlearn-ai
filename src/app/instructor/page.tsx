import {
  redirect,
} from "next/navigation";

import {
  createSupabaseServerClient,
} from "@/lib/supabase-server";

import InstructorDashboard from "@/components/instructor/InstructorDashboard";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function InstructorPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } =
    await supabase
      .from("profiles")
      .select(
        "role",
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();

  if (
    !profile ||
    ![
      "admin",
      "tutor",
    ].includes(
      profile.role,
    )
  ) {
    redirect("/dashboard");
  }

  return (
    <InstructorDashboard />
  );
}