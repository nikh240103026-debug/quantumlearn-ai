"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Atom,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  BookOpen,
  FlaskConical,
  Code2,
  Target,
  Library,
  Brain,
  LayoutDashboard,
  History,
  LogOut,
  UserRound,
  Map,
  GraduationCap,
  PlaySquare,
  Cpu,
  Blocks,
  TerminalSquare,
  Bot,
  Trophy,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type NavItem = {
  name: string;
  href: string;
  description?: string;
  icon?: IconComponent;
};

type NavGroup = {
  name: string;
  icon: IconComponent;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    name: "Learn",
    icon: BookOpen,
    items: [
      {
        name: "Learning Roadmap",
        href: "/roadmap",
        description: "Follow your quantum learning journey",
        icon: Map,
      },
      {
        name: "Curriculum",
        href: "/roadmap",
        description: "Explore the complete quantum curriculum",
        icon: GraduationCap,
      },
      {
        name: "My Learning",
        href: "/dashboard",
        description: "Continue where you left off",
        icon: PlaySquare,
      },
      {
        name: "AI Tutor",
        href: "/ai-tutor",
        description: "Get help while studying",
        icon: Brain,
      },
    ],
  },
  {
    name: "Quantum Lab",
    icon: FlaskConical,
    items: [
      {
        name: "Circuit Builder",
        href: "/quantum-lab",
        description: "Build quantum circuits visually",
        icon: Blocks,
      },
      {
        name: "Quantum Simulator",
        href: "/quantum-lab",
        description: "Execute and simulate circuits",
        icon: Cpu,
      },
      {
        name: "Multi-SDK Execution",
        href: "/quantum-lab",
        description: "Work with Qiskit, Cirq, PennyLane and qBraid",
        icon: FlaskConical,
      },
      {
        name: "Quantum Tutor",
        href: "/ai-tutor",
        description: "Understand circuits and algorithms with AI",
        icon: Bot,
      },
    ],
  },
  {
    name: "Coding",
    icon: Code2,
    items: [
      {
        name: "Coding Playground",
        href: "/coding",
        description: "Write and execute quantum code",
        icon: TerminalSquare,
      },
      {
        name: "Tutorials",
        href: "/coding/tutorials",
        description: "Learn quantum programming step by step",
        icon: BookOpen,
      },
      {
        name: "Challenges",
        href: "/coding/challenges",
        description: "Practice with coding challenges",
        icon: Trophy,
      },
      {
        name: "AI Coding Assistant",
        href: "/coding/assistant",
        description: "Get intelligent coding guidance",
        icon: Bot,
      },
      {
        name: "Code History",
        href: "/coding/history",
        description: "View your previous code",
        icon: History,
      },
    ],
  },
  {
    name: "Practice",
    icon: Target,
    items: [
      {
        name: "Practice Questions",
        href: "/practice",
        description: "Test and strengthen your knowledge",
        icon: FileText,
      },
      {
        name: "Assessments",
        href: "/practice/assessment",
        description: "Take structured quantum assessments",
        icon: ClipboardCheck,
      },
      {
        name: "My Results",
        href: "/practice/assessment/result",
        description: "Review your assessment performance",
        icon: Trophy,
      },
    ],
  },
];

const standaloneNavigation = [
  {
    name: "Resources",
    href: "/resources",
    icon: Library,
  },
  {
    name: "AI Tutor",
    href: "/ai-tutor",
    icon: Brain,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

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

    void loadUser();

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

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isRouteActive(item.href));
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  async function handleLogout() {
    closeMenus();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    setUserEmail(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="QuantumLearn AI home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Atom size={20} strokeWidth={1.8} />
          </span>

          <span className="hidden text-lg font-bold tracking-tight text-slate-950 sm:block">
            QuantumLearn
            <span className="text-blue-600"> AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const active = isGroupActive(group);
            const open = openDropdown === group.name;

            return (
              <div
                key={group.name}
                className="relative"
                onMouseEnter={() => setOpenDropdown(group.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown((current) =>
                      current === group.name ? null : group.name
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active || open
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  aria-expanded={open}
                  aria-haspopup="menu"
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {group.name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute left-1/2 top-full z-50 w-[330px] -translate-x-1/2 pt-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
                      <div className="px-3 pb-2 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {group.name}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const activeItem = isRouteActive(item.href);

                          return (
                            <Link
                              key={`${group.name}-${item.name}`}
                              href={item.href}
                              onClick={closeMenus}
                              className={`group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                activeItem
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {ItemIcon && (
                                <span
                                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    activeItem
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-500 group-hover/item:bg-slate-200"
                                  }`}
                                >
                                  <ItemIcon size={16} strokeWidth={1.8} />
                                </span>
                              )}

                              <span className="min-w-0">
                                <span className="block text-sm font-semibold">
                                  {item.name}
                                </span>

                                {item.description && (
                                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                                    {item.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Standalone links */}
          {standaloneNavigation.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenus}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : userEmail ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenus}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isRouteActive("/dashboard")
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <LayoutDashboard size={16} strokeWidth={1.8} />
                Dashboard
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  className="flex max-w-[210px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition-colors hover:bg-slate-100"
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-[130px] truncate text-sm font-medium text-slate-700">
                    {userEmail}
                  </span>

                  <ChevronDown
                    size={14}
                    className="shrink-0 text-slate-400 transition-transform group-hover:rotate-180"
                  />
                </button>

                <div className="invisible absolute right-0 top-full w-56 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {userEmail.charAt(0).toUpperCase()}
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Signed in as
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                onClick={closeMenus}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
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
          <div className="mx-auto max-h-[calc(100vh-68px)] max-w-7xl overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {navGroups.map((group) => {
                const Icon = group.icon;
                const open = openDropdown === group.name;
                const active = isGroupActive(group);

                return (
                  <div
                    key={group.name}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((current) =>
                          current === group.name ? null : group.name
                        )
                      }
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-800"
                      }`}
                      aria-expanded={open}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={1.8} />
                        {group.name}
                      </span>

                      <ChevronDown
                        size={17}
                        className={`transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-2">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const activeItem = isRouteActive(item.href);

                          return (
                            <Link
                              key={`${group.name}-mobile-${item.name}`}
                              href={item.href}
                              onClick={closeMenus}
                              className={`flex items-center gap-3 rounded-lg px-3 py-3 ${
                                activeItem
                                  ? "bg-white text-blue-700 shadow-sm"
                                  : "text-slate-700 hover:bg-white"
                              }`}
                            >
                              {ItemIcon && (
                                <ItemIcon
                                  size={17}
                                  strokeWidth={1.8}
                                  className="shrink-0"
                                />
                              )}

                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Standalone mobile links */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {standaloneNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isRouteActive(item.href);

                  return (
                    <Link
                      key={`mobile-${item.name}`}
                      href={item.href}
                      onClick={closeMenus}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${
                        active
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile account section */}
            <div className="mt-4 border-t border-slate-200 pt-4">
              {authLoading ? (
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ) : userEmail ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/signup"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}