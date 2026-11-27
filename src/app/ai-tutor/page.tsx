import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PersistentAITutor from "@/components/ai/PersistentAITutor";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "AI Tutor", robots: { index: false } };

type SearchParams = {
  topic?: string | string[];
  source?: string | string[];
  reason?: string | string[];
  chapter?: string | string[];
  lessonId?: string | string[];
  lessonSlug?: string | string[];
};

type AITutorPageProps = {
  searchParams: Promise<SearchParams>;
};

function getParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function AITutorPage({
  searchParams,
}: AITutorPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const topic = getParam(params.topic);
  const source = getParam(params.source);
  const reason = getParam(params.reason);
  const chapter = getParam(params.chapter);
  const lessonId = getParam(params.lessonId);
  const lessonSlug = getParam(params.lessonSlug);

  return (
    <main className="min-h-screen bg-[#05070d]">
      <PersistentAITutor
        initialTopic={topic}
        initialContext={{
          source: source ?? "ai-tutor",
          reason,
          chapter,
          lessonId,
          lessonSlug,
        }}
      />
    </main>
  );
}