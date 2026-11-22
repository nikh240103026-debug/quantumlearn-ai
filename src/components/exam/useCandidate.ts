"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export type Candidate =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; name: string; email: string };

/** The signed-in learner, shown as "candidate" on exam screens. */
export function useCandidate(): Candidate {
  const [candidate, setCandidate] = useState<Candidate>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (cancelled) return;
        if (!user) {
          setCandidate({ status: "guest" });
          return;
        }
        const meta = user.user_metadata ?? {};
        const email = user.email ?? "";
        const name =
          meta.full_name || meta.name || meta.display_name || email.split("@")[0] || "Candidate";
        setCandidate({ status: "user", name: String(name), email });
      })
      .catch(() => {
        if (!cancelled) setCandidate({ status: "guest" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return candidate;
}
