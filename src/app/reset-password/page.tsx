"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [ready, setReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    /*
     * Only a password-recovery link may open this form. Before, any
     * signed-in session was accepted, so anyone with access to an
     * unlocked, logged-in browser could set a new password here.
     * A recovery link arrives with ?code=... (PKCE), #...type=recovery
     * (implicit flow), or via /auth/callback, which adds ?recovery=1
     * after verifying a recovery token.
     */
    const url = new URL(window.location.href);
    const arrivedFromRecoveryLink =
      url.searchParams.has("code") ||
      url.searchParams.get("recovery") === "1" ||
      url.hash.includes("type=recovery");

    const initializeRecovery = async () => {
      try {
        if (!arrivedFromRecoveryLink) {
          if (!mounted) return;

          setReady(false);
          setCheckingSession(false);
          return;
        }

        /*
         * Links requested from the mobile app use the implicit flow:
         * #access_token=...&refresh_token=...&type=recovery. This
         * browser client is PKCE-only and ignores those, so start the
         * session from them here and drop them from the address bar.
         */
        const hash = new URLSearchParams(url.hash.slice(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}`,
          );

          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!mounted) return;

          setReady(!setSessionError);
          setCheckingSession(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          setReady(true);
          setCheckingSession(false);
          return;
        }

        /*
         * Give Supabase a moment to process the recovery URL.
         * This is especially important when the page is opened
         * directly from the password-reset email.
         */
        setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: recoverySession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          setReady(Boolean(recoverySession));
          setCheckingSession(false);
        }, 500);
      } catch {
        if (!mounted) return;

        setReady(false);
        setCheckingSession(false);
        setError(
          "Unable to initialize the password reset session. Please request a new reset link.",
        );
      }
    };

    initializeRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setReady(Boolean(session));
        setCheckingSession(false);
      }

      // A plain sign-in only counts when this page was opened from a
      // recovery link (the link's token signs the user in first).
      if (
        event === "SIGNED_IN" &&
        session &&
        arrivedFromRecoveryLink
      ) {
        setReady(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!ready) {
      setError(
        "This password reset link is invalid or has expired. Please request a new one.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    let updateError: { message: string } | null = null;

    try {
      ({ error: updateError } = await supabase.auth.updateUser({
        password,
      }));
    } catch {
      setLoading(false);
      setError(
        "Unable to reach the server. Check your connection and try again.",
      );
      return;
    }

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    // End the recovery session so the next step really is a fresh
    // sign-in with the new password (the message says "log in").
    await supabase.auth.signOut().catch(() => undefined);

    setLoading(false);
    setPassword("");
    setConfirmPassword("");

    setMessage(
      "Your password has been updated successfully. You can now log in with your new password.",
    );

    setReady(false);
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
                <LockKeyhole size={22} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Set a new password
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a new secure password for your QuantumLearn AI
                account.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <span>{message}</span>
              </div>
            )}

            {checkingSession ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Preparing your secure password reset session...
              </div>
            ) : !ready && !message ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                This password reset link is invalid or has expired.
                Please request a new password reset link.
              </div>
            ) : message ? (
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="block w-full rounded-xl bg-blue-600 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Go to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="New password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm new password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                  Password must contain at least 8 characters,
                  including uppercase, lowercase, and a number.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading
                    ? "Updating..."
                    : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}