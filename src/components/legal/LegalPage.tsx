import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export type LegalSection = { id: string; title: string };

/**
 * Shared shell for policy pages: dark header band, sticky table of
 * contents, readable long-form column, and the site footer.
 */
export function LegalPage({
  eyebrow,
  title,
  summary,
  updated,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: ReactNode;
  updated?: string;
  sections: LegalSection[];
  children: ReactNode;
}) {
  return (
    <main className="bg-white">
      <header className="relative overflow-hidden bg-[#05070d] text-white">
        <div className="ql-grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/3 h-80 w-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.22),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/70">{title}</span>
          </nav>
          <p className="ql-enter mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300/80">{eyebrow}</p>
          <h1 className="ql-enter mt-4 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.045em]" style={{ "--ql-delay": "60ms" } as React.CSSProperties}>
            {title}
          </h1>
          <div className="ql-enter mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg" style={{ "--ql-delay": "120ms" } as React.CSSProperties}>
            {summary}
          </div>
          {updated && (
            <p className="ql-enter mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/55" style={{ "--ql-delay": "180ms" } as React.CSSProperties}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Last updated {updated}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[230px_1fr] lg:gap-16 lg:px-12">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">On this page</p>
            <ol className="mt-4 space-y-1 border-l border-slate-200">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-slate-500 transition-colors hover:border-blue-500 hover:text-slate-950"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="ql-prose min-w-0 max-w-[720px]">{children}</article>
      </div>

      <Footer />
    </main>
  );
}
