import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  FlaskConical,
  LineChart,
  MessagesSquare,
  Route,
  Target,
} from "lucide-react";
import { SpotlightGroup } from "@/components/fx/SpotlightGroup";
import { SectionIntro } from "@/components/landing/SectionIntro";
import { platformFacts } from "@/lib/platform-facts";

export function FeaturesSection() {
  return (
    <section id="platform" className="relative bg-[#05070d] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionIntro
          eyebrow="The platform"
          title={
            <>
              Everything between <span className="ql-text-gradient">curiosity</span> and
              a working quantum program.
            </>
          }
          description="Seven tools that share one model of your progress — so the lesson, the lab, the code editor and the tutor always know where you are."
        />

        <SpotlightGroup className="mt-16 grid gap-4 md:grid-cols-6 lg:grid-cols-12">
          <BentoCard
            className="md:col-span-6 lg:col-span-7 lg:row-span-2"
            href="/quantum-lab"
            icon={FlaskConical}
            label="Quantum Lab"
            title="Drag gates. Watch amplitudes move."
            description="Build multi-qubit circuits, inspect the full statevector and Bloch spheres, sample measurements, and run on multiple simulation backends."
          >
            <BlochVisual />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-5"
            href="/ai-tutor"
            icon={BrainCircuit}
            label="AI Tutor"
            title="A tutor that has read your lesson."
            description="Ask follow-ups in context, get step-by-step derivations with proper math, and debug circuits in plain language."
          >
            <ChatVisual />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-5"
            href="/coding"
            icon={Code2}
            label="Quantum Coding"
            title="Write real Qiskit, PennyLane & Cirq."
            description="Guided tutorials, coding challenges, run history and an AI coding assistant."
          >
            <CodeVisual />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            href="/roadmap"
            icon={Route}
            label="Roadmap"
            title="A path, not a pile of videos."
            description={`${platformFacts.chapters} chapters from linear algebra to advanced quantum programming, in order.`}
          >
            <PathVisual />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            href="/practice"
            icon={Target}
            label="Practice & Assessments"
            title="Know what you actually know."
            description="Topic practice, timed assessments and detailed results."
          >
            <ScoreVisual />
          </BentoCard>

          <BentoCard
            className="md:col-span-6 lg:col-span-4"
            href="/questions"
            icon={MessagesSquare}
            label="Community Q&A"
            title="Ask the hard questions."
            description="Post questions, answer others and learn in public."
          >
            <BarsVisual />
          </BentoCard>
        </SpotlightGroup>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 sm:flex-row sm:items-center">
          <p className="flex items-center gap-3 text-sm text-white/60">
            <LineChart size={16} className="text-blue-300" />
            Every lesson, run and answer feeds one personal dashboard with
            progress analytics and recommendations.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-blue-300"
          >
            See the dashboard <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  className = "",
  href,
  icon: Icon,
  label,
  title,
  description,
  children,
}: {
  className?: string;
  href: string;
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`ql-spotlight ql-reveal group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18] transition-colors hover:border-white/20 ${className}`}
    >
      <div className="relative min-h-[170px] flex-1 overflow-hidden border-b border-white/[0.06]">
        {children}
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-blue-300/80">
            <Icon size={14} />
            {label}
          </span>
          <ArrowUpRight
            size={16}
            className="text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-white/50">{description}</p>
      </div>
    </Link>
  );
}

/* ---------- Mini visuals (pure SVG / CSS, no images) ---------- */

function BlochVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="ql-dots-bg absolute inset-0" />
      <svg viewBox="0 0 260 260" className="relative h-[250px] w-[250px] sm:h-[300px] sm:w-[300px]" aria-hidden="true">
        <defs>
          <radialGradient id="bloch-fill" cx="40%" cy="35%">
            <stop offset="0%" stopColor="rgba(96,165,250,0.25)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
          <linearGradient id="bloch-vec" x1="0" x2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="130" cy="130" r="100" fill="url(#bloch-fill)" stroke="rgba(255,255,255,0.18)" />
        <ellipse cx="130" cy="130" rx="100" ry="30" fill="none" stroke="rgba(255,255,255,0.14)" strokeDasharray="3 4" />
        <ellipse cx="130" cy="130" rx="30" ry="100" fill="none" stroke="rgba(255,255,255,0.08)" />
        <line x1="130" y1="22" x2="130" y2="238" stroke="rgba(255,255,255,0.14)" />
        <line x1="22" y1="130" x2="238" y2="130" stroke="rgba(255,255,255,0.14)" />
        <text x="122" y="16" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="monospace">|0⟩</text>
        <text x="122" y="254" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="monospace">|1⟩</text>
        <g style={{ transformOrigin: "130px 130px" }} className="transition-transform duration-1000 ease-out group-hover:[transform:rotate(58deg)]">
          <line x1="130" y1="130" x2="190" y2="62" stroke="url(#bloch-vec)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="190" cy="62" r="6" fill="#a78bfa" />
          <circle cx="190" cy="62" r="14" fill="rgba(167,139,250,0.25)" />
        </g>
        <circle cx="130" cy="130" r="3" fill="white" />
      </svg>
      <div className="absolute bottom-4 left-5 font-mono text-[11px] text-white/40">
        θ = π/3 · φ = π/4
      </div>
      <div className="absolute right-5 top-4 flex gap-1.5 font-mono text-[10px]">
        {["H", "S", "T", "CX"].map((gate) => (
          <span key={gate} className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-white/60">
            {gate}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2.5 px-6 text-[12px]">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600/90 px-3.5 py-2 text-white">
        Why does measuring one Bell qubit fix the other?
      </div>
      <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3.5 py-2 leading-5 text-white/75">
        The pair shares one state, <span className="font-mono text-blue-200">(|00⟩+|11⟩)/√2</span>.
        There is no |01⟩ term, so once you read 0…
        <span className="ql-caret ml-0.5 text-blue-300" />
      </div>
    </div>
  );
}

function CodeVisual() {
  return (
    <pre className="absolute inset-0 overflow-hidden px-6 py-5 font-mono text-[11.5px] leading-6 text-white/70">
      <span className="text-violet-300">from</span> qiskit <span className="text-violet-300">import</span> QuantumCircuit{"\n"}
      {"\n"}
      qc = QuantumCircuit(<span className="text-amber-300">2</span>, <span className="text-amber-300">2</span>){"\n"}
      qc.<span className="text-blue-300">h</span>(<span className="text-amber-300">0</span>){"\n"}
      qc.<span className="text-blue-300">cx</span>(<span className="text-amber-300">0</span>, <span className="text-amber-300">1</span>){"\n"}
      qc.<span className="text-blue-300">measure</span>([<span className="text-amber-300">0</span>, <span className="text-amber-300">1</span>], [<span className="text-amber-300">0</span>, <span className="text-amber-300">1</span>]){"\n"}
      <span className="text-white/30"># → {"{"}&apos;00&apos;: 509, &apos;11&apos;: 515{"}"}</span>
    </pre>
  );
}

function PathVisual() {
  const steps = [100, 100, 100, 60, 0];
  return (
    <div className="absolute inset-0 flex items-center px-6">
      <div className="relative flex w-full items-center justify-between">
        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        <div className="absolute left-2 top-1/2 h-px w-[62%] -translate-y-1/2 bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-700 group-hover:w-[80%]" />
        {steps.map((done, index) => (
          <span
            key={index}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] ${
              done === 100
                ? "border-blue-400/60 bg-blue-500/20 text-blue-100"
                : done > 0
                  ? "border-violet-400/60 bg-[#0a0e18] text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.6)]"
                  : "border-white/15 bg-[#0a0e18] text-white/35"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreVisual() {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6">
      <svg viewBox="0 0 90 90" className="h-24 w-24 -rotate-90" aria-hidden="true">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="45"
          cy="45"
          r={radius}
          fill="none"
          stroke="url(#score-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.18}
        />
        <defs>
          <linearGradient id="score-grad">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="font-mono text-[11px] leading-6 text-white/50">
        <p><span className="text-emerald-300">✓</span> Superposition</p>
        <p><span className="text-emerald-300">✓</span> Entanglement</p>
        <p><span className="text-amber-300">~</span> Phase kickback</p>
      </div>
    </div>
  );
}

function BarsVisual() {
  const bars = [38, 62, 45, 80, 55, 92, 70];
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-2.5 px-8 pb-6">
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-full max-w-7 origin-bottom rounded-t-md bg-gradient-to-t from-blue-600/40 to-violet-400/70 transition-transform duration-500 group-hover:scale-y-110"
          style={{ height: `${height}%`, transitionDelay: `${index * 40}ms` }}
        />
      ))}
    </div>
  );
}
