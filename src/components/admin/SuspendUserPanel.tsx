"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";

import { apiRequest } from "@/components/admin/AdminUI";

// Borderless on purpose: surfaces are separated by fill and spacing.
export function SuspendUserPanel({
  userId,
  suspended,
  blockedReason,
}: {
  userId: string;
  suspended: boolean;
  // Why this account can't be suspended (own account, admin), if so.
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [warning, setWarning] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFailure("");
    setWarning("");

    try {
      const result = await apiRequest<{ warning: string | null }>(
        `/api/admin/users/${userId}/suspension`,
        { method: "POST", body: JSON.stringify({ suspended: !suspended, reason }) },
      );
      setReason("");
      setWarning(result.warning ?? "");
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Unable to update the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`mt-6 rounded-xl p-5 ${suspended ? "bg-red-400/10" : "bg-white/[.04]"}`}>
      <h2 className="text-sm font-semibold text-white">
        {suspended ? "This account is suspended" : "Account access"}
      </h2>
      <p className="mt-1 text-sm leading-6 text-white/50">
        {suspended
          ? "They can't sign in. Their data and posts are kept."
          : "Suspending signs this user out and stops them signing in. Their data and posts are kept."}
      </p>

      {!suspended && blockedReason ? (
        <p className="mt-3 text-sm text-white/40">{blockedReason}</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {!suspended && (
            <label className="block space-y-2 text-xs text-white/50">
              <span>Reason (only admins see this)</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
                maxLength={500}
                className="min-h-20 w-full resize-y rounded-lg bg-white/[.06] p-3 text-sm text-white outline-none transition focus:bg-white/[.1]"
              />
            </label>
          )}
          <button
            type="submit"
            disabled={busy || (!suspended && !reason.trim())}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition disabled:opacity-40 ${
              suspended
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-red-500/20 text-red-100 hover:bg-red-500/30"
            }`}
          >
            {suspended ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
            {busy ? "Saving…" : suspended ? "Restore access" : "Suspend user"}
          </button>
        </form>
      )}

      {failure && <p role="alert" className="mt-3 text-sm text-red-200">{failure}</p>}
      {warning && <p role="status" className="mt-3 text-sm text-amber-200">{warning}</p>}
    </section>
  );
}
