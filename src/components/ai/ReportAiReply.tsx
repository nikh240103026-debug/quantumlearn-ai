"use client";

import { useState } from "react";

/** Under every AI reply: reports it without leaving the page. */
export function ReportAiReply({ content, page }: { content: string; page: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");

  async function report() {
    const reason = window.prompt("What is wrong with this AI reply? (wrong, harmful, offensive, other)");
    if (!reason?.trim()) return;
    setState("busy");
    const form = new FormData();
    form.set("type", "ai_response");
    form.set("page", page);
    form.set("description", `${reason.trim().slice(0, 1000)}\n\nAI reply:\n${content.slice(0, 3500)}`);
    const ok = await fetch("/api/feedback", { method: "POST", body: form }).then((r) => r.ok, () => false);
    setState(ok ? "done" : "failed");
  }

  return (
    <p className="mt-2 text-xs opacity-75">
      Made by AI. It can be wrong.{" "}
      {state === "done" ? (
        <span role="status">Reported. Thank you.</span>
      ) : (
        <button type="button" className="underline" disabled={state === "busy"} onClick={() => void report()}>
          {state === "failed" ? "Not sent. Try again" : "Report"}
        </button>
      )}
    </p>
  );
}
