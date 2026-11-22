import Link from "next/link";
import {
  ArrowUpRight,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { SectionIntro } from "@/components/landing/SectionIntro";

/**
 * Each point here describes something the product actually does.
 * Keep it that way: update this list when the behaviour changes.
 */
const PILLARS = [
  {
    icon: KeyRound,
    title: "Secure sign-in",
    body: "Accounts run on Supabase Auth with email verification and secure password reset links.",
  },
  {
    icon: EyeOff,
    title: "Private by default",
    body: "Your bio, institute and learning level stay hidden from other learners until you choose to share them.",
  },
  {
    icon: Trash2,
    title: "Delete anytime",
    body: "Delete your account yourself from Settings in a few seconds. No support tickets, no email chains.",
  },
  {
    icon: LockKeyhole,
    title: "Fair assessments",
    body: "Answer keys never ship to the browser. Answers are graded on the server, so scores mean something.",
  },
  {
    icon: Sparkles,
    title: "Honest about AI",
    body: "Tutor responses are clearly AI-generated. Spot a wrong answer or question? Report it in one click.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted in transit",
    body: "All traffic is served over HTTPS. Secrets and service keys stay on the server, never in your browser.",
  },
];

export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="ql-grid-bg-light pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionIntro
              tone="light"
              eyebrow="Trust & privacy"
              title="Your learning data is yours."
              description="We built QuantumLearn the way we would want a learning platform to treat our own data. Here is exactly what that means."
            />
            <div className="ql-reveal mt-8 flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400"
              >
                Privacy policy
                <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/security"
                className="group inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
              >
                Security overview
                <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <li
                  key={pillar.title}
                  className="ql-reveal group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors group-hover:border-emerald-300">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
