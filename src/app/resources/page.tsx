"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Code2,
  ExternalLink,
  FileImage,
  FileText,
  FlaskConical,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

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

const TYPE_LABELS: Record<ResourceType, string> = {
  research_paper: "Research Paper",
  learning_material: "Learning Material",
  technical_reference: "Technical Reference",
  innovation_update: "Innovation Update",
  document: "Document",
  external_reference: "External Reference",
};

const TYPE_ICONS: Record<ResourceType, typeof FileText> = {
  research_paper: FileText,
  learning_material: BookOpen,
  technical_reference: Code2,
  innovation_update: FlaskConical,
  document: FileText,
  external_reference: ArrowUpRight,
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function getDifficultyClasses(difficulty: Difficulty | null) {
  switch (difficulty) {
    case "beginner":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "intermediate":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "advanced":
      return "bg-purple-50 text-purple-700 border-purple-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getTypeIconClasses(type: ResourceType) {
  switch (type) {
    case "research_paper":
      return "bg-blue-50 text-blue-600";
    case "learning_material":
      return "bg-indigo-50 text-indigo-600";
    case "technical_reference":
      return "bg-slate-100 text-slate-700";
    case "innovation_update":
      return "bg-purple-50 text-purple-600";
    case "document":
      return "bg-amber-50 text-amber-600";
    case "external_reference":
      return "bg-cyan-50 text-cyan-600";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

function isLikelyImageUrl(url: string | null) {
  if (!url) return false;

  const cleanUrl = url.split("?")[0].toLowerCase();

  return (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".svg") ||
    cleanUrl.endsWith(".avif")
  );
}

function isLikelyPdfUrl(url: string | null) {
  if (!url) return false;

  const cleanUrl = url.split("?")[0].toLowerCase();

  return cleanUrl.endsWith(".pdf");
}

function getFileActionLabel(resource: Resource) {
  if (isLikelyImageUrl(resource.file_url)) {
    return "View Image";
  }

  if (isLikelyPdfUrl(resource.file_url)) {
    return "Open PDF";
  }

  return "Open Document";
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ResourceType>(
    "all"
  );
  const [topicFilter, setTopicFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | Difficulty
  >("all");
  const [savedOnly, setSavedOnly] = useState(false);

  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/resources", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Please log in to access learning resources."
            );
          }

          throw new Error(
            data?.error || "Unable to load resources right now."
          );
        }

        if (!cancelled) {
          setResources(
            Array.isArray(data?.resources) ? data.resources : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resources right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .map((resource) => resource.topic?.trim())
          .filter((topic): topic is string => Boolean(topic))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const chapters = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .map((resource) => resource.chapter)
          .filter(
            (chapter): chapter is number => chapter !== null
          )
      )
    ).sort((a, b) => a - b);
  }, [resources]);

  const filteredResources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return resources.filter((resource) => {
      if (
        typeFilter !== "all" &&
        resource.resource_type !== typeFilter
      ) {
        return false;
      }

      if (
        topicFilter !== "all" &&
        resource.topic !== topicFilter
      ) {
        return false;
      }

      if (
        chapterFilter !== "all" &&
        String(resource.chapter) !== chapterFilter
      ) {
        return false;
      }

      if (
        difficultyFilter !== "all" &&
        resource.difficulty !== difficultyFilter
      ) {
        return false;
      }

      if (savedOnly && !resource.is_saved) {
        return false;
      }

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

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [
    resources,
    search,
    typeFilter,
    topicFilter,
    chapterFilter,
    difficultyFilter,
    savedOnly,
  ]);

  async function toggleSave(resource: Resource) {
    if (savingId) {
      return;
    }

    const nextSavedState = !resource.is_saved;

    try {
      setSavingId(resource.id);

      const response = await fetch("/api/resources/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId: resource.id,
          saved: nextSavedState,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update bookmark."
        );
      }

      setResources((current) =>
        current.map((item) =>
          item.id === resource.id
            ? {
                ...item,
                is_saved: nextSavedState,
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update bookmark."
      );
    } finally {
      setSavingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setTopicFilter("all");
    setChapterFilter("all");
    setDifficultyFilter("all");
    setSavedOnly(false);
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all" ||
    topicFilter !== "all" ||
    chapterFilter !== "all" ||
    difficultyFilter !== "all" ||
    savedOnly;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Quantum Resources
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Go deeper into
              <span className="text-blue-600">
                {" "}
                quantum computing.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore curated research papers, learning materials,
              technical references, documents, and important
              developments selected to complement your
              QuantumLearn AI learning journey.
            </p>
          </div>

          {/* Search */}
          <div className="mt-9 max-w-3xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search resources, topics, authors, or keywords..."
                className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "all"
                    | ResourceType
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="all">All types</option>

              {Object.entries(TYPE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>

            <select
              value={topicFilter}
              onChange={(event) =>
                setTopicFilter(event.target.value)
              }
              className="h-10 max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="all">All topics</option>

              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <select
              value={chapterFilter}
              onChange={(event) =>
                setChapterFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="all">All chapters</option>

              {chapters.map((chapter) => (
                <option key={chapter} value={String(chapter)}>
                  Chapter {chapter}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(
                  event.target.value as
                    | "all"
                    | Difficulty
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="all">All levels</option>

              {Object.entries(DIFFICULTY_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                setSavedOnly((current) => !current)
              }
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                savedOnly
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${
                  savedOnly ? "fill-current" : ""
                }`}
              />
              Saved
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading resources...
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredResources.length === 0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <BookOpen className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              {resources.length === 0
                ? "No resources available yet"
                : "No resources match your filters"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {resources.length === 0
                ? "Curated quantum learning resources will appear here once they are published by the QuantumLearn AI team."
                : "Try changing your search or filters to find the resources you need."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Resource count */}
        {!loading && filteredResources.length > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredResources.length}
              </span>{" "}
              {filteredResources.length === 1
                ? "resource"
                : "resources"}
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && filteredResources.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => {
              const Icon =
                TYPE_ICONS[resource.resource_type] ||
                FileText;

              const hasUploadedFile =
                Boolean(resource.file_url);

              const hasExternalUrl =
                Boolean(resource.resource_url);

              const uploadedFileIsImage =
                isLikelyImageUrl(resource.file_url);

              const fileActionLabel =
                getFileActionLabel(resource);

              const tutorReason = `Help me understand this resource: "${resource.title}"${
                resource.topic
                  ? `, related to ${resource.topic}`
                  : ""
              }. Explain the important concepts, prerequisites, and how it connects to quantum computing.`;

              const tutorUrl = `/ai-tutor?source=resource&topic=${encodeURIComponent(
                resource.topic || resource.title
              )}&reason=${encodeURIComponent(tutorReason)}`;

              return (
                <article
                  key={resource.id}
                  className="group flex min-h-[330px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getTypeIconClasses(
                        resource.resource_type
                      )}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSave(resource)}
                      disabled={savingId === resource.id}
                      aria-label={
                        resource.is_saved
                          ? "Remove bookmark"
                          : "Save resource"
                      }
                      title={
                        resource.is_saved
                          ? "Remove bookmark"
                          : "Save resource"
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        resource.is_saved
                          ? "border-blue-200 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {savingId === resource.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bookmark
                          className={`h-4 w-4 ${
                            resource.is_saved
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      )}
                    </button>
                  </div>

                  {/* Uploaded image preview */}
                  {uploadedFileIsImage && resource.file_url && (
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={resource.file_url}
                        alt={resource.title}
                        className="h-44 w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                      />
                    </a>
                  )}

                  {/* Type */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-blue-600">
                      {TYPE_LABELS[resource.resource_type]}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-7 text-slate-950">
                    {resource.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {resource.description ||
                      "A curated resource for developing deeper knowledge of quantum computing."}
                  </p>

                  {/* Metadata */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.topic && (
                      <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {resource.topic}
                      </span>
                    )}

                    {resource.chapter !== null && (
                      <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Chapter {resource.chapter}
                      </span>
                    )}

                    {resource.difficulty && (
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getDifficultyClasses(
                          resource.difficulty
                        )}`}
                      >
                        {DIFFICULTY_LABELS[
                          resource.difficulty
                        ]}
                      </span>
                    )}
                  </div>

                  {/* Author/source */}
                  {(resource.author ||
                    resource.source_name) && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {resource.author ||
                          resource.source_name}

                        {resource.author &&
                        resource.source_name
                          ? ` · ${resource.source_name}`
                          : ""}
                      </span>
                    </div>
                  )}

                  {/* File indicator */}
                  {hasUploadedFile && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs font-medium text-blue-700">
                      {uploadedFileIsImage ? (
                        <FileImage className="h-4 w-4 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0" />
                      )}

                      <span>
                        {uploadedFileIsImage
                          ? "Image attached"
                          : isLikelyPdfUrl(
                              resource.file_url
                            )
                          ? "PDF attached"
                          : "Document attached"}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap gap-2">
                      {/* Uploaded file action */}
                      {hasUploadedFile && resource.file_url && (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          {uploadedFileIsImage ? (
                            <FileImage className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}

                          {fileActionLabel}

                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}

                      {/* External resource URL */}
                      {hasExternalUrl && resource.resource_url && (
                        <a
                          href={resource.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Resource
                        </a>
                      )}

                      {/* AI Tutor */}
                      <Link
                        href={tutorUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        title="Ask AI Tutor about this resource"
                      >
                        <Sparkles className="h-4 w-4" />

                        <span className="hidden sm:inline">
                          Ask AI
                        </span>
                      </Link>
                    </div>

                    {/* No resource/file */}
                    {!hasUploadedFile &&
                      !hasExternalUrl && (
                        <span className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-400">
                          Resource unavailable
                        </span>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}