import PersistentAITutor from "@/components/ai/PersistentAITutor";

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
  const params = await searchParams;

  const topic = getParam(params.topic);
  const source = getParam(params.source);
  const reason = getParam(params.reason);
  const chapter = getParam(params.chapter);
  const lessonId = getParam(params.lessonId);
  const lessonSlug = getParam(params.lessonSlug);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto h-[calc(100vh-7rem)] max-w-7xl">
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
      </div>
    </main>
  );
}