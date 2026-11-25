import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Cached, so visitors can't turn this page into load on the services.
export const revalidate = 60;

async function working(check: (signal: AbortSignal) => PromiseLike<boolean>): Promise<boolean> {
  try {
    return await check(AbortSignal.timeout(8000));
  } catch {
    return false;
  }
}

export async function GET() {
  const quantumUrl = process.env.QUANTUM_API_URL || process.env.NEXT_PUBLIC_QUANTUM_API_URL;

  const [database, quantum] = await Promise.all([
    working(async (signal) => {
      const { error } = await createSupabaseAdminClient().from("courses").select("id").limit(1).abortSignal(signal);
      return !error;
    }),
    quantumUrl
      ? working(async (signal) => (await fetch(`${quantumUrl.replace(/\/$/, "")}/health`, { signal, cache: "no-store" })).ok)
      : null,
  ]);

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: [
      { name: "Website", ok: true },
      { name: "Accounts and learning data", ok: database },
      ...(quantum === null ? [] : [{ name: "Code and quantum simulators", ok: quantum }]),
    ],
  });
}
