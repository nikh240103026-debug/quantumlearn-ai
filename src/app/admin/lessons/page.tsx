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
  Clock3,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
  courses:
    | Course
    | Course[]
    | null;
};

type LessonsResponse = {
  lessons: Lesson[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 25;

const emptyForm = {
  courseId: "",
  title: "",
  slug: "",
  description: "",
  content: "",
  orderIndex: "1",
  durationMinutes: "",
  isPublished: false,
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [search, setSearch] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [publishedFilter, setPublishedFilter] =
    useState<
      "all" | "published" | "draft"
    >("all");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      pageSize: PAGE_SIZE,
      total: 0,
      totalPages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [loadingCourses, setLoadingCourses] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Lesson | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const loadCourses = useCallback(
    async () => {
      setLoadingCourses(true);

      try {
        const response = await fetch(
          "/api/admin/courses?page=1&pageSize=100",
          {
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to load courses.",
          );
        }

        setCourses(
          (result.courses ??
            []) as Course[],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load courses.",
        );
      } finally {
        setLoadingCourses(false);
      }
    },
    [],
  );

  const loadLessons = useCallback(
    async (refresh = false) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page),
        );

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

        if (
          courseFilter !== "all"
        ) {
          params.set(
            "courseId",
            courseFilter,
          );
        }

        if (
          publishedFilter ===
          "published"
        ) {
          params.set(
            "published",
            "true",
          );
        }

        if (
          publishedFilter === "draft"
        ) {
          params.set(
            "published",
            "false",
          );
        }

        const response = await fetch(
          `/api/admin/lessons?${params.toString()}`,
          {
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to load lessons.",
          );
        }

        const data =
          result as LessonsResponse;

        setLessons(data.lessons);
        setPagination(
          data.pagination,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load lessons.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      courseFilter,
      publishedFilter,
    ],
  );

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadLessons();
        },
        search.trim() ? 350 : 0,
      );

    return () =>
      window.clearTimeout(timer);
  }, [loadLessons, search]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    courseFilter,
    publishedFilter,
  ]);

  const statistics = useMemo(
    () => ({
      total: pagination.total,
      published: lessons.filter(
        (lesson) =>
          lesson.is_published,
      ).length,
      drafts: lessons.filter(
        (lesson) =>
          !lesson.is_published,
      ).length,
    }),
    [lessons, pagination.total],
  );

  function getCourse(
    lesson: Lesson,
  ): Course | null {
    if (
      Array.isArray(lesson.courses)
    ) {
      return lesson.courses[0] ?? null;
    }

    return lesson.courses;
  }

  function openCreate() {
    setEditingLesson(null);

    setForm({
      ...emptyForm,
      courseId:
        courseFilter !== "all"
          ? courseFilter
          : courses[0]?.id ?? "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function openEdit(
    lesson: Lesson,
  ) {
    setEditingLesson(lesson);

    setForm({
      courseId: lesson.course_id,
      title: lesson.title,
      slug: lesson.slug,
      description:
        lesson.description ?? "",
      content:
        lesson.content ?? "",
      orderIndex:
        String(lesson.order_index),
      durationMinutes:
        lesson.duration_minutes
          ? String(
              lesson.duration_minutes,
            )
          : "",
      isPublished:
        lesson.is_published,
    });

    setFormError("");
    setModalOpen(true);
  }

  async function saveLesson() {
    setFormError("");

    if (!form.courseId) {
      setFormError(
        "Please select a course.",
      );
      return;
    }

    if (!form.title.trim()) {
      setFormError(
        "Lesson title is required.",
      );
      return;
    }

    if (!form.slug.trim()) {
      setFormError(
        "Lesson slug is required.",
      );
      return;
    }

    const orderIndex = Number(
      form.orderIndex,
    );

    if (
      !Number.isInteger(
        orderIndex,
      ) ||
      orderIndex < 1
    ) {
      setFormError(
        "Lesson order must be a positive integer.",
      );
      return;
    }

    let duration: number | null =
      null;

    if (
      form.durationMinutes.trim()
    ) {
      duration = Number(
        form.durationMinutes,
      );

      if (
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 1440
      ) {
        setFormError(
          "Duration must be between 1 and 1440 minutes.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const editing =
        Boolean(editingLesson);

      const response = await fetch(
        "/api/admin/lessons",
        {
          method: editing
            ? "PATCH"
            : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            editing
              ? {
                  id: editingLesson!.id,
                  courseId:
                    form.courseId,
                  title: form.title,
                  slug: form.slug,
                  description:
                    form.description,
                  content:
                    form.content,
                  orderIndex,
                  durationMinutes:
                    duration,
                  isPublished:
                    form.isPublished,
                }
              : {
                  courseId:
                    form.courseId,
                  title: form.title,
                  slug: form.slug,
                  description:
                    form.description,
                  content:
                    form.content,
                  orderIndex,
                  durationMinutes:
                    duration,
                  isPublished:
                    form.isPublished,
                },
          ),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save lesson.",
        );
      }

      setModalOpen(false);
      setEditingLesson(null);
      setForm(emptyForm);

      await loadLessons(true);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save lesson.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/lessons",
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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to delete lesson.",
        );
      }

      setDeleteTarget(null);

      await loadLessons(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete lesson.",
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
            Lessons
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Manage lesson content, ordering, visibility and duration.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={
              loading || refreshing
            }
            onClick={() =>
              void loadLessons(true)
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
              loadingCourses ||
              courses.length === 0
            }
            className="flex h-10 items-center gap-2 bg-cyan-400 px-4 text-xs font-medium text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            New Lesson
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Lessons"
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
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_150px]">
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
                placeholder="Search lessons..."
                className="h-10 w-full border border-white/10 bg-black/10 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-cyan-400/30"
              />
            </div>

            <div className="relative">
              <select
                value={courseFilter}
                onChange={(event) =>
                  setCourseFilter(
                    event.target.value,
                  )
                }
                className="h-10 w-full appearance-none border border-white/10 bg-[#0b101c] px-3 pr-9 text-xs text-white/55 outline-none focus:border-cyan-400/30"
              >
                <option value="all">
                  All Courses
                </option>

                {courses.map(
                  (course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.title}
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
                  void loadLessons()
                }
                className="text-[10px] text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.15em] text-white/25">
                <th className="px-5 py-4 font-medium">
                  Lesson
                </th>

                <th className="px-5 py-4 font-medium">
                  Course
                </th>

                <th className="px-5 py-4 font-medium">
                  Order
                </th>

                <th className="px-5 py-4 font-medium">
                  Duration
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
                lessons.map(
                  (lesson) => {
                    const course =
                      getCourse(
                        lesson,
                      );

                    return (
                      <tr
                        key={
                          lesson.id
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
                                  lesson.title
                                }
                              </p>

                              <p className="mt-1 truncate text-[10px] text-white/25">
                                /learn/
                                {
                                  lesson.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[230px] px-5 py-4">
                          <p className="truncate text-xs text-white/45">
                            {course?.title ??
                              "Unknown course"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center border border-white/10 text-[10px] text-white/40">
                            {
                              lesson.order_index
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-white/35">
                            <Clock3 className="h-3.5 w-3.5" />

                            {lesson.duration_minutes
                              ? `${lesson.duration_minutes} min`
                              : "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            published={
                              lesson.is_published
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  lesson,
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
                                  lesson,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center border border-red-400/10 text-red-400/50 transition hover:bg-red-400/[0.05] hover:text-red-400"
                              aria-label={`Delete ${lesson.title}`}
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
          lessons.length === 0 &&
          !error && (
            <div className="px-5 py-16 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-white/10" />

              <p className="mt-3 text-sm text-white/45">
                No lessons found
              </p>

              <p className="mt-1 text-xs text-white/20">
                Create a lesson or change your filters.
              </p>
            </div>
          )}

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-white/25">
            {pagination.total ===
            0
              ? "No lessons"
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
        <LessonModal
          editingLesson={
            editingLesson
          }
          courses={courses}
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
            void saveLesson()
          }
        />
      )}

      {deleteTarget && (
        <DeleteModal
          lesson={deleteTarget}
          deleting={deleting}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onDelete={() =>
            void deleteLesson()
          }
        />
      )}
    </div>
  );
}

function LessonModal({
  editingLesson,
  courses,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSave,
}: {
  editingLesson: Lesson | null;
  courses: Course[];
  form: typeof emptyForm;
  setForm: React.Dispatch<
    React.SetStateAction<
      typeof emptyForm
    >
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
              Lesson Management
            </p>

            <h2 className="mt-2 text-sm font-semibold text-white">
              {editingLesson
                ? "Edit Lesson"
                : "Create Lesson"}
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
              label="Course"
              value={form.courseId}
              disabled={
                saving ||
                courses.length === 0
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  courseId: value,
                }))
              }
              options={courses.map(
                (course) => ({
                  value: course.id,
                  label: course.title,
                }),
              )}
            />

            <Field
              label="Title"
              value={form.title}
              disabled={saving}
              placeholder="Introduction to Qubits"
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
              placeholder="introduction-to-qubits"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  slug: value,
                }))
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Order"
                value={
                  form.orderIndex
                }
                disabled={saving}
                placeholder="1"
                type="number"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    orderIndex:
                      value,
                  }))
                }
              />

              <Field
                label="Duration"
                value={
                  form.durationMinutes
                }
                disabled={saving}
                placeholder="30"
                type="number"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes:
                      value,
                  }))
                }
              />
            </div>
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
              placeholder="Short description shown to learners..."
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Lesson Content
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
              placeholder="# Lesson heading

Write the lesson content here using Markdown..."
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                form.isPublished
              }
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
                Publish lesson
              </span>

              <span className="mt-1 block text-[10px] text-white/25">
                Published lessons are visible to learners.
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
                  {editingLesson
                    ? "Save Changes"
                    : "Create Lesson"}
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
  lesson,
  deleting,
  onClose,
  onDelete,
}: {
  lesson: Lesson;
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
          Delete lesson?
        </h2>

        <p className="mt-2 text-xs leading-6 text-white/40">
          This will permanently remove{" "}
          <span className="text-white/65">
            {lesson.title}
          </span>
          .
        </p>

        <p className="mt-3 border border-amber-400/10 bg-amber-400/[0.03] p-3 text-[10px] leading-5 text-amber-400/70">
          Lessons with learner progress or practice history are protected and must be unpublished instead.
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
          Select course
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={
                option.value
              }
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
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <tr key={index}>
          <td
            colSpan={6}
            className="px-5 py-5"
          >
            <div className="h-9 animate-pulse bg-white/[0.03]" />
          </td>
        </tr>
      ))}
    </>
  );
}