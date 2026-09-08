export interface CurriculumModule {
  id: string;
  moduleNumber: number;
  slug: string;
  title: string;
  description: string;
  weight: number;
  chapterNumbers: number[];
  topics: CurriculumTopic[];
}

export interface CurriculumTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleId: string;
  chapterNumbers: number[];
  keywords: string[];
}

export interface CurriculumLessonMapping {
  moduleId: string;
  topicId: string;
  chapterNumbers: number[];
  keywords: string[];
}

export interface CurriculumQuestionMapping {
  moduleId: string;
  topicId: string;
  chapterNumbers: number[];
  keywords: string[];
}