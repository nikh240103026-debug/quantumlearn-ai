"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  RecentActivity as RecentActivityItem,
} from "@/types/dashboard";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export function RecentActivity({
  activities,
}: RecentActivityProps) {
  const ref =
    useRef<HTMLElement>(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.08,
        },
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-b border-black/10 bg-[#f5f5f3]"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[0.35fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                Activity
              </p>

              <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
                Your recent work, recorded as part of the journey.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                Recent activity
              </p>

              <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
                What you have been doing.
              </h2>
            </div>

            {activities.length === 0 ? (
              <div className="mt-14 border-y border-dashed border-black/15 py-14">
                <p className="text-sm font-semibold">
                  No recent activity yet.
                </p>

                <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                  Complete a lesson, practice a problem, build a
                  circuit, or use an AI learning feature and your
                  activity will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-14 border-t border-black/10">
                {activities.map(
                  (activity, index) => (
                    <div
                      key={activity.id}
                      className={`grid gap-4 border-b border-black/10 py-7 transition-all duration-700 sm:grid-cols-[150px_1fr_auto] sm:items-start ${
                        visible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-8 opacity-0"
                      }`}
                      style={{
                        transitionDelay: `${
                          100 +
                          index * 70
                        }ms`,
                      }}
                    >
                      <div>
                        <span className="text-xs text-black/30">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-black/35">
                          {activity.type}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium tracking-tight">
                          {
                            activity.title
                          }
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                          {
                            activity.description
                          }
                        </p>
                      </div>

                      <p className="text-xs text-black/35 sm:text-right">
                        {
                          activity.timestamp
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}