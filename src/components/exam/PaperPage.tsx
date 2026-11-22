import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Page frame for the exam area (practice + assessments): paper ground,
 * a masthead like the top of an exam booklet, and a breadcrumb.
 */
export function PaperPage({
  crumbs,
  kicker,
  title,
  lead,
  aside,
  children,
}: {
  crumbs: Array<{ label: string; href?: string }>;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="ql-paper min-h-screen text-ink">
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight size={12} />}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-exam-blue">
                <span className="h-[3px] w-8 bg-exam-blue" />
                {kicker}
              </p>
              <h1 className="mt-4 font-serif text-[clamp(2.4rem,5.2vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.025em]">
                {title}
              </h1>
              {lead && <div className="mt-4 max-w-xl text-base leading-7 text-ink-soft">{lead}</div>}
            </div>
            {aside}
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
