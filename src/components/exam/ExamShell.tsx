"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

/**
 * Full-screen "exam mode": covers the site chrome with a dedicated exam
 * bar so a quiz or assessment feels like sitting a test, not browsing a
 * website. Locks page scroll underneath and offers real fullscreen.
 */
export function ExamShell({
  eyebrow,
  title,
  center,
  right,
  onExit,
  exitLabel = "Exit",
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  center?: ReactNode;
  right?: ReactNode;
  onExit: () => void;
  exitLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);

    return () => {
      root.style.overflow = previous;
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }

  return (
    <div
      role="region"
      aria-label={`${title} — exam mode`}
      className="ql-paper fixed inset-0 z-[80] flex flex-col overscroll-contain text-ink"
    >
      {/* Exam bar */}
      <header className="relative z-10 flex h-16 shrink-0 items-center gap-4 border-b border-black/80 bg-ink px-4 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/quantumlearn-logo.png" alt="" className="h-7 w-7 shrink-0 object-contain invert" />
          <div className="min-w-0 border-l border-white/15 pl-3">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              {eyebrow}
            </p>
            <p className="truncate text-sm font-semibold">{title}</p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">{center}</div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {right}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
            title={fullscreen ? "Exit full screen" : "Full screen"}
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition-colors hover:border-white/35 hover:text-white sm:flex"
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-semibold text-white/75 transition-colors hover:border-white/35 hover:text-white"
          >
            <X size={14} />
            <span className="hidden sm:inline">{exitLabel}</span>
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

      {footer}
    </div>
  );
}
