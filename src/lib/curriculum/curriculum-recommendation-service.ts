import { createSupabaseServerClient } from "@/lib/supabase-server";

export type CurriculumRecommendationResult = {
  moduleId: string;
  topicId: string;
  moduleProgress: number;
  overallProgress: number;
  reason: string;
  priority: number;
};

type RecommendationInput = {
  topicId: string;
  moduleId?: string | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function getCurriculumProgress(
  moduleId: string,
) {
  const supabase = await createSupabaseServerClient();

  const { data: topics, error: topicsError } = await supabase
    .from("curriculum_topics")
    .select("id, module_id, order_index")
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (topicsError || !topics?.length) {
    if (topicsError) {
      console.error(
        "Curriculum module topics lookup error:",
        topicsError,
      );
    }

    return {
      moduleProgress: 0,
      topicCount: 0,
      completedTopics: 0,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      moduleProgress: 0,
      topicCount: topics.length,
      completedTopics: 0,
    };
  }

  const topicIds = topics.map((topic) => topic.id);

  const { data: progressRows, error: progressError } =
    await supabase
      .from("curriculum_topic_progress")
      .select(
        "topic_id, progress_percent",
      )
      .eq("user_id", user.id)
      .in("topic_id", topicIds);

  if (progressError) {
    console.error(
      "Curriculum module progress lookup error:",
      progressError,
    );

    return {
      moduleProgress: 0,
      topicCount: topics.length,
      completedTopics: 0,
    };
  }

  const progressMap = new Map(
    (progressRows ?? []).map((row) => [
      row.topic_id,
      Number(row.progress_percent ?? 0),
    ]),
  );

  const totalProgress = topics.reduce(
    (sum, topic) =>
      sum + (progressMap.get(topic.id) ?? 0),
    0,
  );

  const moduleProgress = Math.round(
    clamp(
      totalProgress / topics.length,
      0,
      100,
    ),
  );

  const completedTopics = topics.filter(
    (topic) =>
      (progressMap.get(topic.id) ?? 0) >= 80,
  ).length;

  return {
    moduleProgress,
    topicCount: topics.length,
    completedTopics,
  };
}

export async function getOverallCurriculumProgress() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { data: modules, error: modulesError } =
    await supabase
      .from("curriculum_modules")
      .select("id, weight")
      .eq("is_published", true)
      .order("module_number", {
        ascending: true,
      });

  if (modulesError || !modules?.length) {
    return 0;
  }

  let weightedProgress = 0;
  let totalWeight = 0;

  for (const module of modules) {
    const progress = await getCurriculumProgress(
      module.id,
    );

    const weight = Number(module.weight ?? 0);

    weightedProgress +=
      progress.moduleProgress * weight;

    totalWeight += weight;
  }

  if (totalWeight <= 0) {
    return 0;
  }

  return Math.round(
    clamp(
      weightedProgress / totalWeight,
      0,
      100,
    ),
  );
}

export async function createNextTopicRecommendation(
  input: RecommendationInput,
): Promise<CurriculumRecommendationResult | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const moduleId = input.moduleId;

  if (!moduleId) {
    return null;
  }

  const { data: topics, error: topicsError } =
    await supabase
      .from("curriculum_topics")
      .select(
        "id, module_id, title, order_index",
      )
      .eq("module_id", moduleId)
      .eq("is_published", true)
      .order("order_index", {
        ascending: true,
      });

  if (topicsError || !topics?.length) {
    if (topicsError) {
      console.error(
        "Next topic lookup error:",
        topicsError,
      );
    }

    return null;
  }

  const topicIds = topics.map(
    (topic) => topic.id,
  );

  const { data: progressRows, error: progressError } =
    await supabase
      .from("curriculum_topic_progress")
      .select(
        "topic_id, progress_percent",
      )
      .eq("user_id", user.id)
      .in("topic_id", topicIds);

  if (progressError) {
    console.error(
      "Next topic progress lookup error:",
      progressError,
    );

    return null;
  }

  const progressMap = new Map(
    (progressRows ?? []).map((row) => [
      row.topic_id,
      Number(row.progress_percent ?? 0),
    ]),
  );

  const currentIndex = topics.findIndex(
    (topic) => topic.id === input.topicId,
  );

  const topicsAfterCurrent =
    currentIndex >= 0
      ? topics.slice(currentIndex + 1)
      : topics;

  const nextIncomplete =
    topicsAfterCurrent.find(
      (topic) =>
        (progressMap.get(topic.id) ?? 0) < 80,
    ) ??
    topics.find(
      (topic) =>
        (progressMap.get(topic.id) ?? 0) < 80,
    );

  if (!nextIncomplete) {
    return null;
  }

  const currentProgress =
    progressMap.get(input.topicId) ?? 0;

  const nextProgress =
    progressMap.get(nextIncomplete.id) ?? 0;

  let reason =
    "Continue with the next topic in your learning path.";

  let priority = 50;

  if (currentProgress >= 80) {
    reason =
      "You have made strong progress on the current topic. Continue to the next topic.";
    priority = 90;
  } else if (currentProgress >= 60) {
    reason =
      "Your current topic is progressing well. Strengthen it and continue with the next topic.";
    priority = 75;
  } else if (nextProgress === 0) {
    reason =
      "This topic has not been started yet and is the next recommended step.";
    priority = 80;
  }

  const now = new Date().toISOString();

  // Mark previous next-topic recommendations as completed.
  await supabase
    .from("curriculum_recommendations")
    .update({
      is_completed: true,
      updated_at: now,
    })
    .eq("user_id", user.id)
    .eq("recommendation_type", "next_topic")
    .eq("is_completed", false);

  const { data: recommendation, error: recommendationError } =
    await supabase
      .from("curriculum_recommendations")
      .insert({
        user_id: user.id,
        module_id: moduleId,
        topic_id: nextIncomplete.id,
        recommendation_type: "next_topic",
        reason,
        priority,
        is_completed: false,
        created_at: now,
        updated_at: now,
      })
      .select(
        "module_id, topic_id, reason, priority",
      )
      .single();

  if (recommendationError) {
    console.error(
      "Curriculum recommendation insert error:",
      recommendationError,
    );

    return null;
  }

  const moduleProgress =
    await getCurriculumProgress(moduleId);

  const overallProgress =
    await getOverallCurriculumProgress();

  return {
    moduleId:
      recommendation.module_id ?? moduleId,
    topicId:
      recommendation.topic_id ??
      nextIncomplete.id,
    moduleProgress:
      moduleProgress.moduleProgress,
    overallProgress,
    reason:
      recommendation.reason ?? reason,
    priority:
      recommendation.priority ?? priority,
  };
}