"use client";

import { useEffect } from "react";

import { reportClientError } from "@/lib/monitoring/report-client-error";

// Shown when the root layout itself fails, so it can't rely on any styles.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportClientError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#05070d",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <title>Something went wrong</title>
        <main style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>Something went wrong on our side.</h1>
          <p style={{ color: "#a3acbd" }}>Trying again usually fixes it.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "12px 24px",
              border: 0,
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
