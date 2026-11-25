import type { ReactNode } from "react";

/* Borderless building blocks: surfaces are separated by fill and spacing. */

export const card = "rounded-2xl bg-white/[.04] p-6";
export const primary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50";
export const secondary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-white/[.07] px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[.14] disabled:opacity-50";
export const input =
  "block w-full rounded-xl bg-white/[.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:bg-white/[.13] [&>option]:bg-[#11151f]";

export function PlainPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-[-0.04em]">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-base leading-7 text-white/65">{intro}</div>}
        <div className="mt-10 space-y-6">{children}</div>
      </div>
    </main>
  );
}

export function Problem({ children }: { children: ReactNode }) {
  return children ? (
    <p role="alert" className="rounded-xl bg-red-400/10 p-4 text-sm text-red-200">
      {children}
    </p>
  ) : null;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-white/[.03] p-10 text-center text-sm text-white/60">{children}</p>;
}
