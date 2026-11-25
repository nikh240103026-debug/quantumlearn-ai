import type { Metadata } from "next";
import Link from "next/link";

import { card, Empty, PlainPage, Problem } from "@/components/ui/Plain";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Corrections",
  description: "Mistakes we found in our lessons and questions, and when we fixed them.",
};

export default async function CorrectionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_corrections")
    .select("id, place, description, corrected_on")
    .order("corrected_on", { ascending: false })
    .limit(100);

  if (error) console.error("[CORRECTIONS]", error);

  return (
    <PlainPage
      title="Corrections"
      intro={
        <>
          When we fix a factual mistake in a lesson or question, we record it here. Found one?{" "}
          <Link href="/feedback" className="text-blue-300 underline underline-offset-2 hover:text-blue-200">Tell us</Link>.
        </>
      }
    >
      {error ? (
        <Problem>Corrections couldn&apos;t be loaded. Please try again later.</Problem>
      ) : data.length === 0 ? (
        <Empty>No corrections published yet.</Empty>
      ) : (
        data.map((item) => (
          <article key={item.id} className={card}>
            <p className="text-xs text-white/60">{item.corrected_on}</p>
            <h2 className="mt-1 font-semibold">{item.place}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">{item.description}</p>
          </article>
        ))
      )}
    </PlainPage>
  );
}
