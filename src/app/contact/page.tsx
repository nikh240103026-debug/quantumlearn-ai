import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bug,
  LifeBuoy,
  Mail,
  MessageSquareHeart,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SpotlightGroup } from "@/components/fx/SpotlightGroup";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${site.name} team.`,
};

const CHANNELS = [
  {
    icon: LifeBuoy,
    title: "Help Center",
    body: "Guides and answers for accounts, the lab, coding and assessments.",
    cta: "Browse help articles",
    href: "/help",
  },
  {
    icon: Mail,
    title: "Email support",
    body: "For account problems or anything the Help Center doesn't cover.",
    cta: site.supportEmail,
    href: `mailto:${site.supportEmail}`,
  },
  {
    icon: MessageSquareHeart,
    title: "Product feedback",
    body: "Ideas, feature requests and things that confused you. We read every one.",
    cta: "Send feedback",
    href: "/feedback",
  },
  {
    icon: Bug,
    title: "Wrong question or answer?",
    body: "Use the report button on any practice question so we can fix it fast.",
    cta: "Go to practice",
    href: "/practice",
  },
  {
    icon: UserRoundCog,
    title: "Privacy requests",
    body: "Access, correction or deletion of your personal data.",
    cta: site.privacyEmail,
    href: `mailto:${site.privacyEmail}`,
  },
  {
    icon: ShieldCheck,
    title: "Security",
    body: "Found a vulnerability? Please report it privately.",
    cta: site.securityEmail,
    href: `mailto:${site.securityEmail}`,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#05070d] text-white">
      <section className="relative overflow-hidden">
        <div className="ql-grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.25),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-12">
          <p className="ql-enter font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300/80">Contact</p>
          <h1 className="ql-enter mt-4 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1] tracking-[-0.05em]" style={{ "--ql-delay": "60ms" } as React.CSSProperties}>
            Talk to a human who <span className="ql-text-gradient">knows qubits.</span>
          </h1>
          <p className="ql-enter mt-6 max-w-xl text-lg leading-8 text-white/55" style={{ "--ql-delay": "120ms" } as React.CSSProperties}>
            Pick the channel that fits and we&apos;ll get back to you — usually
            within two business days.
          </p>

          <SpotlightGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((channel) => {
              const Icon = channel.icon;
              const external = channel.href.startsWith("mailto:");
              const className =
                "ql-spotlight group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a0e18] p-6 transition-colors hover:border-white/20";
              const inner = (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300">
                    <Icon size={18} />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold">{channel.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/50">{channel.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-white transition-colors group-hover:text-blue-300">
                    {channel.cta}
                    <ArrowUpRight size={14} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </>
              );
              return external ? (
                <a key={channel.title} href={channel.href} className={className}>
                  {inner}
                </a>
              ) : (
                <Link key={channel.title} href={channel.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </SpotlightGroup>
        </div>
      </section>
      <Footer />
    </main>
  );
}
