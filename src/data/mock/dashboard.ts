import type { DashboardData } from "@/types/dashboard";

export const mockDashboardData: DashboardData = {
  stats: {
    overallProgress: 12,
    coursesStarted: 1,
    lessonsCompleted: 4,
    circuitsBuilt: 0,
  },

  continueLearning: {
    courseId: "quantum-fundamentals",
    courseTitle: "Quantum Computing Fundamentals",
    description:
      "Build the mathematical and conceptual foundation you need before moving into quantum algorithms.",
    progress: 35,
    currentLesson: "Introduction to Qubits",
    totalLessons: 12,
  },

  streak: {
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: null,
  },

  quickAccess: [
    {
      title: "Quantum Lab",
      description: "Build and experiment with quantum circuits.",
      href: "/#quantum-lab",
    },
    {
      title: "AI Tutor",
      description: "Get intelligent guidance while you learn.",
      href: "/#ai-tutor",
    },
    {
      title: "Practice",
      description: "Test your understanding with practical problems.",
      href: "/#progress",
    },
  ],

  recentActivity: [],
};