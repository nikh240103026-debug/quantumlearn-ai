"use client";

import { useEffect } from "react";

import { TIMEZONE_COOKIE } from "@/lib/local-date";

/*
 * Stores the browser's IANA timezone in a cookie so server-rendered
 * pages (e.g. the dashboard's "Active days") can count calendar days
 * in the learner's local time instead of UTC.
 */
export function TimezoneCookie() {
  useEffect(() => {
    try {
      const timeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timeZone) {
        return;
      }

      const current = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${TIMEZONE_COOKIE}=`))
        ?.split("=")[1];

      if (current !== encodeURIComponent(timeZone)) {
        document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(
          timeZone,
        )}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Timezone is a nicety; never break the page over it.
    }
  }, []);

  return null;
}
