// fixing deployemeny error
import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  FileQuestion,
  Flag,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Network,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/admin";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

type IconKey =
  | "Activity"
  | "Award"
  | "BarChart3"
  | "Bell"
  | "BookOpen"
  | "Bot"
  | "CircleHelp"
  | "ClipboardList"
  | "FileQuestion"
  | "Flag"
  | "FlaskConical"
  | "GraduationCap"
  | "LayoutDashboard"
  | "Megaphone"
  | "MessageSquare"
  | "Network"
  | "Settings"
  | "Users";

type NavItem = readonly [
  label: string,
  href: string,
  icon: IconKey,
];

type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

export const ADMIN_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      ["Dashboard", "/admin", "LayoutDashboard"],
      ["Analytics", "/admin/analytics", "BarChart3"],
      ["System Health", "/admin/system-health", "Activity"],
    ],
  },
  {
    label: "Learning",
    items: [
      ["Courses", "/admin/courses", "GraduationCap"],
      ["Lessons", "/admin/lessons", "BookOpen"],
      ["Chapters", "/admin/chapters", "Network"],
      ["Resources", "/admin/resources", "BookOpen"],
      [
        "Practice Questions",
        "/admin/practice-questions",
        "FileQuestion",
      ],
      [
        "Question Bank",
        "/admin/question-bank",
        "ClipboardList",
      ],
    ],
  },
  {
    label: "Platform",
    items: [
      ["Users", "/admin/users", "Users"],
      ["Quantum Lab", "/admin/quantum-lab", "FlaskConical"],
      ["AI Tutor", "/admin/ai-tutor", "Bot"],
      [
        "User Questions",
        "/admin/user-questions",
        "CircleHelp",
      ],
      ["Feedback", "/admin/feedback", "MessageSquare"],
      ["Reports", "/admin/reports", "Flag"],
    ],
  },
  {
    label: "Communication",
    items: [
      [
        "Announcements",
        "/admin/announcements",
        "Megaphone",
      ],
      ["Notifications", "/admin/notifications", "Bell"],
    ],
  },
  {
    label: "Administration",
    items: [
      ["Certificates", "/admin/certificates", "Award"],
      ["Settings", "/admin/settings", "Settings"],
    ],
  },
] as const satisfies readonly NavGroup[];

const ICONS: Record<IconKey, typeof Activity> = {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CircleHelp,
  ClipboardList,
  FileQuestion,
  Flag,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Network,
  Settings,
  Users,
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  const name =
    admin.full_name ||
    admin.username ||
    admin.email ||
    "Administrator";

  return (
    <div className="min-h-screen bg-[#0c0812] text-white">
      <div className="flex min-h-screen">
        {/* ====================================================
            DESKTOP SIDEBAR
        ==================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#100b18] lg:flex lg:flex-col">
          <Brand />

          <Nav />

          <div className="border-t border-white/[0.08] p-3">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-3 py-2.5 text-xs text-white/35 transition-colors hover:bg-violet-500/[0.07] hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

              <span>Back to Platform</span>
            </Link>
          </div>
        </aside>

        {/* ====================================================
            APPLICATION AREA
        ==================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ==================================================
              ADMIN TOP BAR
          ================================================== */}

          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0c0812]/95 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <AdminMobileNav
                groups={ADMIN_NAV_GROUPS}
              />

              <div className="flex items-center gap-3">
                <div className="hidden h-7 w-px bg-white/10 sm:block" />

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                    Administration
                  </p>

                  <p className="text-xs text-white/40">
                    QuantumLearn AI
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-white/70">
                  {name}
                </p>

                <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                  Authorized administrator
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-[10px] font-semibold text-violet-200">
                {getInitials(name)}
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ADMIN BRAND
================================================================ */

function Brand() {
  return (
    <div className="relative flex h-16 items-center border-b border-white/[0.08] px-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/[0.08] to-transparent" />

      <Link
        href="/admin"
        className="group relative flex items-center gap-3"
      >
        <div className="flex h-8 w-8 items-center justify-center border border-violet-400/25 bg-violet-500/10 transition-colors group-hover:border-violet-400/50 group-hover:bg-violet-500/15">
          <ShieldCheck className="h-4 w-4 text-violet-300" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-tight">
            QuantumLearn
          </p>

          <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
            Admin Console
          </p>
        </div>
      </Link>
    </div>
  );
}

/* ================================================================
   DESKTOP NAVIGATION
================================================================ */

function Nav() {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div
          key={group.label}
          className="mb-6"
        >
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
            {group.label}
          </p>

          <div className="space-y-0.5">
            {group.items.map(
              ([label, href, iconKey]) => {
                const Icon = ICONS[iconKey];

                return (
                  <Link
                    key={href}
                    href={href}
                    className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 text-xs text-white/40 transition-colors hover:bg-violet-500/[0.07] hover:text-white"
                  >
                    <span className="absolute left-0 top-0 h-full w-px bg-violet-400 opacity-0 transition-opacity group-hover:opacity-100" />

                    <Icon className="h-3.5 w-3.5 text-white/25 transition-colors group-hover:text-violet-300" />

                    <span>{label}</span>
                  </Link>
                );
              },
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ================================================================
   INITIALS
================================================================ */

function getInitials(
  value: string,
) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();

  return initials || "AD";
}