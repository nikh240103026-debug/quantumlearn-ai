import {
  curriculumModules,
  curriculumTopics,
} from "@/data/quantumCurriculum";

import type {
  CurriculumLessonMapping,
  CurriculumQuestionMapping,
} from "@/types/curriculum";

export const curriculumLessonMappings: CurriculumLessonMapping[] =
  curriculumTopics.map((topic) => ({
    moduleId: topic.moduleId,
    topicId: topic.id,
    chapterNumbers: topic.chapterNumbers,
    keywords: topic.keywords,
  }));

export const curriculumQuestionMappings: CurriculumQuestionMapping[] =
  curriculumTopics.map((topic) => ({
    moduleId: topic.moduleId,
    topicId: topic.id,
    chapterNumbers: topic.chapterNumbers,
    keywords: topic.keywords,
  }));

export function getModuleForChapter(
  chapterNumber: number,
) {
  return curriculumModules.find((module) =>
    module.chapterNumbers.includes(
      chapterNumber,
    ));
  }

export function getTopicsForChapter(
  chapterNumber: number,
) {
  return curriculumTopics.filter((topic) =>
    topic.chapterNumbers.includes(
      chapterNumber,
    )
  );
}

export function getTopicForChapterAndText(
  chapterNumber: number,
  text: string,
) {
  const normalizedText =
    text.toLowerCase();

  const candidates =
    getTopicsForChapter(chapterNumber);

  return (
    candidates.find((topic) =>
      topic.keywords.some((keyword) =>
        normalizedText.includes(
          keyword.toLowerCase(),
        ),
      ),
    ) ?? null
  );
}