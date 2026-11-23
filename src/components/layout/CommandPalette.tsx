"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ClipboardCheck,
  Code2,
  CornerDownLeft,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Library,
  Mail,
  Map,
  MessagesSquare,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Terminal,
  Trophy,
  Award,
  SearchCheck,
} from "lucide-react";

export const OPEN_COMMAND_PALETTE_EVENT = "ql:open-command-palette";

/** Call from any button to open the palette. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}

type Command = {
  label: string;
  href: string;
  group: string;
  icon: React.ElementType;
  keywords?: string;
};

const COMMANDS: Command[] = [
  { group: "Learn", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home progress overview" },
  { group: "Learn", label: "Learning Roadmap", href: "/roadmap", icon: Map, keywords: "curriculum chapters path" },
  { group: "Learn", label: "AI Tutor", href: "/ai-tutor", icon: Bot, keywords: "chat ask explain gemini" },
  { group: "Learn", label: "Resources", href: "/resources", icon: Library, keywords: "papers books links" },
  { group: "Learn", label: "Certificates", href: "/certificates", icon: Award, keywords: "certificate credential linkedin achievement completion" },
  { group: "Build", label: "Quantum Lab", href: "/quantum-lab", icon: FlaskConical, keywords: "circuit simulator gates bloch" },
  { group: "Build", label: "Coding Workspace", href: "/coding", icon: Code2, keywords: "editor qiskit python run" },
  { group: "Build", label: "SDK Tutorials", href: "/coding/tutorials", icon: GraduationCap, keywords: "qiskit pennylane cirq guide" },
  { group: "Build", label: "Coding Challenges", href: "/coding/challenges", icon: Trophy, keywords: "exercises problems" },
  { group: "Build", label: "AI Coding Assistant", href: "/coding/assistant", icon: Terminal, keywords: "debug code help" },
  { group: "Practice", label: "Practice", href: "/practice", icon: Target, keywords: "quiz questions" },
  { group: "Practice", label: "Assessments", href: "/practice/assessment", icon: ClipboardCheck, keywords: "test exam timed" },
  { group: "Community", label: "Community Q&A", href: "/questions", icon: MessagesSquare, keywords: "forum ask answer" },
  { group: "Account", label: "Settings", href: "/settings", icon: Settings, keywords: "profile privacy password delete" },
  { group: "Company", label: "About", href: "/about", icon: BookOpen },
  { group: "Company", label: "Help Center", href: "/help", icon: HelpCircle, keywords: "support faq" },
  { group: "Company", label: "Contact", href: "/contact", icon: Mail, keywords: "email support" },
  { group: "Company", label: "Privacy Policy", href: "/privacy", icon: FileText, keywords: "legal data cookies" },
  { group: "Company", label: "Terms of Service", href: "/terms", icon: FileText, keywords: "legal" },
  { group: "Company", label: "Security", href: "/security", icon: ShieldCheck, keywords: "vulnerability report" },
  { group: "Company", label: "Verify a certificate", href: "/verify", icon: SearchCheck, keywords: "check certificate number genuine employer" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return COMMANDS;
    return COMMANDS.filter((command) => {
      const haystack = `${command.label} ${command.group} ${command.keywords ?? ""} ${command.href}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [query]);

  const show = useCallback(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setCursor(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    restoreFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (!value) {
            restoreFocus.current = document.activeElement as HTMLElement | null;
            setQuery("");
            setCursor(0);
          }
          return !value;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function go(command: Command | undefined) {
    if (!command) return;
    setOpen(false);
    router.push(command.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[cursor]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#05070d]/60 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages"
        className="ql-palette-in w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d111c]/95 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={17} className="shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages, tools and settings…"
            aria-label="Search"
            aria-controls="ql-command-results"
            aria-activedescendant={results[cursor] ? `ql-cmd-${cursor}` : undefined}
            className="h-14 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
          />
          <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/45 sm:block">
            ESC
          </kbd>
        </div>

        <ul id="ql-command-results" ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-white/40">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {results.map((command, index) => {
            const Icon = command.icon;
            const header =
              index === 0 || results[index - 1].group !== command.group
                ? command.group
                : null;
            const active = index === cursor;
            return (
              <li key={command.href} role="presentation">
                {header && (
                  <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {header}
                  </p>
                )}
                <button
                  id={`ql-cmd-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-index={index}
                  onMouseMove={() => setCursor(index)}
                  onClick={() => go(command)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-blue-500/15 text-white" : "text-white/70"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                      active ? "border-blue-400/40 bg-blue-500/20 text-blue-200" : "border-white/10 bg-white/[0.03] text-white/50"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="flex-1">{command.label}</span>
                  <span className="font-mono text-[11px] text-white/25">{command.href}</span>
                  {active && <ArrowRight size={14} className="text-blue-300" />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[10px] text-white/35">
          <span className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span className="flex items-center gap-1">
              <CornerDownLeft size={10} /> open
            </span>
          </span>
          <span>QuantumLearn</span>
        </div>
      </div>
    </div>
  );
}
