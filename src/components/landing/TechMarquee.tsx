const ITEMS = [
  "Qiskit",
  "PennyLane",
  "Cirq",
  "Qiskit Aer",
  "qBraid QIR",
  "OpenQASM 2.0",
  "Statevector simulation",
  "Bloch sphere",
  "Python",
  "LaTeX math",
];

/** "Works with" strip — every item is something the product really supports. */
export function TechMarquee() {
  return (
    <section aria-label="Supported tools and formats" className="border-y border-white/[0.07] bg-[#05070d] py-8 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-5 sm:px-8 lg:flex-row lg:gap-10 lg:px-12">
        <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
          Works with
        </p>
        <div className="ql-marquee w-full">
          <div className="ql-marquee-track gap-12 pr-12">
            {[...ITEMS, ...ITEMS].map((item, index) => (
              <span
                key={index}
                aria-hidden={index >= ITEMS.length}
                className="flex items-center gap-3 whitespace-nowrap text-lg font-medium tracking-tight text-white/45 transition-colors hover:text-white"
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-gradient-to-br from-blue-400 to-violet-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
