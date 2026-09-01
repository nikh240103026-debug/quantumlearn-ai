import { Clock3 } from "lucide-react";
import type { RecentActivity as RecentActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Clock3 size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Recent Activity
          </h2>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            No recent activity yet.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Complete a lesson, build a circuit, or practice a problem and
            your activity will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {activity.title}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {activity.description}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {activity.timestamp}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}