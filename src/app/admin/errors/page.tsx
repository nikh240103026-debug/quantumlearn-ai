"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, RotateCcw } from "lucide-react";

import { AdminPage, apiRequest } from "@/components/admin/AdminUI";

type AppError = {
  id: string;
  source: "client" | "server" | "mobile";
  message: string;
  stack: string | null;
  path: string | null;
  digest: string | null;
  user_agent: string | null;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  resolved_at: string | null;
};

type ErrorList = {
  errors: AppError[];
  open: number;
  lastDay: number;
  page: number;
  totalPages: number;
};

type Status = "open" | "resolved";

// Borderless on purpose: surfaces are separated by fill and spacing.
const button =
  "inline-flex items-center gap-2 rounded-lg bg-white/[.06] px-3 py-2 text-xs text-white/75 transition hover:bg-white/[.12] focus-visible:bg-white/[.18] disabled:opacity-40";

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminErrorsPage() {
  const [status, setStatus] = useState<Status>("open");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<ErrorList | null>(null);
  const [failure, setFailure] = useState("");
  const [busyId, setBusyId] = useState("");

  const refresh = useCallback(() => setReload((value) => value + 1), []);

  useEffect(() => {
    let active = true;

    apiRequest<ErrorList>(`/api/admin/errors?status=${status}&page=${page}`)
      .then((result) => {
        if (!active) return;
        setData(result);
        setFailure("");
      })
      .catch((error: unknown) => {
        if (active) setFailure(messageOf(error, "Unable to load errors."));
      });

    return () => {
      active = false;
    };
  }, [status, page, reload]);

  function show(next: Status) {
    if (next === status) return;
    setData(null);
    setPage(1);
    setStatus(next);
  }

  async function toggleResolved(item: AppError) {
    setBusyId(item.id);
    try {
      await apiRequest("/api/admin/errors", {
        method: "PATCH",
        body: JSON.stringify({ id: item.id, resolved: !item.resolved_at }),
      });
      if (data?.errors.length === 1 && page > 1) setPage(page - 1);
      else refresh();
    } catch (error) {
      setFailure(messageOf(error, "Unable to update the error."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <AdminPage
      title="Errors"
      description="Crashes recorded on the live site, grouped by cause. A resolved error reopens if it happens again."
      actions={
        <button type="button" className={button} onClick={refresh}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Open", value: data?.open },
          { label: "Seen in the last 24 hours", value: data?.lastDay },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white/[.04] p-4">
            <p className="text-xs text-white/45">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value ?? "–"}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex gap-2">
        {(["open", "resolved"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => show(value)}
            className={`rounded-lg px-4 py-2 text-xs capitalize transition ${
              status === value
                ? "bg-violet-500/25 text-white"
                : "bg-white/[.04] text-white/50 hover:bg-white/[.08]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {failure && (
        <p role="alert" className="mb-4 rounded-xl bg-red-400/10 p-4 text-sm text-red-200">
          {failure}
        </p>
      )}

      {!data && !failure && (
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-white/45">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      )}

      {data?.errors.length === 0 && (
        <p className="rounded-xl bg-white/[.03] py-14 text-center text-sm text-white/45">
          No {status} errors.
        </p>
      )}

      <ul className="space-y-3">
        {data?.errors.map((item) => (
          <li key={item.id} className="rounded-xl bg-white/[.04] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-white">{item.message}</p>
                <p className="mt-1.5 break-words text-xs leading-5 text-white/45">
                  {{ client: "Browser", server: "Server", mobile: "Mobile app" }[item.source]} · {item.path ?? "unknown page"} ·{" "}
                  {item.occurrences}× · last {new Date(item.last_seen).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className={`${button} shrink-0 self-start`}
                disabled={busyId === item.id}
                onClick={() => void toggleResolved(item)}
              >
                {item.resolved_at ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                {item.resolved_at ? "Reopen" : "Mark resolved"}
              </button>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-violet-300">Details</summary>
              <p className="mt-2 break-words text-xs leading-5 text-white/45">
                First seen {new Date(item.first_seen).toLocaleString()}
                {item.digest && ` · Reference ${item.digest}`}
                {item.user_agent && ` · ${item.user_agent}`}
              </p>
              {item.stack && (
                <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-black/30 p-3 text-[11px] leading-5 text-white/55">
                  {item.stack}
                </pre>
              )}
            </details>
          </li>
        ))}
      </ul>

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs text-white/45">
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button type="button" className={button} disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              type="button"
              className={button}
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
