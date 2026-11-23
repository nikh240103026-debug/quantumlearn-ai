"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

/*
 * Reset emails are requested with the implicit flow, not PKCE. A PKCE
 * link (?code=...) only works in the same browser that asked for it
 * (it needs a code verifier stored there), so opening the email on a
 * phone, in the Gmail app or in another browser failed with
 * "PKCE code verifier not found". The implicit link carries the tokens
 * in the URL #fragment; /auth/callback forwards them to /reset-password,
 * which starts the session from them. Works in any browser.
 */
let recoveryClient: ReturnType<typeof createClient> | null = null;

function createRecoveryClient() {
  // One instance, with its own storage key, so it doesn't clash with
  // the app's main client ("Multiple GoTrueClient instances").
  return (recoveryClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "sb-password-recovery",
      },
    },
  ));
}

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    let resetError: { message: string } | null = null;

    try {
      // The link goes through /auth/callback, which opens
      // /reset-password. Add <your-domain>/auth/callback to Supabase's
      // allowed Redirect URLs.
      ({ error: resetError } =
        await createRecoveryClient().auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        }));
    } catch {
      setLoading(false);
      setError(
        "Unable to reach the server. Check your connection and try again.",
      );
      return;
    }

    setLoading(false);

    if (resetError) {
      console.error("Password reset error:", resetError);

      setError(
        resetError.message ||
          "Unable to send the reset email right now. Please try again.",
      );

      return;
    }

    setMessage(
      "If an account exists for this email, a password reset link has been sent. Please check your inbox.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Mail size={22} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Forgot your password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your email and we'll send you a secure password reset
                link.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}