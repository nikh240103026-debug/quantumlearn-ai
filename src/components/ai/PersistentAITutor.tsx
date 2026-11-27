"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { ArrowUp, Atom, Check, Copy, Menu, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import { QuantumField } from "@/components/ai/QuantumField";
import { ReportAiReply } from "@/components/ai/ReportAiReply";

type TutorContext = {
  topic?: string;
  chapter?: number | string;
  lessonId?: string;
  lessonSlug?: string;
  source?: string;
  reason?: string;
  [key: string]: unknown;
};

type Conversation = {
  id: string;
  title: string;
  context_type?: string | null;
  context?: TutorContext | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  pending?: boolean;
};

type PersistentAITutorProps = {
  initialTopic?: string;
  initialContext?: TutorContext;
  className?: string;
};

const MAX_MESSAGE_LENGTH = 8000;

const STARTERS = [
  "Explain superposition as if I'm new to it",
  "Why does measuring a qubit change it?",
  "Walk me through the Bell state circuit",
  "Quiz me on single-qubit gates",
];

const shortTitle = (title: string | null | undefined) => {
  const cleaned = (title ?? "").trim() || "New conversation";
  return cleaned.length > 48 ? `${cleaned.slice(0, 45)}…` : cleaned;
};

const when = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

async function request(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new Error("Unable to reach the server. Check your connection and try again.");
  }
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (response.status === 401) throw new Error("Your session has ended. Please sign in again.");
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Something went wrong (${response.status}). Please try again.`);
  }
  return data;
}

function TutorMarkdown({ content }: { content: string }) {
  return (
    <div className="max-w-none break-words text-[15px] leading-7 text-white/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 mt-1 text-2xl font-semibold tracking-tight text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-6 text-lg font-semibold text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="mb-2 mt-5 font-semibold text-white">{children}</h4>,
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1.5 marker:text-blue-400">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1.5 marker:text-blue-400">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="my-5 rounded-xl bg-blue-500/10 px-4 py-3 text-blue-50/90">{children}</blockquote>,
          hr: () => <div aria-hidden="true" className="my-6" />,
          a: ({ href, children }) =>
            // Pages of this site open here; other sites in a new tab.
            href?.startsWith("/") && !href.startsWith("//") ? (
              <Link href={href} className="font-medium text-blue-300 underline underline-offset-2 hover:text-blue-200">
                {children}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-300 underline underline-offset-2 hover:text-blue-200">
                {children}
              </a>
            ),
          code: ({ className, children }) =>
            className ? (
              <code className="block whitespace-pre font-mono text-[13px] leading-6">{children}</code>
            ) : (
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-blue-100">{children}</code>
            ),
          pre: ({ children }) => <pre className="my-5 overflow-x-auto rounded-xl bg-[#03050a] p-4 text-sm leading-6 text-slate-100">{children}</pre>,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl bg-white/[.03]">
              <table className="w-full min-w-[480px] text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[.06]">{children}</thead>,
          tr: ({ children }) => <tr className="even:bg-white/[.03]">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-white">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-left text-white/75">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function Avatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-900/40">
      <Atom size={16} />
    </div>
  );
}

function SmallButton({ onClick, label, disabled, children }: { onClick: () => void; label: string; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function PersistentAITutor({ initialTopic, initialContext = {}, className = "" }: PersistentAITutorProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedRef = useRef<string | null>(null);
  const loadRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const pendingRef = useRef(0);

  const context = useMemo<TutorContext>(
    () => ({ ...initialContext, ...(initialTopic ? { topic: initialTopic } : {}) }),
    [initialContext, initialTopic],
  );
  const selected = conversations.find((item) => item.id === selectedId) ?? null;
  const shown = messages.filter((message) => message.role !== "system");
  const filtered = query.trim()
    ? conversations.filter((item) => (item.title ?? "").toLowerCase().includes(query.trim().toLowerCase()))
    : conversations;

  // Only the history and the messages scroll, never the page behind.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    request("/api/ai-tutor/conversations")
      .then((data) => setConversations(Array.isArray(data.conversations) ? (data.conversations as Conversation[]) : []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingList(false));
    textareaRef.current?.focus();
  }, []);

  // The box grows with the text, up to a limit.
  useLayoutEffect(() => {
    const box = textareaRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${Math.min(box.scrollHeight, 220)}px`;
  }, [input]);

  // Follow new messages unless the learner has scrolled up to read.
  useEffect(() => {
    const box = scrollRef.current;
    if (box && stickRef.current) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const focusComposer = () => window.setTimeout(() => textareaRef.current?.focus(), 0);

  const choose = useCallback(async (id: string | null) => {
    const ticket = ++loadRef.current;
    selectedRef.current = id;
    setSelectedId(id);
    setDrawerOpen(false);
    setEditing(false);
    setError(null);
    setMessages([]);
    stickRef.current = true;
    if (!id) {
      setLoadingMessages(false);
      setInput("");
      focusComposer();
      return;
    }
    setLoadingMessages(true);
    try {
      const data = await request(`/api/ai-tutor/conversations/${id}`);
      if (ticket !== loadRef.current) return;
      setMessages(Array.isArray(data.messages) ? (data.messages as Message[]) : []);
      window.requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    } catch (err) {
      if (ticket === loadRef.current) setError(err instanceof Error ? err.message : "Unable to load this conversation.");
    } finally {
      if (ticket === loadRef.current) setLoadingMessages(false);
    }
  }, []);

  async function send(text = input) {
    const content = text.trim();
    if (!content || sending) return;
    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    const startedIn = selectedRef.current;
    const ticket = loadRef.current;
    const temporaryId = `pending-${++pendingRef.current}`;
    setError(null);
    setSending(true);
    setEditing(false);
    setInput("");
    stickRef.current = true;
    setMessages((previous) => [...previous, { id: temporaryId, role: "user", content, pending: true }]);

    try {
      // Without an id, the server starts a conversation named after this message.
      const data = await request("/api/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: startedIn,
          message: content,
          contextType: selected?.context_type ?? (initialTopic ? "topic" : "general"),
          context,
        }),
      });

      const conversation = data.conversation as Conversation | undefined;
      const reply = data.assistantMessage as Message | undefined;
      if (!conversation?.id || typeof reply?.content !== "string") {
        throw new Error("The tutor's answer came back in an unexpected form. Please try again.");
      }

      const now = new Date().toISOString();
      setConversations((previous) => {
        const known = previous.find((item) => item.id === conversation.id);
        return [{ ...known, ...conversation, created_at: known?.created_at ?? conversation.created_at ?? now, updated_at: now }, ...previous.filter((item) => item.id !== conversation.id)];
      });

      // Only if the learner is still looking at this chat.
      if (loadRef.current === ticket && selectedRef.current === startedIn) {
        selectedRef.current = conversation.id;
        setSelectedId(conversation.id);
        const saved = data.userMessage as Message | undefined;
        setMessages((previous) => [
          ...previous.map((message) =>
            message.id === temporaryId ? { ...(saved?.id ? saved : message), role: "user" as const, pending: false } : message,
          ),
          { ...reply, role: "assistant" },
        ]);
      }
    } catch (err) {
      if (loadRef.current === ticket) {
        setMessages((previous) => previous.filter((message) => message.id !== temporaryId));
        // Give the text back so nothing typed is lost.
        setInput((current) => current || content);
      }
      setError(err instanceof Error ? err.message : "Unable to send your message.");
    } finally {
      setSending(false);
      focusComposer();
    }
  }

  async function remove(conversation: Conversation) {
    if (deletingId || !window.confirm(`Delete "${shortTitle(conversation.title)}" and all its messages?`)) return;
    setDeletingId(conversation.id);
    setError(null);
    try {
      await request(`/api/ai-tutor/conversations/${conversation.id}`, { method: "DELETE" });
      setConversations((previous) => previous.filter((item) => item.id !== conversation.id));
      if (selectedRef.current === conversation.id) void choose(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this conversation.");
    } finally {
      setDeletingId(null);
    }
  }

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
    } catch {
      setError("Copying isn't allowed in this browser. Select the text and copy it instead.");
    }
  }

  function edit(message: Message) {
    setInput(message.content);
    setEditing(true);
    window.setTimeout(() => {
      const box = textareaRef.current;
      box?.focus();
      box?.setSelectionRange(box.value.length, box.value.length);
    }, 0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" && editing) {
      setEditing(false);
      setInput("");
    } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  const history = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Tutor</p>
            <p className="truncate text-[11px] text-white/60">Quantum computing help</p>
          </div>
        </div>
        <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close history" className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 md:hidden">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-2 px-3">
        <button
          type="button"
          onClick={() => void choose(null)}
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-50"
        >
          <Plus size={16} /> New chat
        </button>
        <label className="flex items-center gap-2 rounded-xl bg-white/[.05] px-3 py-2 text-white/60 focus-within:bg-white/[.09]">
          <Search size={14} className="shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
          />
        </label>
      </div>
      <p className="px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/50">Your chats</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loadingList ? (
          [1, 2, 3, 4].map((item) => <div key={item} className="mx-1 mb-1.5 h-11 animate-pulse rounded-xl bg-white/[.04]" />)
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs leading-5 text-white/55">{query ? "No chats match." : "Your chats will appear here."}</p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((conversation) => {
              const active = conversation.id === selectedId;
              return (
                <li key={conversation.id} className={`group relative rounded-xl transition ${active ? "bg-blue-500/15" : "hover:bg-white/[.05]"}`}>
                  <button
                    type="button"
                    onClick={() => void choose(conversation.id)}
                    disabled={deletingId === conversation.id}
                    aria-current={active ? "true" : undefined}
                    className="w-full px-3 py-2.5 pr-10 text-left disabled:opacity-50"
                  >
                    <span className={`block truncate text-[13px] ${active ? "font-semibold text-white" : "text-white/80"}`}>{shortTitle(conversation.title)}</span>
                    <span className="block text-[11px] text-white/45">{when(conversation.updated_at)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(conversation)}
                    disabled={deletingId === conversation.id}
                    aria-label={`Delete ${shortTitle(conversation.title)}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 transition hover:bg-red-500/15 hover:text-red-300 md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-x-0 bottom-0 top-[73px] z-40 flex min-h-0 overflow-hidden bg-[#05070d] text-white ${className}`}>
      <aside className="hidden w-[272px] shrink-0 bg-[#090c15] md:block">{history}</aside>

      {drawerOpen && (
        <div className="absolute inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Chat history">
          <button type="button" aria-label="Close history" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-[#090c15] shadow-2xl">{history}</div>
        </div>
      )}

      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${shown.length || loadingMessages ? "opacity-25" : "opacity-100"}`}>
          <QuantumField />
        </div>

        <header className="relative flex h-14 shrink-0 items-center gap-2 px-3 sm:px-5">
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open chat history" className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 md:hidden">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{selected ? shortTitle(selected.title) : "New chat"}</h1>
            {initialTopic && <p className="truncate text-[11px] text-blue-300">Topic: {initialTopic}</p>}
          </div>
          {selectedId && (
            <button type="button" onClick={() => void choose(null)} disabled={sending} className="flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1.5 text-xs font-medium transition hover:bg-white/[.14] disabled:opacity-50">
              <Plus size={14} /> New chat
            </button>
          )}
        </header>

        {error && (
          <div role="alert" className="relative mx-auto mt-1 flex w-[calc(100%-2rem)] max-w-3xl items-start justify-between gap-3 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-100">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss" className="shrink-0 rounded p-0.5 text-red-200 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={(event) => {
            const box = event.currentTarget;
            stickRef.current = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
          }}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {loadingMessages ? (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8" aria-busy="true">
              {[0.9, 0.6, 0.8].map((width, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/[.05]" style={{ width: `${width * 100}%`, marginLeft: index === 1 ? "auto" : 0 }} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-end px-5 pb-6 pt-[46vh] text-center sm:pt-[44vh]">
              <h2 className="bg-gradient-to-r from-blue-200 via-white to-violet-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                What shall we explore?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
                {initialTopic
                  ? `Ask anything about ${initialTopic}: an explanation, an example, a quiz or a study plan.`
                  : "Ask about qubits, gates, circuits, algorithms or anything in your lessons."}
              </p>
              <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {(initialTopic
                  ? [`Explain ${initialTopic} simply`, `Give me an example of ${initialTopic}`, `Quiz me on ${initialTopic}`, `Common mistakes with ${initialTopic}`]
                  : STARTERS
                ).map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void send(starter)}
                    disabled={sending}
                    className="rounded-2xl bg-white/[.06] px-4 py-3 text-left text-sm text-white/85 backdrop-blur transition hover:bg-blue-500/20 hover:text-white disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="mx-auto max-w-3xl space-y-6 px-4 pb-6 pt-4 sm:px-6" aria-label="Conversation">
              {shown.map((message, index) => {
                const key = message.id ?? `${message.role}-${index}`;
                return message.role === "user" ? (
                  <li key={key} className="group flex flex-col items-end">
                    <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-3 text-[15px] leading-7 shadow-lg shadow-blue-950/40 ${message.pending ? "opacity-70" : ""}`}>
                      {message.content}
                    </div>
                    {!message.pending && (
                      <div className="mt-1 flex gap-1 md:opacity-0 md:transition md:focus-within:opacity-100 md:group-hover:opacity-100">
                        <SmallButton onClick={() => void copy(key, message.content)} label="Copy message">
                          {copied === key ? <Check size={13} /> : <Copy size={13} />} {copied === key ? "Copied" : "Copy"}
                        </SmallButton>
                        <SmallButton onClick={() => edit(message)} label="Edit and send again" disabled={sending}>
                          <Pencil size={13} /> Edit
                        </SmallButton>
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={key} className="flex gap-3">
                    <Avatar />
                    <div className="min-w-0 flex-1 rounded-3xl rounded-tl-lg bg-[#0c111d]/85 px-5 py-4 backdrop-blur-md">
                      <TutorMarkdown content={message.content} />
                      <div className="mt-2 flex flex-wrap items-center gap-x-3">
                        <SmallButton onClick={() => void copy(key, message.content)} label="Copy answer">
                          {copied === key ? <Check size={13} /> : <Copy size={13} />} {copied === key ? "Copied" : "Copy"}
                        </SmallButton>
                        <ReportAiReply content={message.content} page="AI Tutor" />
                      </div>
                    </div>
                  </li>
                );
              })}
              {sending && (
                <li className="flex items-center gap-3" role="status">
                  <Avatar />
                  <div className="flex items-center gap-2 rounded-full bg-[#0c111d]/85 px-4 py-2.5 text-sm text-blue-200">
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                    </span>
                    Thinking
                  </div>
                </li>
              )}
            </ol>
          )}
        </div>

        <div className="relative shrink-0 px-3 pb-4 pt-2 sm:px-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            className="mx-auto max-w-3xl"
          >
            {editing && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
                <span className="flex items-center gap-2"><Pencil size={13} /> Editing. Sending asks it as a new message.</span>
                <button type="button" onClick={() => { setEditing(false); setInput(""); }} className="rounded-md px-2 py-1 font-semibold hover:bg-white/10">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-3xl bg-[#111726]/95 p-2 pl-4 shadow-2xl shadow-black/50 backdrop-blur transition focus-within:bg-[#151d31] focus-within:shadow-blue-900/50">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                aria-label="Message the AI Tutor"
                placeholder={editing ? "Edit your question…" : "Ask about anything quantum…"}
                className="max-h-[220px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-white outline-none placeholder:text-white/50"
                style={{ outline: "none" }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 transition hover:brightness-110 disabled:from-white/10 disabled:to-white/10 disabled:text-white/40"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-white/50">
            {input.length > MAX_MESSAGE_LENGTH - 1000
              ? `${input.length} / ${MAX_MESSAGE_LENGTH} characters`
              : "Enter to send · Shift + Enter for a new line · The tutor can make mistakes"}
          </p>
        </div>
      </section>
    </div>
  );
}
