import {
  curriculumModules,
  curriculumTopics,
} from "@/data/quantumCurriculum";

export function normalizeCurriculumText(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBestCurriculumTopic(
  chapterNumber: number,
  text: string,
) {
  const normalizedText =
    normalizeCurriculumText(text);

  const chapterTopics =
    curriculumTopics.filter((topic) =>
      topic.chapterNumbers.includes(
        chapterNumber,
      ),
    );

  let bestTopic:
    | (typeof curriculumTopics)[number]
    | null = null;

  let bestScore = 0;

  for (const topic of chapterTopics) {
    let score = 0;

    for (const keyword of topic.keywords) {
      const normalizedKeyword =
        normalizeCurriculumText(
          keyword,
        );

      if (
        normalizedText.includes(
          normalizedKeyword,
        )
      ) {
        score +=
          normalizedKeyword.length > 5
            ? 3
            : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

export function getCurriculumModuleById(
  moduleId: string,
) {
  return curriculumModules.find(
    (module) => module.id === moduleId,
  );
}

export function getCurriculumTopicById(
  topicId: string,
) {
  return curriculumTopics.find(
    (topic) => topic.id === topicId,
  );
}

export function getModuleTopics(
  moduleId: string,
) {
  return curriculumTopics.filter(
    (topic) =>
      topic.moduleId === moduleId,
  );
}

export function getModuleProgress(
  moduleId: string,
  completedTopicIds: string[],
): number {
  const topics =
    getModuleTopics(moduleId);

  if (topics.length === 0) {
    return 0;
  }

  const completed = topics.filter(
    (topic) =>
      completedTopicIds.includes(
        topic.id,
      ),
  ).length;

  return Math.round(
    (completed / topics.length) * 100,
  );
}