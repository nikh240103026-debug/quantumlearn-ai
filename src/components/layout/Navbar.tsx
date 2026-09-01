"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Atom,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Learn", href: "#roadmap" },
  { name: "Quantum Lab", href: "/quantum-lab" },
  { name: "AI Tutor", href: "/dashboard" },
  { name: "Practice", href: "/practice" },
  { name: "Resources", href: "#resources" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

useEffect(() => {
  let mounted = true;

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (mounted) {
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    }
  }

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!mounted) return;

    setUserEmail(session?.user?.email ?? null);
    setAuthLoading(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [supabase]);

    async function handleLogout() {
  setMobileMenuOpen(false);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error);
    return;
  }

  setUserEmail(null);

  window.location.href = "/";
}

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Atom size={20} strokeWidth={1.8} />
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-950">
            QuantumLearn
            <span className="text-blue-600"> AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : userEmail ? (
            <>
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Dashboard
              </Link>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {userEmail.charAt(0).toUpperCase()}
                </div>

                <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                  {userEmail}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {authLoading ? (
              <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
            ) : userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>

                <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>

                  <span className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                    {userEmail}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}