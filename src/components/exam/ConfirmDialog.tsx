"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Minimal accessible modal used for "submit exam?" and "leave?" prompts. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  busy,
  confirmDisabled,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  busy?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Destructive prompts default to the safe choice.
    (tone === "danger" ? cancelRef : confirmRef).current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onCancel, tone]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ql-confirm-title"
        className="ql-palette-in w-full max-w-md overflow-hidden rounded-xl border border-ink/15 bg-sheet text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className="border-b border-rule px-6 py-4">
          <h2 id="ql-confirm-title" className="font-serif text-xl font-semibold">
            {title}
          </h2>
        </div>
        <div className="px-6 py-5 text-sm leading-6 text-ink-soft">{children}</div>
        <div className="flex flex-col-reverse gap-2 border-t border-rule bg-paper/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-rule bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              tone === "danger" ? "bg-exam-red hover:bg-[#a82222]" : "bg-ink hover:bg-black"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
