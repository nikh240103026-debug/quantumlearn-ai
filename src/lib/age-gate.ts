import "server-only";

import { MIN_AGE } from "@/lib/age";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export { AGE_MESSAGE } from "@/lib/age";

export type AgeStatus = "ok" | "unknown" | "under";

export async function getAgeStatus(userId: string): Promise<AgeStatus> {
  const { data, error } = await createSupabaseAdminClient().from("profiles").select("age").eq("id", userId).maybeSingle();
  if (error) {
    // An outage must not lock every learner out.
    console.error("[AGE]", error);
    return "ok";
  }
  if (data?.age === null || data?.age === undefined) return "unknown";
  return data.age < MIN_AGE ? "under" : "ok";
}

export const ageBlocks = (status: AgeStatus): boolean => status !== "ok";
