"use client";

/*
 * Courses manager.
 *
 * This page used to be a byte-for-byte copy of the Chapters manager
 * (it called /api/admin/chapters), so courses could not be created,
 * edited, published or deleted from the admin UI. It now uses
 * /api/admin/courses.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

import {
  AdminPage,
  Button,
  DataTable,
  ErrorState,
  Field,
  Modal,
  Pagination,
  SearchBox,
  StatCard,
  apiRequest,
  inputClass,
  textareaClass,
  type AdminColumn,
} from "@/components/admin/AdminUI";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string | null;
  is_published: boolean;
  lesson_count?: number;
  updated_at?: string | null;
};

type Draft = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  isPublished: boolean;
};

type CoursesResponse = {
  courses?: Course[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
};

const ENDPOINT = "/api/admin/courses";

const LEVELS = ["beginner", "basic", "intermediate", "advanced"];

const EMPTY_DRAFT: Draft = {
  title: "",
  slug: "",
  description: "",
  level: "beginner",
  isPublished: false,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Ignore responses from superseded requests (fast paging/search).
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });

      if (search.trim()) {
        query.set("search", search.trim());
      }

      const data = await apiRequest<CoursesResponse>(
        `${ENDPOINT}?${query}`,
      );

      if (requestId !== requestRef.current) {
        return;
      }

      setRows(data.courses ?? []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(
          err instanceof Error ? err.message : "Unable to load courses.",
        );
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setDraft({ ...EMPTY_DRAFT });
    setSlugEdited(false);
  }

  function openEdit(course: Course) {
    setDraft({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description ?? "",
      level: course.level ?? "beginner",
      isPublished: course.is_published,
    });
    setSlugEdited(true);
  }

  async function save() {
    if (!draft || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiRequest(ENDPOINT, {
        method: draft.id ? "PATCH" : "POST",
        body: JSON.stringify(draft),
      });

      setDraft(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save course.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft?.id || deleting) {
      return;
    }

    if (
      !confirm(
        "Delete this course? Courses that still have lessons cannot be deleted.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await apiRequest(ENDPOINT, {
        method: "DELETE",
        body: JSON.stringify({ id: draft.id }),
      });

      setDraft(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete course.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const columns: AdminColumn<Course>[] = [
    { key: "title", label: "Title" },
    { key: "slug", label: "Slug" },
    {
      key: "level",
      label: "Level",
      render: (row) => row.level ?? "—",
    },
    {
      key: "lesson_count",
      label: "Lessons",
      render: (row) => String(row.lesson_count ?? 0),
    },
    {
      key: "is_published",
      label: "Status",
      render: (row) => (row.is_published ? "Published" : "Draft"),
    },
  ];

  return (
    <AdminPage
      title="Courses"
      description="Create, edit, publish and remove courses."
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          New course
        </Button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <SearchBox
          value={search}
          onChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          placeholder="Search courses…"
        />
        <StatCard label="Courses" value={total} />
        <Button onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorState message={error} onRetry={() => void load()} />
        </div>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onSelect={openEdit}
      />

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {draft && (
        <Modal
          title={draft.id ? "Edit course" : "New course"}
          onClose={() => setDraft(null)}
        >
          <div className="space-y-4">
            <Field label="Title" required>
              <input
                className={inputClass}
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          title,
                          slug: slugEdited ? current.slug : slugify(title),
                        }
                      : current,
                  );
                }}
              />
            </Field>

            <Field label="Slug" required>
              <input
                className={inputClass}
                value={draft.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setDraft((current) =>
                    current
                      ? { ...current, slug: event.target.value }
                      : current,
                  );
                }}
              />
            </Field>

            <Field label="Description">
              <textarea
                className={textareaClass}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current,
                  )
                }
              />
            </Field>

            <Field label="Level">
              <select
                className={inputClass}
                value={draft.level}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, level: event.target.value }
                      : current,
                  )
                }
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-[#0b111b]">
                    {level}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, isPublished: event.target.checked }
                      : current,
                  )
                }
              />
              Published
            </label>

            <div className="flex justify-between pt-2">
              <div>
                {draft.id && (
                  <Button
                    variant="danger"
                    onClick={() => void remove()}
                    disabled={deleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void save()}
                  disabled={saving || !draft.title.trim() || !draft.slug.trim()}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  );
}
