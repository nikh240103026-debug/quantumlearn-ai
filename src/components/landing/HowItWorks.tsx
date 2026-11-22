import { BookOpen, Cpu, FlaskConical, Sparkles } from "lucide-react";
import { SectionIntro } from "@/components/landing/SectionIntro";

const STEPS = [
  {
    icon: BookOpen,
    title: "Learn the concept",
    body: "Read a focused lesson with rendered math, worked examples and a summary you can export.",
    code: "lesson.open('entanglement')",
  },
  {
    icon: FlaskConical,
    title: "Build the circuit",
    body: "Recreate the idea in the Quantum Lab and watch the statevector change gate by gate.",
    code: "circuit.add(H, 0).add(CX, 0, 1)",
  },
  {
    icon: Cpu,
    title: "Execute the code",
    body: "Export the same circuit to Qiskit, PennyLane or Cirq and run it on a simulator backend.",
    code: "backend.run(qc, shots=1024)",
  },
  {
    icon: Sparkles,
    title: "Understand the result",
    body: "Ask the AI tutor why the histogram looks the way it does, then prove it in a practice set.",
    code: "tutor.explain(result)",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="ql-grid-bg-light pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionIntro
          tone="light"
          eyebrow="How it works"
          title="One loop. Four steps. Repeat until it clicks."
          description="Quantum ideas stick when you see them, build them and break them. Every topic in QuantumLearn follows the same loop."
        />

        <ol className="relative mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-violet-500/0 lg:block" />
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="ql-reveal group relative rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_-24px_rgba(37,99,235,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 transition-colors group-hover:bg-blue-600">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                  <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.015em] text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
                <code className="mt-6 block truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-500 transition-colors group-hover:border-blue-200 group-hover:text-blue-700">
                  <span className="text-slate-300">&gt; </span>
                  {step.code}
                </code>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
