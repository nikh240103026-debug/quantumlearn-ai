"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "ql-cookie-notice-v1";

/**
 * Informational notice: the site only uses strictly necessary cookies
 * (sign-in) and local storage, so no consent choices are required.
 * If analytics or marketing cookies are ever added, this must become a
 * real consent banner that blocks them until the user opts in.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        const timer = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Storage blocked: don't nag on every page.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="ql-palette-in fixed bottom-4 left-4 z-[90] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/10 bg-[#0d111c]/95 p-4 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-amber-200">
          <Cookie size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Only the cookies we need</p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            We use essential cookies to keep you signed in — no ads, no
            cross-site tracking.{" "}
            <Link href="/privacy#cookies" className="text-blue-300 underline-offset-2 hover:underline">
              Learn more
            </Link>
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-3 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-blue-50"
          >
            Got it
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cookie notice"
          className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
