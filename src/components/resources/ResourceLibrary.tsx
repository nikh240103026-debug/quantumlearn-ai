"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Code2,
  ExternalLink,
  FileImage,
  FileText,
  FlaskConical,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  X,
} from "lucide-react";
import { SpotlightGroup } from "@/components/fx/SpotlightGroup";

type ResourceType =
  | "research_paper"
  | "learning_material"
  | "technical_reference"
  | "innovation_update"
  | "document"
  | "external_reference";

type Difficulty = "beginner" | "intermediate" | "advanced";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  topic: string | null;
  chapter: number | null;
  difficulty: Difficulty | null;
  resource_url: string | null;
  file_url: string | null;
  author: string | null;
  source_name: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  is_published: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

type SortKey = "newest" | "title" | "level";

const TYPE_META: Record<ResourceType, { label: string; short: string; icon: typeof FileText; tone: string }> = {
  research_paper: { label: "Research papers", short: "Paper", icon: FileText, tone: "border-blue-400/30 bg-blue-500/10 text-blue-200" },
  learning_material: { label: "Learning material", short: "Lesson", icon: BookOpen, tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" },
  technical_reference: { label: "Technical reference", short: "Reference", icon: Code2, tone: "border-slate-400/30 bg-slate-500/10 text-slate-200" },
  innovation_update: { label: "Innovation updates", short: "Update", icon: FlaskConical, tone: "border-violet-400/30 bg-violet-500/10 text-violet-200" },
  document: { label: "Documents", short: "Document", icon: FileText, tone: "border-amber-400/30 bg-amber-500/10 text-amber-200" },
  external_reference: { label: "External links", short: "Link", icon: ArrowUpRight, tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200" },
};

const DIFFICULTY_META: Record<Difficulty, { label: string; level: 1 | 2 | 3 }> = {
  beginner: { label: "Beginner", level: 1 },
  intermediate: { label: "Intermediate", level: 2 },
  advanced: { label: "Advanced", level: 3 },
};

const VIEW_KEY = "ql-resources-view";

function cleanUrl(url: string | null) {
  return url ? url.split("?")[0].toLowerCase() : "";
}

function isLikelyImageUrl(url: string | null) {
  return /\.(jpe?g|png|gif|webp|svg|avif)$/.test(cleanUrl(url));
}

function isLikelyPdfUrl(url: string | null) {
  return cleanUrl(url).endsWith(".pdf");
}

function fileActionLabel(resource: Resource) {
  if (isLikelyImageUrl(resource.file_url)) return "View image";
  if (isLikelyPdfUrl(resource.file_url)) return "Open PDF";
  return "Open document";
}

function tutorUrlFor(resource: Resource) {
  const reason = `Help me understand this resource: "${resource.title}"${
    resource.topic ? `, related to ${resource.topic}` : ""
  }. Explain the important concepts, prerequisites, and how it connects to quantum computing.`;
  return `/ai-tutor?source=resource&topic=${encodeURIComponent(resource.topic || resource.title)}&reason=${encodeURIComponent(reason)}`;
}

export function ResourceLibrary({ query }: { query?: string } = {}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  // The vault hero owns the search box and passes `query` in.
  const search = query ?? "";
  const [typeFilter, setTypeFilter] = useState<"all" | ResourceType>("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | Difficulty>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [savingId, setSavingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_KEY);
      if (stored === "grid" || stored === "list") setView(stored);
    } catch {
      // storage unavailable: keep default
    }
  }, []);

  function changeView(next: "grid" | "list") {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/resources", { method: "GET", cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            if (!cancelled) setNeedsLogin(true);
            return;
          }
          throw new Error(data?.error || "Unable to load resources right now.");
        }

        if (!cancelled) {
          setResources(Array.isArray(data?.resources) ? data.resources : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load resources right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const chapters = useMemo(
    () =>
      Array.from(new Set(resources.map((r) => r.chapter).filter((c): c is number => c !== null))).sort(
        (a, b) => a - b,
      ),
    [resources],
  );

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<ResourceType, number>> = {};
    for (const resource of resources) {
      counts[resource.resource_type] = (counts[resource.resource_type] ?? 0) + 1;
    }
    return counts;
  }, [resources]);

  const savedCount = useMemo(() => resources.filter((r) => r.is_saved).length, [resources]);

  const filteredResources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = resources.filter((resource) => {
      if (typeFilter !== "all" && resource.resource_type !== typeFilter) return false;
      if (chapterFilter !== "all" && String(resource.chapter) !== chapterFilter) return false;
      if (difficultyFilter !== "all" && resource.difficulty !== difficultyFilter) return false;
      if (savedOnly && !resource.is_saved) return false;

      if (normalizedSearch) {
        const searchableText = [
          resource.title,
          resource.description,
          resource.topic,
          resource.author,
          resource.source_name,
          ...(resource.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) return false;
      }

      return true;
    });

    const levelRank = (d: Difficulty | null) => (d ? DIFFICULTY_META[d].level : 9);

    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "level") return levelRank(a.difficulty) - levelRank(b.difficulty) || a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [resources, search, typeFilter, chapterFilter, difficultyFilter, savedOnly, sort]);

  const toggleSave = useCallback(
    async (resource: Resource) => {
      if (savingId) return;

      const nextSavedState = !resource.is_saved;

      try {
        setSavingId(resource.id);

        const response = await fetch("/api/resources/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: resource.id, saved: nextSavedState }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Unable to update bookmark.");
        }

        setResources((current) =>
          current.map((item) => (item.id === resource.id ? { ...item, is_saved: nextSavedState } : item)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update bookmark.");
      } finally {
        setSavingId(null);
      }
    },
    [savingId],
  );

  function clearFilters() {
    setTypeFilter("all");
    setChapterFilter("all");
    setDifficultyFilter("all");
    setSavedOnly(false);
  }

  const hasActiveFilters = typeFilter !== "all" || chapterFilter !== "all" || difficultyFilter !== "all" || savedOnly;

  const openResource = resources.find((r) => r.id === openId) ?? null;

  // ------------------------------------------------------------------
  // Signed-out
  // ------------------------------------------------------------------
  if (needsLogin) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/15 via-[#0a0e18] to-violet-600/15 p-8 text-center sm:p-12">
        <div className="ql-dots-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-blue-200 shadow-[0_0_40px_-8px_rgba(59,130,246,0.9)]">
            <Lock size={22} />
          </span>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Unlock the instructor library</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
            Sign in to browse papers, documents and references published by the QuantumLearn team — and
            bookmark the ones you want to come back to.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/login"
              className="ql-shine inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <LogIn size={16} />
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 hover:border-white/30 hover:text-white"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      active ? "border-blue-400/60 bg-blue-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
    }`;

  const selectClass =
    "h-9 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-white/80 outline-none focus:border-blue-400/60 [&>option]:bg-[#0a0e18]";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={typeFilter === "all" && !savedOnly}
            onClick={() => {
              setTypeFilter("all");
              setSavedOnly(false);
            }}
            className={chip(typeFilter === "all" && !savedOnly)}
          >
            All <span className="ml-1 font-mono text-white/35">{resources.length}</span>
          </button>
          {(Object.keys(TYPE_META) as ResourceType[])
            .filter((type) => typeCounts[type])
            .map((type) => (
              <button key={type} type="button" aria-pressed={typeFilter === type} onClick={() => setTypeFilter(type)} className={chip(typeFilter === type)}>
                {TYPE_META[type].label}
                <span className="ml-1 font-mono text-white/35">{typeCounts[type]}</span>
              </button>
            ))}
          <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((value) => !value)} className={`${chip(savedOnly)} inline-flex items-center gap-1.5`}>
            <Bookmark size={12} className={savedOnly ? "fill-current" : ""} />
            Saved <span className="font-mono text-white/35">{savedCount}</span>
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <select aria-label="Level" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as "all" | Difficulty)} className={selectClass}>
            <option value="all">Any level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {chapters.length > 0 && (
            <select aria-label="Chapter" value={chapterFilter} onChange={(event) => setChapterFilter(event.target.value)} className={selectClass}>
              <option value="all">All chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter} value={String(chapter)}>
                  Chapter {chapter}
                </option>
              ))}
            </select>
          )}
          <select aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className={selectClass}>
            <option value="newest">Newest</option>
            <option value="title">A–Z</option>
            <option value="level">Easiest first</option>
          </select>
          <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5" role="group" aria-label="View">
            <button type="button" aria-pressed={view === "grid"} onClick={() => changeView("grid")} aria-label="Grid view" className={`rounded-md p-1.5 ${view === "grid" ? "bg-white/15 text-white" : "text-white/45 hover:text-white"}`}>
              <LayoutGrid size={14} />
            </button>
            <button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")} aria-label="List view" className={`rounded-md p-1.5 ${view === "list" ? "bg-white/15 text-white" : "text-white/45 hover:text-white"}`}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
          <button type="button" onClick={() => setError("")} aria-label="Dismiss" className="shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={`animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03] ${view === "grid" ? "h-56" : "h-20"}`} />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
            <BookOpen size={26} className="mx-auto text-white/35" />
            <p className="mt-4 text-lg font-semibold text-white">
              {resources.length === 0 ? "The instructors haven't published anything yet." : "Nothing here matches."}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-white/45">
              {resources.length === 0
                ? "Explore the curated collection above in the meantime."
                : "Try another search term or loosen a filter."}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white">
                Clear filters
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <SpotlightGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <LibraryCard
                key={resource.id}
                resource={resource}
                saving={savingId === resource.id}
                onOpen={() => setOpenId(resource.id)}
                onToggleSave={() => void toggleSave(resource)}
              />
            ))}
          </SpotlightGroup>
        ) : (
          <ol className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18]">
            {filteredResources.map((resource) => (
              <LibraryRow
                key={resource.id}
                resource={resource}
                saving={savingId === resource.id}
                onOpen={() => setOpenId(resource.id)}
                onToggleSave={() => void toggleSave(resource)}
              />
            ))}
          </ol>
        )}
      </div>

      {openResource && (
        <ReadingPane
          resource={openResource}
          saving={savingId === openResource.id}
          onClose={() => setOpenId(null)}
          onToggleSave={() => void toggleSave(openResource)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function SaveButton({ saved, saving, onClick }: { saved: boolean; saving: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={saving}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark this resource"}
      title={saved ? "Remove bookmark" : "Bookmark"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-60 ${
        saved ? "border-amber-300/40 bg-amber-400/15 text-amber-200" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white"
      }`}
    >
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={14} className={saved ? "fill-current" : ""} />}
    </button>
  );
}

function LevelBars({ difficulty }: { difficulty: Difficulty | null }) {
  if (!difficulty) return null;
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={`w-[3px] rounded-sm ${bar <= meta.level ? "bg-blue-300" : "bg-white/15"}`} style={{ height: `${3 + bar * 3}px` }} />
        ))}
      </span>
      {meta.label}
    </span>
  );
}

function LibraryCard({
  resource,
  saving,
  onOpen,
  onToggleSave,
}: {
  resource: Resource;
  saving: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const meta = TYPE_META[resource.resource_type] ?? TYPE_META.document;
  const Icon = meta.icon;
  const image = isLikelyImageUrl(resource.file_url) ? resource.file_url : null;

  return (
    <article className="ql-spotlight group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18] transition-colors hover:border-white/20">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-36 w-full border-b border-white/10 object-cover opacity-90" />
      )}
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${meta.tone}`}>
          <Icon size={12} />
          {meta.short}
        </span>
        <SaveButton saved={resource.is_saved} saving={saving} onClick={onToggleSave} />
      </div>
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col px-5 pb-5 pt-3 text-left">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white">{resource.title}</h3>
        {(resource.author || resource.source_name) && (
          <p className="mt-1 truncate text-xs text-white/45">{[resource.author, resource.source_name].filter(Boolean).join(" · ")}</p>
        )}
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
          {resource.description || "A curated resource for developing deeper knowledge of quantum computing."}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[11px] text-white/45">
          <LevelBars difficulty={resource.difficulty} />
          {resource.chapter !== null && <span className="font-mono">CH{String(resource.chapter).padStart(2, "0")}</span>}
          {resource.topic && <span>{resource.topic}</span>}
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-xs">
        <span className="font-mono text-white/35">
          {resource.file_url ? (isLikelyPdfUrl(resource.file_url) ? "PDF" : isLikelyImageUrl(resource.file_url) ? "IMAGE" : "FILE") : resource.resource_url ? "WEB" : "—"}
        </span>
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-1 font-semibold text-white/80 hover:text-white">
          Details <ArrowUpRight size={13} />
        </button>
      </div>
    </article>
  );
}

function LibraryRow({
  resource,
  saving,
  onOpen,
  onToggleSave,
}: {
  resource: Resource;
  saving: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const meta = TYPE_META[resource.resource_type] ?? TYPE_META.document;
  return (
    <li className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="font-semibold text-white">{resource.title}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-white/50">{resource.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
          <span className={`rounded-md border px-1.5 py-0.5 font-semibold ${meta.tone}`}>{meta.short}</span>
          <LevelBars difficulty={resource.difficulty} />
          {resource.topic && <span>{resource.topic}</span>}
        </div>
      </button>
      <SaveButton saved={resource.is_saved} saving={saving} onClick={onToggleSave} />
    </li>
  );
}

function ReadingPane({
  resource,
  saving,
  onClose,
  onToggleSave,
}: {
  resource: Resource;
  saving: boolean;
  onClose: () => void;
  onToggleSave: () => void;
}) {
  const meta = TYPE_META[resource.resource_type] ?? TYPE_META.document;
  const Icon = meta.icon;
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = isLikelyImageUrl(resource.file_url) ? resource.file_url : null;
  const added = new Date(resource.created_at);

  useEffect(() => {
    closeRef.current?.focus();
  }, [resource.id]);

  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={resource.title}
        className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#080b14] text-white shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.8)] [animation:ql-sheet-in_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Resource</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={resource.title} className="max-h-72 w-full border-b border-white/10 object-cover" />
          )}
          <div className="px-6 py-7">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${meta.tone}`}>
              <Icon size={12} />
              {meta.label}
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">{resource.title}</h2>
            {(resource.author || resource.source_name) && (
              <p className="mt-2 text-sm text-white/50">{[resource.author, resource.source_name].filter(Boolean).join(" · ")}</p>
            )}
            <p className="mt-6 text-[15px] leading-7 text-white/70">
              {resource.description || "A curated resource for developing deeper knowledge of quantum computing."}
            </p>

            <dl className="mt-7 divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm">
              {resource.topic && <PaneRow label="Topic" value={resource.topic} />}
              {resource.chapter !== null && <PaneRow label="Chapter" value={`Chapter ${resource.chapter}`} />}
              {resource.difficulty && <PaneRow label="Level" value={<LevelBars difficulty={resource.difficulty} />} />}
              {!Number.isNaN(added.getTime()) && <PaneRow label="Added" value={added.toLocaleDateString(undefined, { dateStyle: "medium" })} />}
            </dl>

            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[11px] text-white/60">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 p-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            {resource.file_url && (
              <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="ql-shine inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500">
                {isLikelyImageUrl(resource.file_url) ? <FileImage size={15} /> : <FileText size={15} />}
                {fileActionLabel(resource)}
              </a>
            )}
            {resource.resource_url && (
              <a
                href={resource.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                  resource.file_url ? "border border-white/15 text-white/85 hover:border-white/30" : "ql-shine bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <ExternalLink size={15} />
                Open resource
              </a>
            )}
            {!resource.file_url && !resource.resource_url && (
              <span className="flex-1 rounded-lg bg-white/[0.04] px-4 py-3 text-center text-sm text-white/45">No link available yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={tutorUrlFor(resource)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 hover:border-violet-400/60"
            >
              <Sparkles size={15} />
              Ask the AI tutor about it
            </Link>
            <button
              type="button"
              onClick={onToggleSave}
              disabled={saving}
              aria-pressed={resource.is_saved}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${
                resource.is_saved ? "border-amber-300/40 bg-amber-400/15 text-amber-200" : "border-white/15 text-white/80 hover:border-white/30"
              }`}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Bookmark size={15} className={resource.is_saved ? "fill-current" : ""} />}
              {resource.is_saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PaneRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</dt>
      <dd className="text-right text-white/85">{value}</dd>
    </div>
  );
}
