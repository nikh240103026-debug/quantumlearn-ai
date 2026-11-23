"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2 } from "lucide-react";

import type { CertificateKind } from "@/lib/certificates/types";

export function ClaimCertificateButton({
  kind,
  refId,
  disabled,
}: {
  kind: CertificateKind;
  refId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function claim() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/certificates/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, refId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to issue the certificate.");
      }
      router.push(data.url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to issue the certificate.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={claim}
        disabled={pending || disabled}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#05070d] transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
        {pending ? "Issuing…" : "Claim certificate"}
      </button>
      {error && (
        <p role="alert" className="max-w-xs text-xs text-red-300 sm:text-right">
          {error}
        </p>
      )}
    </div>
  );
}
