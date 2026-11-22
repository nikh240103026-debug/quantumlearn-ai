import Link from "next/link";
import { Plus } from "lucide-react";
import { SectionIntro } from "@/components/landing/SectionIntro";
import { site } from "@/lib/site";

const FAQS = [
  {
    q: "Do I need a physics or math background?",
    a: "No. Chapter 1 covers the complex numbers, linear algebra and probability you need, and the AI tutor can slow down and re-derive anything step by step. Comfort with high-school algebra is enough to start.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. The Quantum Lab simulates circuits directly in your browser, and code in the coding workspace runs on our servers. When you are ready, export your circuit to Qiskit, PennyLane or Cirq and run it locally.",
  },
  {
    q: "Which quantum SDKs are supported?",
    a: "Qiskit, PennyLane and Cirq for code generation and tutorials, plus OpenQASM 2.0 and JSON export. Circuits can run on several simulation backends, including Qiskit Aer and qBraid's QIR simulator.",
  },
  {
    q: "How accurate is the AI tutor?",
    a: "It is a large language model grounded in the lesson you are reading, and it is usually right — but not always. Treat it like a knowledgeable study partner, verify important results in the lab, and use the report button when something looks off.",
  },
  {
    q: "Who can see my profile and progress?",
    a: "Your profile is private by default. Other learners only see your name, username and avatar on community posts unless you switch your profile to public in Settings → Privacy.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Delete Account and confirm. Your account is deleted straight away — you do not need to email anyone.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div>
          <SectionIntro
            tone="light"
            eyebrow="FAQ"
            title="Questions, answered."
            description={
              <>
                Can&apos;t find what you need? Visit the{" "}
                <Link href="/help" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
                  Help Center
                </Link>{" "}
                or email{" "}
                <a href={`mailto:${site.supportEmail}`} className="font-semibold text-blue-600 underline-offset-4 hover:underline">
                  {site.supportEmail}
                </a>
                .
              </>
            }
          />
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((item) => (
            <details key={item.q} className="ql-faq ql-reveal group">
              <summary className="flex items-center justify-between gap-6 py-6 text-left">
                <span className="text-base font-semibold text-slate-950 transition-colors group-hover:text-blue-700 sm:text-lg">
                  {item.q}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors group-hover:border-blue-200 group-hover:text-blue-600">
                  <Plus size={16} className="ql-faq-icon" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 text-[15px] leading-7 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
