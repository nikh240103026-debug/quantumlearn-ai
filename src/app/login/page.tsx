"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (loginError) {
      setLoading(false);

      if (
        loginError.message
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        setError(
          "Your email is not verified yet. Please check your inbox and verify your email before logging in.",
        );
      } else {
        setError("Invalid email or password.");
      }

      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* ================================================================
          FULL-SCREEN BACKGROUND
      ================================================================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/quantum-computer.jpg')",
        }}
      />

      {/* ================================================================
          SINGLE DARK OVERLAY
      ================================================================= */}
      <div className="absolute inset-0 bg-slate-950/65" />

      {/* Subtle animated lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 animate-[pulse_7s_ease-in-out_infinite] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] animate-[pulse_9s_ease-in-out_infinite] rounded-full bg-violet-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}
      <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center">
        {/* ================================================================
            LEFT BRANDING
        ================================================================= */}
        <section className="hidden w-[58%] px-10 py-12 lg:block xl:px-20">
          <div className="max-w-2xl">
            <Link
              href="/"
              className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-white/65 transition-all duration-300 hover:translate-x-1 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="animate-[fadeInUp_0.8s_ease-out_both]">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                QuantumLearn AI
              </p>

              <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white xl:text-5xl">
                Continue your quantum learning journey.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/65 xl:text-lg xl:leading-8">
                Log in to access your personalized learning environment,
                quantum circuits, simulations, practice, and AI-guided
                learning.
              </p>

              <div className="mt-9 h-px w-24 bg-white/25" />

              <p className="mt-5 text-sm leading-6 text-white/45">
                Learn concepts. Build circuits. Run experiments. Understand
                quantum algorithms.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            RIGHT LOGIN PANEL
        ================================================================= */}
        <section className="flex w-full items-center justify-center px-5 py-8 sm:px-8 lg:w-[42%] lg:px-8">
          <div className="w-full max-w-[430px] animate-[fadeInRight_0.8s_ease-out_both]">
            {/* Back link for smaller screens */}
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/65 transition-all duration-300 hover:translate-x-1 hover:text-white lg:hidden"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            {/* ==========================================================
                GLASS LOGIN PANEL
            ========================================================== */}
            <div className="relative h-[60vh] overflow-hidden border border-white/20 bg-slate-950/45 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-8">
              {/* Top animated line */}
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />

              {/* Logo + heading */}
              <div className="mb-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center border border-blue-400/30 bg-blue-600/90 text-lg font-bold text-white shadow-lg shadow-blue-900/30">
                  Q
                </div>

                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                  QuantumLearn AI
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Log in to continue your quantum learning journey.
                </p>
              </div>

              {/* ========================================================
                  LOGIN FORM
              ======================================================== */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError("");
                      }}
                      className="w-full border border-white/15 bg-white/[0.07] px-4 py-3 pl-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 focus:border-blue-400/70 focus:bg-white/[0.1] focus:ring-4 focus:ring-blue-500/10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-white/80">
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError("");
                      }}
                      className="w-full border border-white/15 bg-white/[0.07] px-4 py-3 pl-11 pr-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 focus:border-blue-400/70 focus:bg-white/[0.1] focus:ring-4 focus:ring-blue-500/10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/80"
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

                {/* Log in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 border border-blue-400/30 bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-900/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Logging in..." : "Log in"}

                  {!loading && (
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}
                </button>

                {/* ======================================================
                    ERROR MESSAGE
                ====================================================== */}
                {error && (
                  <div className="border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-200 animate-[fadeIn_0.25s_ease-out]">
                    {error}
                  </div>
                )}
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[10px] font-medium tracking-[0.15em] text-white/30">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Signup */}
              <p className="text-center text-sm text-white/50">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-300 transition-colors hover:text-blue-200"
                >
                  Create one
                </Link>
              </p>

              {/* Bottom subtle detail */}
              <div className="mt-7 border-t border-white/10 pt-5 text-center">
                <p className="text-[11px] leading-5 text-white/30">
                  Secure authentication powered by Supabase
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================
          ANIMATION KEYFRAMES
      ================================================================= */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(32px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}