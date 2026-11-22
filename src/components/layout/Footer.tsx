import Link from "next/link";
import { ArrowUp, ArrowUpRight, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Quantum Lab", href: "/quantum-lab" },
      { label: "AI Tutor", href: "/ai-tutor" },
      { label: "Coding Workspace", href: "/coding" },
      { label: "Practice", href: "/practice" },
      { label: "Assessments", href: "/practice/assessment" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Learning Roadmap", href: "/roadmap" },
      { label: "SDK Tutorials", href: "/coding/tutorials" },
      { label: "Resources", href: "/resources" },
      { label: "Community Q&A", href: "/questions" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "Feedback", href: "/feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy#cookies" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-[#05070d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_2.6fr] lg:py-20">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${site.name} home`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/quantumlearn-logo.png" alt="" className="h-10 w-10 object-contain invert" />
              <span className="text-lg font-semibold tracking-tight">
                Quantum<span className="text-blue-400">Learn</span> AI
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-white/50">{site.description}</p>

            <div className="mt-7 space-y-2.5 text-sm">
              <a
                href={`mailto:${site.supportEmail}`}
                className="flex items-center gap-2.5 text-white/60 transition-colors hover:text-white"
              >
                <Mail size={15} className="text-blue-300" />
                {site.supportEmail}
              </a>
              <Link href="/help" className="flex items-center gap-2.5 text-white/60 transition-colors hover:text-white">
                <LifeBuoy size={15} className="text-blue-300" />
                Help Center &amp; guides
              </Link>
              <Link href="/security" className="flex items-center gap-2.5 text-white/60 transition-colors hover:text-white">
                <ShieldCheck size={15} className="text-emerald-300" />
                Report a security issue
              </Link>
            </div>
          </div>

          {/* Link columns */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={12}
                          className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Wordmark */}
        <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
          <p className="translate-y-[18%] whitespace-nowrap bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-center text-[clamp(3rem,12vw,11.5rem)] font-semibold leading-none tracking-[-0.06em] text-transparent">
            QuantumLearn
          </p>
        </div>

        {/* Bottom bar */}
        <div className="relative flex flex-col gap-4 border-t border-white/[0.07] py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/security" className="transition-colors hover:text-white">Security</Link>
            <a href="#top" className="group inline-flex items-center gap-1.5 transition-colors hover:text-white">
              Back to top
              <ArrowUp size={12} className="transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
