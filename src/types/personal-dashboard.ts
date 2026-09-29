export type DashboardActivityType =
  | "lesson"
  | "practice"
  | "lab"
  | "ai"
  | "achievement"
  | "resource"
  | "system";

export interface ContinueLearningData {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivityAt: string | null;
}

export interface DashboardAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  target: number;
}

export interface DashboardSavedContent {
  id: string;
  title: string;
  description: string | null;
  href: string;
  type: "resource" | "lesson";
  savedAt: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: "system" | "learning" | "achievement" | "practice" | "security";
  read: boolean;
  createdAt: string;
  href: string | null;
}

export interface DashboardLabProject {
  id: string;
  name: string;
  description: string | null;
  qubits: number;
  updatedAt: string;
  href: string;
}

export interface PersonalDashboardData {
  continueLearning: ContinueLearningData | null;
  achievements: DashboardAchievement[];
  savedContent: DashboardSavedContent[];
  notifications: DashboardNotification[];
  labProjects: DashboardLabProject[];
  recentActivity: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: DashboardActivityType;
    href?: string;
  }[];
}