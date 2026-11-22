"use client";

import { Check, X } from "lucide-react";

export type OmrState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

/**
 * An answer row styled like an OMR answer sheet: a lettered bubble that
 * fills in with "ink" when chosen, plus the option text in print type.
 */
export function OmrOption({
  letter,
  text,
  state,
  disabled,
  shortcut,
  onSelect,
}: {
  letter: string;
  text: string;
  state: OmrState;
  disabled?: boolean;
  shortcut?: string;
  onSelect: () => void;
}) {
  const row = {
    idle: "border-rule bg-sheet hover:border-ink/40 hover:bg-white",
    selected: "border-exam-blue bg-[#eef1ff] shadow-[inset_4px_0_0_var(--color-exam-blue)]",
    correct: "border-exam-green bg-[#e9f6ee] shadow-[inset_4px_0_0_var(--color-exam-green)]",
    wrong: "ql-shake border-exam-red bg-[#fbecec] shadow-[inset_4px_0_0_var(--color-exam-red)]",
    dimmed: "border-rule/70 bg-sheet/60 opacity-55",
  }[state];

  const fill = {
    idle: null,
    selected: "bg-exam-blue",
    correct: "bg-exam-green",
    wrong: "bg-exam-red",
    dimmed: null,
  }[state];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === "selected" || state === "correct" || state === "wrong"}
      disabled={disabled}
      onClick={onSelect}
      className={`group flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-150 disabled:cursor-default sm:gap-5 sm:px-5 sm:py-4 ${row}`}
    >
      {/* OMR bubble */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/70 bg-white font-serif text-[15px] font-semibold text-ink transition-colors group-hover:border-ink">
        {fill && (
          <span key={state} className={`ql-bubble-fill absolute inset-[3px] rounded-full ${fill}`} />
        )}
        <span className={`relative ${fill ? "text-white" : ""}`}>
          {state === "correct" ? <Check size={16} strokeWidth={3} /> : state === "wrong" ? <X size={16} strokeWidth={3} /> : letter}
        </span>
      </span>

      <span className="flex-1 font-serif text-[17px] leading-7 text-ink sm:text-lg">{text}</span>

      {shortcut && (
        <kbd className="hidden h-6 min-w-6 items-center justify-center rounded border border-rule bg-paper px-1.5 font-mono text-[11px] text-ink-soft lg:flex">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
