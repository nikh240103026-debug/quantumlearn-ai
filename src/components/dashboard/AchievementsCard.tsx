import {
  Award,
  BookOpen,
  Compass,
  FlaskConical,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";

import type { DashboardAchievement } from "@/types/personal-dashboard";

interface Props {
  achievements: DashboardAchievement[];
}

const icons = {
  "book-open": BookOpen,
  compass: Compass,
  target: Target,
  award: Award,
  "flask-conical": FlaskConical,
  sparkles: Sparkles,
  flame: Flame,
};

export function AchievementsCard({ achievements }: Props) {
  const earned = achievements.filter((item) => item.earned).length;

  return (
    <section className="border border-black/10 bg-white p-8 sm:p-10">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Achievements
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
            Milestones
          </h2>
        </div>

        <p className="text-sm text-black/40">
          {earned}/{achievements.length} earned
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon =
            icons[achievement.icon as keyof typeof icons] ?? Award;

          const percentage =
            achievement.target > 0
              ? Math.min(
                  100,
                  (achievement.progress / achievement.target) * 100,
                )
              : 0;

          return (
            <div
              key={achievement.id}
              className={`border p-5 ${
                achievement.earned
                  ? "border-blue-600/20 bg-blue-50/40"
                  : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center ${
                    achievement.earned
                      ? "bg-blue-600 text-white"
                      : "bg-black/5 text-black/35"
                  }`}
                >
                  <Icon size={18} />
                </div>

                {achievement.earned && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                    Earned
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-base font-semibold">
                {achievement.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-black/45">
                {achievement.description}
              </p>

              {!achievement.earned && (
                <>
                  <div className="mt-5 h-1 bg-black/10">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-black/30">
                    {achievement.progress}/{achievement.target}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}