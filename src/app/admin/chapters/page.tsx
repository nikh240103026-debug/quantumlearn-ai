// fixing deployemeny error
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  course_id: string;
};

type Chapter = {
  id: string;
  lesson_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
  lessons: Lesson | Lesson[] | null;
};

type ChaptersResponse = {
  chapters: Chapter[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ChapterForm = {
  lessonId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  orderIndex: string;
  isPublished: boolean;
};

const PAGE_SIZE = 25;

const EMPTY_FORM: ChapterForm = {
  lessonId: "",
  title: "",
  slug: "",
  description: "",
  content: "",
  orderIndex: "1",
  isPublished: false,
};

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<
    Chapter[]
  >([]);

  const [lessons, setLessons] = useState<
    Lesson[]
  >([]);

  const [search, setSearch] = useState("");

  const [lessonFilter, setLessonFilter] =
    useState("all");

  const [publishedFilter, setPublishedFilter] =
    useState<"all" | "published" | "draft">(
      "all",
    );

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingChapter, setEditingChapter] =
    useState<Chapter | null>(null);

  const [form, setForm] =
    useState<ChapterForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Chapter | null>(null);

  const [deleting, setDeleting] = useState(false);

  const loadLessons = useCallback(async () => {
    setLoadingLessons(true);

    try {
      const response = await fetch(
        "/api/admin/lessons?page=1&pageSize=100",
        {
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to load lessons.",
        );
      }

      setLessons(
        Array.isArray(result.lessons)
          ? result.lessons
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load lessons.",
      );
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  const loadChapters = useCallback(
    async (refresh = false) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set(
          "pageSize",
          String(PAGE_SIZE),
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        if (lessonFilter !== "all") {
          params.set(
            "lessonId",
            lessonFilter,
          );
        }

        if (publishedFilter === "published") {
          params.set(
            "published",
            "true",
          );
        }

        if (publishedFilter === "draft") {
          params.set(
            "published",
            "false",
          );
        }

        const response = await fetch(
          `/api/admin/chapters?${params.toString()}`,
          {
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as
            | ChaptersResponse
            | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in result
              ? result.error ||
                  "Unable to load chapters."
              : "Unable to load chapters.",
          );
        }

        const data =
          result as ChaptersResponse;

        setChapters(
          Array.isArray(data.chapters)
            ? data.chapters
            : [],
        );

        setPagination(
          data.pagination ?? {
            page,
            pageSize: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load chapters.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      lessonFilter,
      publishedFilter,
    ],
  );

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void loadChapters();
      },
      search.trim() ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadChapters, search]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    lessonFilter,
    publishedFilter,
  ]);

  const statistics = useMemo(() => {
    const published = chapters.filter(
      (chapter) =>
        chapter.is_published,
    ).length;

    return {
      total: pagination.total,
      published,
      drafts:
        chapters.length - published,
    };
  }, [chapters, pagination.total]);

  function getLesson(
    chapter: Chapter,
  ): Lesson | null {
    if (Array.isArray(chapter.lessons)) {
      return chapter.lessons[0] ?? null;
    }

    return chapter.lessons;
  }

  function openCreate() {
    setEditingChapter(null);

    setForm({
      ...EMPTY_FORM,
      lessonId:
        lessonFilter !== "all"
          ? lessonFilter
          : lessons[0]?.id ?? "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEdit(
    chapter: Chapter,
  ) {
    setEditingChapter(chapter);

    setForm({
      lessonId: chapter.lesson_id,
      title: chapter.title,
      slug: chapter.slug,
      description:
        chapter.description ?? "",
      content: chapter.content ?? "",
      orderIndex: String(
        chapter.order_index,
      ),
      isPublished:
        chapter.is_published,
    });

    setFormError("");
    setModalOpen(true);
  }

  async function saveChapter() {
    setFormError("");

    if (!form.lessonId) {
      setFormError(
        "Please select a lesson.",
      );
      return;
    }

    if (!form.title.trim()) {
      setFormError(
        "Chapter title is required.",
      );
      return;
    }

    if (!form.slug.trim()) {
      setFormError(
        "Chapter slug is required.",
      );
      return;
    }

    const orderIndex = Number(
      form.orderIndex,
    );

    if (
      !Number.isInteger(orderIndex) ||
      orderIndex < 1
    ) {
      setFormError(
        "Chapter order must be a positive integer.",
      );
      return;
    }

    setSaving(true);

    try {
      const isEditing =
        editingChapter !== null;

      const payload = isEditing
        ? {
            id: editingChapter.id,
            lessonId: form.lessonId,
            title: form.title,
            slug: form.slug,
            description:
              form.description,
            content: form.content,
            orderIndex,
            isPublished:
              form.isPublished,
          }
        : {
            lessonId: form.lessonId,
            title: form.title,
            slug: form.slug,
            description:
              form.description,
            content: form.content,
            orderIndex,
            isPublished:
              form.isPublished,
          };

      const response = await fetch(
        "/api/admin/chapters",
        {
          method: isEditing
            ? "PATCH"
            : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save chapter.",
        );
      }

      setModalOpen(false);
      setEditingChapter(null);
      setForm(EMPTY_FORM);
      setFormError("");

      await loadChapters(true);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save chapter.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/chapters",
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: deleteTarget.id,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to delete chapter.",
        );
      }

      setDeleteTarget(null);

      if (
        chapters.length === 1 &&
        page > 1
      ) {
        setPage((current) =>
          Math.max(1, current - 1),
        );
      } else {
        await loadChapters(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete chapter.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Learning Management
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Chapters
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Manage lesson chapters,
            ordering, content and
            visibility.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={
              loading || refreshing
            }
            onClick={() =>
              void loadChapters(true)
            }
            className="flex h-10 items-center gap-2 border border-white/10 px-4 text-xs text-white/45 transition hover:bg-white/[0.03] hover:text-white disabled:opacity-40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreate}
            disabled={
              loadingLessons ||
              lessons.length === 0
            }
            className="flex h-10 items-center gap-2 bg-cyan-400 px-4 text-xs font-medium text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chapter
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Chapters"
          value={statistics.total}
        />

        <StatCard
          label="Published"
          value={statistics.published}
        />

        <StatCard
          label="Drafts"
          value={statistics.drafts}
        />
      </div>

      <section className="border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px_150px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search chapters..."
                className="h-10 w-full border border-white/10 bg-black/10 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-cyan-400/30"
              />
            </div>

            <div className="relative">
              <select
                value={lessonFilter}
                onChange={(event) =>
                  setLessonFilter(
                    event.target.value,
                  )
                }
                className="h-10 w-full appearance-none border border-white/10 bg-[#0b101c] px-3 pr-9 text-xs text-white/55 outline-none focus:border-cyan-400/30"
              >
                <option value="all">
                  All Lessons
                </option>

                {lessons.map(
                  (lesson) => (
                    <option
                      key={lesson.id}
                      value={lesson.id}
                    >
                      {lesson.title}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            </div>

            <select
              value={publishedFilter}
              onChange={(event) =>
                setPublishedFilter(
                  event.target.value as
                    | "all"
                    | "published"
                    | "draft",
                )
              }
              className="h-10 border border-white/10 bg-[#0b101c] px-3 text-xs text-white/55 outline-none focus:border-cyan-400/30"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Drafts
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-400/20 bg-red-400/[0.04] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadChapters()
                }
                className="text-[10px] text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.15em] text-white/25">
                <th className="px-5 py-4 font-medium">
                  Chapter
                </th>

                <th className="px-5 py-4 font-medium">
                  Lesson
                </th>

                <th className="px-5 py-4 font-medium">
                  Order
                </th>

                <th className="px-5 py-4 font-medium">
                  Status
                </th>

                <th className="px-5 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <LoadingRows />
              ) : (
                chapters.map(
                  (chapter) => {
                    const lesson =
                      getLesson(
                        chapter,
                      );

                    return (
                      <tr
                        key={
                          chapter.id
                        }
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-400/20 bg-cyan-400/[0.06]">
                              <FileText className="h-4 w-4 text-cyan-400" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-white/70">
                                {
                                  chapter.title
                                }
                              </p>

                              <p className="mt-1 truncate text-[10px] text-white/25">
                                /
                                {
                                  chapter.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[300px] px-5 py-4">
                          <p className="truncate text-xs text-white/45">
                            {lesson?.title ??
                              "Unknown lesson"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center border border-white/10 text-[10px] text-white/40">
                            {
                              chapter.order_index
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            published={
                              chapter.is_published
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  chapter,
                                )
                              }
                              className="border border-white/10 px-3 py-2 text-[10px] text-white/45 transition hover:bg-white/[0.03] hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  chapter,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center border border-red-400/10 text-red-400/50 transition hover:bg-red-400/[0.05] hover:text-red-400"
                              aria-label={`Delete ${chapter.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        {!loading &&
          chapters.length === 0 &&
          !error && (
            <div className="px-5 py-16 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-white/10" />

              <p className="mt-3 text-sm text-white/45">
                No chapters found
              </p>

              <p className="mt-1 text-xs text-white/20">
                Create a chapter or
                change your filters.
              </p>
            </div>
          )}

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-white/25">
            {pagination.total === 0
              ? "No chapters"
              : `Showing ${
                  (pagination.page -
                    1) *
                    pagination.pageSize +
                  1
                }–${Math.min(
                  pagination.page *
                    pagination.pageSize,
                  pagination.total,
                )} of ${pagination.total.toLocaleString()}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                loading ||
                pagination.page <= 1
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
                )
              }
              className="flex h-8 w-8 items-center justify-center border border-white/10 text-white/35 transition hover:bg-white/[0.03] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-16 text-center text-[10px] text-white/35">
              {pagination.totalPages ===
              0
                ? "0 / 0"
                : `${pagination.page} / ${pagination.totalPages}`}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                pagination.page >=
                  pagination.totalPages
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    pagination.totalPages,
                    current + 1,
                  ),
                )
              }
              className="flex h-8 w-8 items-center justify-center border border-white/10 text-white/35 transition hover:bg-white/[0.03] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <ChapterModal
          editingChapter={
            editingChapter
          }
          lessons={lessons}
          form={form}
          setForm={setForm}
          saving={saving}
          error={formError}
          onClose={() => {
            if (!saving) {
              setModalOpen(false);
              setFormError("");
            }
          }}
          onSave={() =>
            void saveChapter()
          }
        />
      )}

      {deleteTarget && (
        <DeleteModal
          chapter={deleteTarget}
          deleting={deleting}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onDelete={() =>
            void deleteChapter()
          }
        />
      )}
    </div>
  );
}

function ChapterModal({
  editingChapter,
  lessons,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSave,
}: {
  editingChapter: Chapter | null;
  lessons: Lesson[];
  form: ChapterForm;
  setForm: React.Dispatch<
    React.SetStateAction<ChapterForm>
  >;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col border border-white/10 bg-[#0b101c] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-400">
              Chapter Management
            </p>

            <h2 className="mt-2 text-sm font-semibold text-white">
              {editingChapter
                ? "Edit Chapter"
                : "Create Chapter"}
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-white/25 hover:text-white disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {error && (
            <div className="mb-5 border border-red-400/20 bg-red-400/[0.04] p-3">
              <p className="text-xs text-red-400">
                {error}
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Lesson"
              value={form.lessonId}
              disabled={
                saving ||
                lessons.length === 0
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  lessonId: value,
                }))
              }
              options={lessons.map(
                (lesson) => ({
                  value: lesson.id,
                  label: lesson.title,
                }),
              )}
            />

            <Field
              label="Title"
              value={form.title}
              disabled={saving}
              placeholder="Quantum States"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  title: value,
                }))
              }
            />

            <Field
              label="Slug"
              value={form.slug}
              disabled={saving}
              placeholder="quantum-states"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  slug: value,
                }))
              }
            />

            <Field
              label="Order"
              value={form.orderIndex}
              disabled={saving}
              placeholder="1"
              type="number"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  orderIndex: value,
                }))
              }
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/25">
              Description
            </label>

            <textarea
              value={form.description}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description:
                    event.target.value,
                }))
              }
              rows={3}
              maxLength={5000}
              className="w-full resize-y border border-white/10 bg-black/10 px-3 py-3 text-xs leading-6 text-white/70 outline-none placeholder:text-white/20 focus:border-cyan-400/30 disabled:opacity-50"
              placeholder="Short description..."
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Chapter Content
              </label>

              <span className="text-[9px] text-white/20">
                Markdown supported
              </span>
            </div>

            <textarea
              value={form.content}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content:
                    event.target.value,
                }))
              }
              rows={14}
              maxLength={500000}
              spellCheck
              className="w-full resize-y border border-white/10 bg-black/10 px-3 py-3 font-mono text-xs leading-6 text-white/70 outline-none placeholder:text-white/20 focus:border-cyan-400/30 disabled:opacity-50"
              placeholder={`# Chapter heading

Write chapter content here using Markdown...`}
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isPublished}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isPublished:
                    event.target.checked,
                }))
              }
              className="h-4 w-4 accent-cyan-400"
            />

            <span>
              <span className="block text-xs text-white/60">
                Publish chapter
              </span>

              <span className="mt-1 block text-[10px] text-white/25">
                Published chapters
                are visible to
                learners.
              </span>
            </span>
          </label>

          <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-10 border border-white/10 px-4 text-xs text-white/40 hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="flex h-10 min-w-28 items-center justify-center gap-2 bg-cyan-400 px-4 text-xs font-medium text-black hover:bg-cyan-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {editingChapter
                    ? "Save Changes"
                    : "Create Chapter"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  chapter,
  deleting,
  onClose,
  onDelete,
}: {
  chapter: Chapter;
  deleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-red-400/20 bg-[#0b101c] p-5 shadow-2xl">
        <div className="flex h-10 w-10 items-center justify-center border border-red-400/20 bg-red-400/[0.06]">
          <Trash2 className="h-4 w-4 text-red-400" />
        </div>

        <h2 className="mt-5 text-sm font-semibold text-white">
          Delete chapter?
        </h2>

        <p className="mt-2 text-xs leading-6 text-white/40">
          This will permanently
          remove{" "}
          <span className="text-white/65">
            {chapter.title}
          </span>
          .
        </p>

        <p className="mt-3 border border-amber-400/10 bg-amber-400/[0.03] p-3 text-[10px] leading-5 text-amber-400/70">
          Chapters with learner
          progress are protected
          and must be unpublished
          instead.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="h-10 border border-white/10 px-4 text-xs text-white/40 hover:text-white disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="flex h-10 min-w-24 items-center justify-center gap-2 bg-red-500 px-4 text-xs font-medium text-white hover:bg-red-400 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  disabled,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-10 w-full border border-white/10 bg-black/10 px-3 text-xs text-white/70 outline-none placeholder:text-white/20 focus:border-cyan-400/30 disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full border border-white/10 bg-[#0b101c] px-3 text-xs text-white/60 outline-none focus:border-cyan-400/30 disabled:opacity-50"
      >
        <option value="">
          Select lesson
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs text-white/35">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] ${
        published
          ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400"
          : "border-amber-400/20 bg-amber-400/[0.05] text-amber-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {published
        ? "Published"
        : "Draft"}
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <tr key={index}>
            <td
              colSpan={5}
              className="px-5 py-5"
            >
              <div className="h-9 animate-pulse bg-white/[0.03]" />
            </td>
          </tr>
        ),
      )}
    </>
  );
}