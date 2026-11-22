import type { ReactNode } from "react";

/** Consistent eyebrow + headline + lead paragraph for landing sections. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";

  return (
    <div className={`ql-reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p
        className={`inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] ${
          dark ? "text-blue-300/80" : "text-blue-600"
        }`}
      >
        <span className={`h-px w-6 ${dark ? "bg-blue-300/60" : "bg-blue-600/60"}`} />
        {eyebrow}
      </p>
      <h2
        className={`mt-5 text-[clamp(2rem,4.2vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.04em] ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-base leading-7 sm:text-lg sm:leading-8 ${dark ? "text-white/55" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
