"use client";

import { useEffect, useState } from "react";

/*
 * The simulator sleeps when nobody uses it and needs about a minute to start.
 * Opening a page that uses it wakes it early; a slow run explains the wait.
 */
export function StartingNotice({ running }: { running: boolean }) {
  useEffect(() => {
    void fetch("/api/status").catch(() => {});
  }, []);

  return <div role="status">{running && <SlowMessage />}</div>;
}

function SlowMessage() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return slow ? (
    <p className="p-4 text-sm leading-6 text-amber-200">
      Starting the simulator. This can take about a minute. Please keep this page open.
    </p>
  ) : null;
}
