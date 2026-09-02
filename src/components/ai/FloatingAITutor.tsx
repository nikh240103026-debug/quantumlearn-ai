"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Sparkles, ArrowRight } from "lucide-react";

export default function FloatingAITutor() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  // The dedicated AI Tutor page already provides the full tutor interface.
  // Avoid showing the launcher there.
  if (pathname === "/ai-tutor") {
    return null;
  }

  async function openTutor() {
    if (opening) return;

    setOpening(true);

    try {
      await fetch("/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityType: "tutor_opened",
          sourcePage: pathname || "/",
          description: "User opened the global AI Tutor.",
          metadata: {
            source: "floating_launcher",
            pathname: pathname || "/",
          },
        }),
      });
    } catch (error) {
      // Activity logging should never prevent the Tutor from opening.
      console.error("AI Tutor activity logging failed:", error);
    } finally {
      router.push(
        `/ai-tutor?source=${encodeURIComponent(
          pathname || "/",
        )}`,
      );

      setOpening(false);
      setOpen(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {/* Expanded launcher */}
      {open && (
        <div className="mb-3 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Sparkles size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    QuantumLearn AI
                  </p>
                  <p className="text-xs text-slate-500">
                    Your personal quantum tutor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Tutor launcher"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
              Need help understanding a quantum concept, solving a
              problem, or deciding what to learn next?
            </p>

            <button
              type="button"
              onClick={openTutor}
              disabled={opening}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {opening ? (
                "Opening Tutor..."
              ) : (
                <>
                  Open AI Tutor
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI Tutor"
          className="group flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl dark:bg-white dark:text-slate-950 dark:ring-white/10 dark:hover:bg-slate-200"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 dark:bg-slate-900/10">
            <MessageCircle size={17} />
          </span>

          <span className="hidden sm:inline">AI Tutor</span>
        </button>
      )}
    </div>
  );
}
