"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  BookOpen,
  FlaskConical,
  Code2,
  Target,
  Info,
  Library,
  Brain,
  LayoutDashboard,
  History,
  LogOut,
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
    name: "About",
    href: "/about",
    icon: Info,
  },
  {
    name: "Resources",
    href: "/resources",
    icon: Library,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUserEmail(user?.email ?? null);

      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.user_metadata?.display_name ||
        user?.email?.split("@")[0] ||
        null;

      setUserName(name);
      setAuthLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const user = session?.user;

      setUserEmail(user?.email ?? null);

      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.user_metadata?.display_name ||
        user?.email?.split("@")[0] ||
        null;

      setUserName(name);
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
    setUserName(null);

    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0f17]/70 text-white backdrop-blur-xl">
      <nav
        className="flex h-[72px] w-full items-center border-b border-white/5 px-5 sm:px-8 lg:px-10 xl:px-12"
        aria-label="Main navigation"
      >
        {/* LEFT: Logo + Website Name */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 border-r border-white/10 pr-6"
        >
          <img
            src="/images/quantumlearn-logo.png"
            alt="QuantumLearn AI"
            className="h-10 w-10 object-contain"
          />

          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-white">
            QuantumLearn{" "}
            <span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* CENTER: Navigation */}
        <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex xl:px-8">
          <div className="flex items-center gap-1 xl:gap-2">
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
                    className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-medium transition-colors ${
                      active || open
                        ? "border-white/15 bg-white/10 text-white"
                        : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"
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
                    <div className="absolute left-1/2 top-full z-50 w-[330px] -translate-x-1/2 border-x border-b border-white/10 pt-2">
                      <div className="overflow-hidden border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40">
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            {group.name}
                          </p>
                        </div>

                        <div>
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const activeItem = isRouteActive(item.href);

                            return (
                              <Link
                                key={`${group.name}-${item.name}`}
                                href={item.href}
                                onClick={closeMenus}
                                className={`group/item flex items-start gap-3 border-b border-white/5 px-4 py-3.5 transition-colors last:border-b-0 ${
                                  activeItem
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-white/80 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                {ItemIcon && (
                                  <span
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                                      activeItem
                                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                        : "border-white/10 bg-white/5 text-white/45"
                                    }`}
                                  >
                                    <ItemIcon
                                      size={16}
                                      strokeWidth={1.8}
                                    />
                                  </span>
                                )}

                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold">
                                    {item.name}
                                  </span>

                                  {item.description && (
                                    <span className="mt-0.5 block text-xs leading-5 text-white/40">
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

            {/* About + Resources */}
            {standaloneNavigation.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenus}
                  className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Dashboard + Account */}
        <div className="hidden shrink-0 items-center gap-2 border-white/10 pl-6 lg:flex">
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse border border-white/10 bg-white/5" />
          ) : userEmail ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenus}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-colors ${
                  isRouteActive("/dashboard")
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:bg-black/20 hover:text-white"
                }`}
              >
                <LayoutDashboard size={16} strokeWidth={1.8} />
                Dashboard
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  className="flex max-w-[190px] items-center gap-2 px-3 py-1.5 transition-colors hover:bg-black/20"
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600 text-xs font-bold text-white">
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-[115px] truncate text-sm font-medium text-white">
                    {userName || userEmail}
                  </span>

                  <ChevronDown
                    size={14}
                    className="shrink-0 text-white/40 transition-transform group-hover:rotate-180"
                  />
                </button>

                {/* Account Dropdown */}
                <div className="invisible absolute right-0 top-full w-60 border-x border-b border-white/10 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-600 text-sm font-bold text-white">
                        {(userName || userEmail).charAt(0).toUpperCase()}
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                          Signed in as
                        </p>

                        <p className="truncate text-sm font-semibold text-white">
                          {userName || userEmail}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center gap-3 border-b border-white/5 px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-white/75 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
                className="border border-transparent px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                onClick={closeMenus}
                className="inline-flex items-center gap-2 border border-blue-500 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
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
          className="ml-auto inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/80 transition-colors hover:bg-white/10 lg:hidden"
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
        <div className="border-t border-white/10 bg-[#080b12] lg:hidden">
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {navGroups.map((group) => {
                const Icon = group.icon;
                const open = openDropdown === group.name;
                const active = isGroupActive(group);

                return (
                  <div
                    key={group.name}
                    className="overflow-hidden border border-white/10"
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
                          ? "bg-white/10 text-white"
                          : "text-white/75"
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
                      <div className="border-t border-white/10 bg-white/[0.03]">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const activeItem = isRouteActive(item.href);

                          return (
                            <Link
                              key={`${group.name}-mobile-${item.name}`}
                              href={item.href}
                              onClick={closeMenus}
                              className={`flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 ${
                                activeItem
                                  ? "bg-blue-600/10 text-blue-400"
                                  : "text-white/70 hover:bg-white/5 hover:text-white"
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

              {/* About + Resources */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/about"
                  onClick={closeMenus}
                  className={`flex items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold ${
                    isRouteActive("/about")
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Info size={17} strokeWidth={1.8} />
                  About
                </Link>

                <Link
                  href="/resources"
                  onClick={closeMenus}
                  className={`flex items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold ${
                    isRouteActive("/resources")
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Library size={17} strokeWidth={1.8} />
                  Resources
                </Link>
              </div>
            </div>

            {/* Mobile Account */}
            <div className="mt-4 border-t border-white/10 pt-4">
              {authLoading ? (
                <div className="h-12 animate-pulse border border-white/10 bg-white/5" />
              ) : userEmail ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-600 text-sm font-bold text-white">
                      {(userName || userEmail).charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                        Signed in as
                      </p>

                      <p className="truncate text-sm font-semibold text-white">
                        {userName || userEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 border border-transparent px-4 py-3 text-sm font-semibold text-white/70 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
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
                    className="flex items-center justify-center border border-white/10 px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/5 hover:text-white"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/signup"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 border border-blue-500 bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
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