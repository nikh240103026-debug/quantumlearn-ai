"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Clock3,
  Copy,
  FileCode2,
  History,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  addCodeHistory,
  clearCodeHistory,
  clearSavedCode,
  deleteHistoryItem,
  deleteSavedCode,
  getCodeHistory,
  getSavedCode,
  saveCode,
  type CodeHistoryItem,
  type SavedCode,
} from "@/lib/coding-storage";

type Tab = "saved" | "history";

export default function CodeHistory() {
  const [activeTab, setActiveTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<SavedCode[]>([]);
  const [history, setHistory] = useState<CodeHistoryItem[]>([]);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  const [selectedCode, setSelectedCode] = useState<{
    title: string;
    code: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSaved(getSavedCode());
    setHistory(getCodeHistory());
  }, []);

  const filteredSaved = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return saved;

    return saved.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
    );
  }, [saved, search]);

  const filteredHistory = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return history;

    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
    );
  }, [history, search]);

  function handleCreate() {
    if (!code.trim()) return;

    const item = saveCode(title, code, "Python");

    addCodeHistory(item.title, item.code, "saved", "Python");

    setSaved(getSavedCode());
    setHistory(getCodeHistory());

    setTitle("");
    setCode("");
    setShowCreate(false);
  }

  async function handleCopy(id: string, value: string) {
    await navigator.clipboard.writeText(value);

    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  }

  function handleDeleteSaved(id: string) {
    deleteSavedCode(id);
    setSaved(getSavedCode());
  }

  function handleDeleteHistory(id: string) {
    deleteHistoryItem(id);
    setHistory(getCodeHistory());
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="border-b border-white/10 bg-[#080d1d]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                <FileCode2 className="h-4 w-4" />
                Quantum Coding
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                My Code
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage your saved quantum programs and coding activity.
                Everything here is stored locally in your browser.
              </p>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-2 border border-blue-500 bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              New Program
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-3">
          <Stat
            icon={<BookOpen className="h-5 w-5" />}
            label="Saved Programs"
            value={saved.length}
          />

          <Stat
            icon={<History className="h-5 w-5" />}
            label="History Entries"
            value={history.length}
          />

          <Stat
            icon={<Clock3 className="h-5 w-5" />}
            label="Latest Activity"
            value={
              history.length
                ? formatDate(history[0].createdAt)
                : "No activity"
            }
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 border border-white/10 bg-[#080d1d] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex border border-white/10">
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === "saved"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Saved
              <span className="text-xs opacity-70">({saved.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 border-l border-white/10 px-5 py-3 text-sm font-semibold transition ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <History className="h-4 w-4" />
              History
              <span className="text-xs opacity-70">({history.length})</span>
            </button>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search programs..."
              className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        {activeTab === "saved" ? (
          <SavedSection
            items={filteredSaved}
            onOpen={(item) =>
              setSelectedCode({
                title: item.title,
                code: item.code,
              })
            }
            onCopy={handleCopy}
            copiedId={copiedId}
            onDelete={handleDeleteSaved}
            onCreate={() => setShowCreate(true)}
          />
        ) : (
          <HistorySection
            items={filteredHistory}
            onOpen={(item) =>
              setSelectedCode({
                title: item.title,
                code: item.code,
              })
            }
            onCopy={handleCopy}
            copiedId={copiedId}
            onDelete={handleDeleteHistory}
            onClear={() => {
              clearCodeHistory();
              setHistory([]);
            }}
          />
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-3xl border border-white/10 bg-[#080d1d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="font-semibold">Create Quantum Program</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Save a Python/Qiskit program to your local workspace.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="p-2 text-slate-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Program Name
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Bell State Experiment"
                  className="w-full border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Python Code
                </label>

                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  placeholder={`from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

print(qc)`}
                  className="min-h-[320px] w-full resize-y border border-white/10 bg-[#030610] p-4 font-mono text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-700 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  disabled={!code.trim()}
                  className="bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-5xl border border-white/10 bg-[#080d1d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="font-semibold">{selectedCode.title}</h2>
                <p className="mt-1 text-xs text-slate-500">Python</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy("viewer", selectedCode.code)
                  }
                  className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  {copiedId === "viewer" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedCode(null)}
                  className="p-2 text-slate-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <pre className="max-h-[70vh] overflow-auto bg-[#030610] p-6 font-mono text-sm leading-7 text-slate-300">
              <code>{selectedCode.code}</code>
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#080d1d] p-5">
      <div className="mb-3 flex items-center gap-2 text-blue-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function SavedSection({
  items,
  onOpen,
  onCopy,
  copiedId,
  onDelete,
  onCreate,
}: {
  items: SavedCode[];
  onOpen: (item: SavedCode) => void;
  onCopy: (id: string, code: string) => void;
  copiedId: string | null;
  onDelete: (id: string) => void;
  onCreate: () => void;
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="No saved programs"
        description="Create your first quantum program and keep it in your local coding workspace."
        buttonLabel="Create Program"
        onClick={onCreate}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-white/10 bg-[#080d1d] transition hover:border-blue-500/40"
        >
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <button
              onClick={() => onOpen(item)}
              className="min-w-0 text-left"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                  <FileCode2 className="h-4 w-4" />
                </div>

                <h3 className="truncate font-semibold text-white">
                  {item.title}
                </h3>
              </div>

              <p className="font-mono text-xs text-slate-500">
                {item.code.split("\n")[0]?.slice(0, 100)}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Updated {new Date(item.updatedAt).toLocaleString()}
              </p>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => onCopy(item.id, item.code)}
                className="border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Copy code"
              >
                {copiedId === item.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="border border-red-500/20 p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                title="Delete program"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySection({
  items,
  onOpen,
  onCopy,
  copiedId,
  onDelete,
  onClear,
}: {
  items: CodeHistoryItem[];
  onOpen: (item: CodeHistoryItem) => void;
  onCopy: (id: string, code: string) => void;
  copiedId: string | null;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="No coding history"
        description="Your saved-program activity will appear here."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={onClear}
          className="flex items-center gap-2 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 border border-white/10 bg-[#080d1d] p-4 md:flex-row md:items-center md:justify-between"
          >
            <button
              onClick={() => onOpen(item)}
              className="min-w-0 text-left"
            >
              <div className="flex items-center gap-3">
                <History className="h-4 w-4 shrink-0 text-blue-400" />

                <span className="truncate text-sm font-semibold text-white">
                  {item.title}
                </span>

                <span
                  className={`shrink-0 border px-2 py-1 text-[10px] font-bold uppercase ${
                    item.action === "saved"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {item.action}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                {formatHistoryDate(item.createdAt)}
              </p>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => onCopy(item.id, item.code)}
                className="border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                {copiedId === item.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="border border-red-500/20 p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div className="border border-dashed border-white/10 bg-[#080d1d] px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/10 bg-white/[0.02]">
        <FileCode2 className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="font-semibold text-white">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {buttonLabel && onClick && (
        <button
          onClick={onClick}
          className="mt-6 bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

function formatHistoryDate(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}