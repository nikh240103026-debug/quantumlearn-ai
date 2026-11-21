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
  Settings,
  LifeBuoy,
  Bell,
  Check,
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

type NavbarNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  href: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
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
        description:
          "Work with Qiskit, Cirq, PennyLane and qBraid",
        icon: FlaskConical,
      },
      {
        name: "Quantum Tutor",
        href: "/ai-tutor",
        description:
          "Understand circuits and algorithms with AI",
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
        description:
          "Learn quantum programming step by step",
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
        description:
          "Get intelligent coding guidance",
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
        description:
          "Test and strengthen your knowledge",
        icon: FileText,
      },
      {
        name: "Assessments",
        href: "/practice/assessment",
        description:
          "Take structured quantum assessments",
        icon: ClipboardCheck,
      },
      {
        name: "My Results",
        href: "/practice/assessment/result",
        description:
          "Review your assessment performance",
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
  {
    name: "Help Center",
    href: "/help",
    icon: LifeBuoy,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [openDropdown, setOpenDropdown] =
    useState<string | null>(null);

  const [userEmail, setUserEmail] =
    useState<string | null>(null);

  const [userName, setUserName] =
    useState<string | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [
    notifications,
    setNotifications,
  ] = useState<NavbarNotification[]>([]);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    [],
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

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
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
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

          if (!user) {
            setNotifications([]);
            setNotificationsOpen(false);
          }
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }

    let mounted = true;

    async function loadNotifications(
      showLoading = false,
    ) {
      if (showLoading) {
        setNotificationsLoading(true);
      }

      try {
        const response = await fetch(
          "/api/dashboard/notifications",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load notifications.",
          );
        }

        const data = await response.json();

        if (!mounted) return;

        setNotifications(
          Array.isArray(data?.notifications)
            ? data.notifications
            : [],
        );
      } catch (error) {
        console.error(
          "Notification loading failed:",
          error,
        );
      } finally {
        if (mounted && showLoading) {
          setNotificationsLoading(false);
        }
      }
    }

    void loadNotifications(true);

    const interval = window.setInterval(() => {
      void loadNotifications(false);
    }, 30_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [userEmail]);

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) =>
      isRouteActive(item.href),
    );
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  async function handleLogout() {
    closeMenus();
    setNotificationsOpen(false);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout failed:",
        error,
      );
      return;
    }

    setUserEmail(null);
    setUserName(null);
    setNotifications([]);

    window.location.href = "/";
  }

  async function markNotificationRead(
    id: string,
  ) {
    const notification = notifications.find(
      (item) => item.id === id,
    );

    if (!notification || notification.read) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
              readAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    try {
      const response = await fetch(
        "/api/dashboard/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Unable to mark notification as read.",
        );
      }
    } catch (error) {
      console.error(
        "Mark notification read failed:",
        error,
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                read: false,
                readAt: null,
              }
            : item,
        ),
      );
    }
  }

  async function markAllNotificationsRead() {
    if (unreadCount === 0) {
      return;
    }

    const previous = notifications;

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
        readAt:
          item.readAt ??
          new Date().toISOString(),
      })),
    );

    try {
      const response = await fetch(
        "/api/dashboard/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            all: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Unable to mark all notifications as read.",
        );
      }
    } catch (error) {
      console.error(
        "Mark all notifications read failed:",
        error,
      );

      setNotifications(previous);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0f17]/70 text-white backdrop-blur-xl">
      <nav
        className="flex h-[72px] w-full items-center border-b border-white/5 px-5 sm:px-8 lg:px-10 xl:px-12"
        aria-label="Main navigation"
      >
        {/* LOGO */}

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
            <span className="text-blue-500">
              AI
            </span>
          </span>
        </Link>

        {/* CENTER NAVIGATION */}

        <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex xl:px-8">
          <div className="flex items-center gap-1 xl:gap-2">
            {navGroups.map((group) => {
              const Icon = group.icon;
              const active =
                isGroupActive(group);
              const open =
                openDropdown === group.name;

              return (
                <div
                  key={group.name}
                  className="relative"
                  onMouseEnter={() =>
                    setOpenDropdown(group.name)
                  }
                  onMouseLeave={() =>
                    setOpenDropdown(null)
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(
                        (current) =>
                          current === group.name
                            ? null
                            : group.name,
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
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />

                    {group.name}

                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        open
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="absolute left-1/2 top-full z-50 w-[330px] -translate-x-1/2 border-x border-b border-white/10 pt-2">
                      <div className="overflow-hidden border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40">
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            {group.name}
                          </p>
                        </div>

                        <div>
                          {group.items.map(
                            (item) => {
                              const ItemIcon =
                                item.icon;

                              const activeItem =
                                isRouteActive(
                                  item.href,
                                );

                              return (
                                <Link
                                  key={`${group.name}-${item.name}`}
                                  href={
                                    item.href
                                  }
                                  onClick={
                                    closeMenus
                                  }
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
                                        size={
                                          16
                                        }
                                        strokeWidth={
                                          1.8
                                        }
                                      />
                                    </span>
                                  )}

                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                      {
                                        item.name
                                      }
                                    </span>

                                    {item.description && (
                                      <span className="mt-0.5 block text-xs leading-5 text-white/40">
                                        {
                                          item.description
                                        }
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {standaloneNavigation.map(
              (item) => {
                const Icon = item.icon;
                const active =
                  isRouteActive(item.href);

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
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />
                    {item.name}
                  </Link>
                );
              },
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="hidden shrink-0 items-center gap-2 border-white/10 pl-6 lg:flex">
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse border border-white/10 bg-white/5" />
          ) : userEmail ? (
            <>
              {/* NOTIFICATION BELL */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setNotificationsOpen(
                      (open) => !open,
                    )
                  }
                  className={`relative flex h-10 w-10 items-center justify-center border transition-colors ${
                    notificationsOpen
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-label="Notifications"
                  aria-expanded={
                    notificationsOpen
                  }
                >
                  <Bell
                    size={18}
                    strokeWidth={1.8}
                  />

                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex min-w-[17px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold leading-[17px] text-white ring-2 ring-[#0b0f17]">
                      {unreadCount > 9
                        ? "9+"
                        : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full z-50 w-[380px] pt-2">
                    <div className="overflow-hidden border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40">
                      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Notifications
                          </p>

                          <p className="mt-1 text-[11px] text-white/35">
                            {unreadCount > 0
                              ? `${unreadCount} unread`
                              : "You're all caught up"}
                          </p>
                        </div>

                        {unreadCount >
                          0 && (
                          <button
                            type="button"
                            onClick={
                              markAllNotificationsRead
                            }
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-400 transition-colors hover:text-blue-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[420px] overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="px-5 py-12 text-center">
                            <div className="mx-auto h-5 w-5 animate-spin border-2 border-white/10 border-t-blue-500" />

                            <p className="mt-4 text-xs text-white/35">
                              Loading notifications...
                            </p>
                          </div>
                        ) : notifications.length ===
                          0 ? (
                          <div className="px-5 py-12 text-center">
                            <Bell
                              size={20}
                              className="mx-auto text-white/20"
                            />

                            <p className="mt-4 text-sm font-semibold text-white/75">
                              You're all caught up.
                            </p>

                            <p className="mt-2 text-xs leading-5 text-white/35">
                              Important learning and
                              platform updates will
                              appear here.
                            </p>
                          </div>
                        ) : (
                          notifications.map(
                            (
                              notification,
                            ) => {
                              const content =
                                (
                                  <div
                                    className={`flex gap-3 border-b border-white/5 px-5 py-4 transition-colors last:border-b-0 ${
                                      notification.read
                                        ? "hover:bg-white/[0.03]"
                                        : "bg-blue-600/[0.08] hover:bg-blue-600/[0.12]"
                                    }`}
                                  >
                                    <div
                                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                                        notification.read
                                          ? "border-white/10 bg-white/5 text-white/25"
                                          : "border-blue-500/30 bg-blue-600 text-white"
                                      }`}
                                    >
                                      {notification.read ? (
                                        <Check
                                          size={
                                            14
                                          }
                                        />
                                      ) : (
                                        <Bell
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <p
                                          className={`text-xs font-semibold ${
                                            notification.read
                                              ? "text-white/70"
                                              : "text-white"
                                          }`}
                                        >
                                          {
                                            notification.title
                                          }
                                        </p>

                                        <span className="shrink-0 text-[9px] text-white/25">
                                          {formatRelativeTime(
                                            notification.createdAt,
                                          )}
                                        </span>
                                      </div>

                                      <p className="mt-1 text-[11px] leading-5 text-white/40">
                                        {
                                          notification.message
                                        }
                                      </p>
                                    </div>
                                  </div>
                                );

                              if (
                                notification.href
                              ) {
                                return (
                                  <Link
                                    key={
                                      notification.id
                                    }
                                    href={
                                      notification.href
                                    }
                                    onClick={() => {
                                      void markNotificationRead(
                                        notification.id,
                                      );

                                      setNotificationsOpen(
                                        false,
                                      );
                                    }}
                                    className="block"
                                  >
                                    {content}
                                  </Link>
                                );
                              }

                              return (
                                <button
                                  key={
                                    notification.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    void markNotificationRead(
                                      notification.id,
                                    )
                                  }
                                  className="block w-full text-left"
                                >
                                  {content}
                                </button>
                              );
                            },
                          )
                        )}
                      </div>

                      <div className="border-t border-white/10 px-5 py-3">
                        <Link
                          href="/settings?tab=notifications"
                          onClick={() => {
                            setNotificationsOpen(
                              false,
                            );
                          }}
                          className="flex items-center justify-between text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                        >
                          Notification settings

                          <ArrowRight
                            size={14}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DASHBOARD */}

              <Link
                href="/dashboard"
                onClick={closeMenus}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-colors ${
                  isRouteActive(
                    "/dashboard",
                  )
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:bg-black/20 hover:text-white"
                }`}
              >
                <LayoutDashboard
                  size={16}
                  strokeWidth={1.8}
                />
                Dashboard
              </Link>

              {/* ACCOUNT */}

              <div className="group relative">
                <button
                  type="button"
                  className="flex max-w-[190px] items-center gap-2 px-3 py-1.5 transition-colors hover:bg-black/20"
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600 text-xs font-bold text-white">
                    {(userName ||
                      userEmail)
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="max-w-[115px] truncate text-sm font-medium text-white">
                    {userName ||
                      userEmail}
                  </span>

                  <ChevronDown
                    size={14}
                    className="shrink-0 text-white/40 transition-transform group-hover:rotate-180"
                  />
                </button>

                <div className="invisible absolute right-0 top-full w-60 border-x border-b border-white/10 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden border border-white/10 bg-[#11151f] shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-600 text-sm font-bold text-white">
                        {(userName ||
                          userEmail)
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                          Signed in as
                        </p>

                        <p className="truncate text-sm font-semibold text-white">
                          {userName ||
                            userEmail}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center gap-3 border-b border-white/5 px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard
                        size={16}
                      />
                      Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      onClick={closeMenus}
                      className="flex items-center gap-3 border-b border-white/5 px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Settings
                        size={16}
                      />
                      Settings
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-white/75 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut
                        size={16}
                      />
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
                <ArrowRight
                  size={16}
                />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/80 transition-colors hover:bg-white/10 lg:hidden"
          onClick={() =>
            setMobileMenuOpen(
              (open) => !open,
            )
          }
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            mobileMenuOpen
          }
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </nav>

      {/* MOBILE NAVIGATION */}

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#080b12] lg:hidden">
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {/* MOBILE NOTIFICATIONS */}

              {userEmail && (
                <div className="border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationsOpen(
                        (open) => !open,
                      )
                    }
                    className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                      notificationsOpen
                        ? "bg-white/10 text-white"
                        : "text-white/75"
                    }`}
                    aria-expanded={
                      notificationsOpen
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Bell
                        size={18}
                        strokeWidth={1.8}
                      />

                      <span className="text-sm font-semibold">
                        Notifications
                      </span>
                    </span>

                    {unreadCount > 0 && (
                      <span className="min-w-[22px] rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {unreadCount > 9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="border-t border-white/10 bg-white/[0.03]">
                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length ===
                        0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell
                              size={19}
                              className="mx-auto text-white/20"
                            />

                            <p className="mt-3 text-xs font-semibold text-white/60">
                              You're all caught up.
                            </p>
                          </div>
                        ) : (
                          notifications.map(
                            (
                              notification,
                            ) => {
                              const content =
                                (
                                  <div
                                    className={`flex gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 ${
                                      notification.read
                                        ? ""
                                        : "bg-blue-600/[0.08]"
                                    }`}
                                  >
                                    <div
                                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${
                                        notification.read
                                          ? "bg-white/5 text-white/25"
                                          : "bg-blue-600 text-white"
                                      }`}
                                    >
                                      {notification.read ? (
                                        <Check
                                          size={
                                            13
                                          }
                                        />
                                      ) : (
                                        <Bell
                                          size={
                                            13
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-semibold text-white/80">
                                          {
                                            notification.title
                                          }
                                        </p>

                                        <span className="shrink-0 text-[9px] text-white/25">
                                          {formatRelativeTime(
                                            notification.createdAt,
                                          )}
                                        </span>
                                      </div>

                                      <p className="mt-1 text-[11px] leading-5 text-white/40">
                                        {
                                          notification.message
                                        }
                                      </p>
                                    </div>
                                  </div>
                                );

                              if (
                                notification.href
                              ) {
                                return (
                                  <Link
                                    key={
                                      notification.id
                                    }
                                    href={
                                      notification.href
                                    }
                                    onClick={() => {
                                      void markNotificationRead(
                                        notification.id,
                                      );
                                      closeMenus();
                                      setNotificationsOpen(
                                        false,
                                      );
                                    }}
                                    className="block"
                                  >
                                    {content}
                                  </Link>
                                );
                              }

                              return (
                                <button
                                  key={
                                    notification.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    void markNotificationRead(
                                      notification.id,
                                    )
                                  }
                                  className="block w-full text-left"
                                >
                                  {content}
                                </button>
                              );
                            },
                          )
                        )}
                      </div>

                      <div className="border-t border-white/10 px-4 py-3">
                        {unreadCount >
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              void markAllNotificationsRead()
                            }
                            className="mb-3 w-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 hover:bg-white/5 hover:text-white"
                          >
                            Mark all as read
                          </button>
                        )}

                        <Link
                          href="/settings?tab=notifications"
                          onClick={() => {
                            closeMenus();
                            setNotificationsOpen(
                              false,
                            );
                          }}
                          className="flex items-center justify-between text-xs font-semibold text-blue-400"
                        >
                          Notification settings
                          <ArrowRight
                            size={14}
                          />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NAV GROUPS */}

              {navGroups.map((group) => {
                const Icon = group.icon;
                const open =
                  openDropdown === group.name;
                const active =
                  isGroupActive(group);

                return (
                  <div
                    key={group.name}
                    className="overflow-hidden border border-white/10"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          (current) =>
                            current ===
                            group.name
                              ? null
                              : group.name,
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
                        <Icon
                          size={18}
                          strokeWidth={
                            1.8
                          }
                        />
                        {group.name}
                      </span>

                      <ChevronDown
                        size={17}
                        className={`transition-transform duration-200 ${
                          open
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="border-t border-white/10 bg-white/[0.03]">
                        {group.items.map(
                          (item) => {
                            const ItemIcon =
                              item.icon;

                            const activeItem =
                              isRouteActive(
                                item.href,
                              );

                            return (
                              <Link
                                key={`${group.name}-mobile-${item.name}`}
                                href={
                                  item.href
                                }
                                onClick={
                                  closeMenus
                                }
                                className={`flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 ${
                                  activeItem
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                {ItemIcon && (
                                  <ItemIcon
                                    size={
                                      17
                                    }
                                    strokeWidth={
                                      1.8
                                    }
                                    className="shrink-0"
                                  />
                                )}

                                <span className="text-sm font-medium">
                                  {
                                    item.name
                                  }
                                </span>
                              </Link>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* STANDALONE */}

              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/about"
                  onClick={closeMenus}
                  className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm font-semibold ${
                    isRouteActive(
                      "/about",
                    )
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Info
                    size={17}
                    strokeWidth={1.8}
                  />
                  About
                </Link>

                <Link
                  href="/resources"
                  onClick={closeMenus}
                  className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm font-semibold ${
                    isRouteActive(
                      "/resources",
                    )
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Library
                    size={17}
                    strokeWidth={1.8}
                  />
                  Resources
                </Link>

                <Link
                  href="/help"
                  onClick={closeMenus}
                  className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm font-semibold ${
                    isRouteActive(
                      "/help",
                    )
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <LifeBuoy
                    size={17}
                    strokeWidth={1.8}
                  />
                  Help
                </Link>
              </div>
            </div>

            {/* MOBILE ACCOUNT */}

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
                    <LayoutDashboard
                      size={17}
                    />
                    Dashboard
                  </Link>

                  <Link
                    href="/settings"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm font-semibold text-white/75 hover:bg-white/5 hover:text-white"
                  >
                    <Settings
                      size={17}
                    />
                    Settings
                  </Link>

                  <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-600 text-sm font-bold text-white">
                      {(userName ||
                        userEmail)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
                        Signed in as
                      </p>

                      <p className="truncate text-sm font-semibold text-white">
                        {userName ||
                          userEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex w-full items-center justify-center gap-2 border border-transparent px-4 py-3 text-sm font-semibold text-white/70 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut
                      size={17}
                    />
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
                    <ArrowRight
                      size={16}
                    />
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

function formatRelativeTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = Date.now();
  const difference =
    now - date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  );
}