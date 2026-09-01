export interface DashboardStats {
  overallProgress: number;
  coursesStarted: number;
  lessonsCompleted: number;
  circuitsBuilt: number;
}

export interface ContinueLearning {
  courseId: string;
  courseTitle: string;
  description: string;
  progress: number;
  currentLesson: string;
  totalLessons: number;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface QuickAccessItem {
  title: string;
  description: string;
  href: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "lesson" | "circuit" | "quiz" | "practice";
}

export interface DashboardData {
  stats: DashboardStats;
  continueLearning: ContinueLearning;
  streak: LearningStreak;
  quickAccess: QuickAccessItem[];
  recentActivity: RecentActivity[];
}