"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  description: string;
  resource_type: ResourceType;
  topic: string | null;
  chapter: number | null;
  difficulty: Difficulty;
  resource_url: string | null;
  file_url: string | null;
  author: string | null;
  source_name: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ResourceForm = {
  title: string;
  description: string;
  resourceType: ResourceType;
  topic: string;
  chapter: string;
  difficulty: Difficulty;
  resourceUrl: string;
  fileUrl: string;
  author: string;
  sourceName: string;
  tags: string;
  isPublished: boolean;
};

const RESOURCE_TYPES: {
  value: ResourceType;
  label: string;
}[] = [
  {
    value: "research_paper",
    label: "Research Paper",
  },
  {
    value: "learning_material",
    label: "Learning Material",
  },
  {
    value: "technical_reference",
    label: "Technical Reference",
  },
  {
    value: "innovation_update",
    label: "Innovation Update",
  },
  {
    value: "document",
    label: "Document",
  },
  {
    value: "external_reference",
    label: "External Reference",
  },
];

const DIFFICULTIES: {
  value: Difficulty;
  label: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate",
  },
  {
    value: "advanced",
    label: "Advanced",
  },
];

const EMPTY_FORM: ResourceForm = {
  title: "",
  description: "",
  resourceType: "learning_material",
  topic: "",
  chapter: "",
  difficulty: "beginner",
  resourceUrl: "",
  fileUrl: "",
  author: "",
  sourceName: "",
  tags: "",
  isPublished: false,
};

function createFormFromResource(resource: Resource): ResourceForm {
  return {
    title: resource.title,
    description: resource.description,
    resourceType: resource.resource_type,
    topic: resource.topic ?? "",
    chapter:
      resource.chapter !== null
        ? String(resource.chapter)
        : "",
    difficulty: resource.difficulty,
    resourceUrl: resource.resource_url ?? "",
    fileUrl: resource.file_url ?? "",
    author: resource.author ?? "",
    sourceName: resource.source_name ?? "",
    tags: Array.isArray(resource.tags)
      ? resource.tags.join(", ")
      : "",
    isPublished: resource.is_published,
  };
}

function getTypeLabel(type: ResourceType) {
  return (
    RESOURCE_TYPES.find((item) => item.value === type)?.label ??
    type
  );
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] =
    useState<Resource | null>(null);

  const [form, setForm] =
    useState<ResourceForm>(EMPTY_FORM);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const [typeFilter, setTypeFilter] = useState<
    "all" | ResourceType
  >("all");

  const [deleteTarget, setDeleteTarget] =
    useState<Resource | null>(null);

  const filteredResources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !normalizedSearch ||
        resource.title.toLowerCase().includes(normalizedSearch) ||
        resource.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        (resource.topic ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (resource.author ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (resource.source_name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          resource.is_published) ||
        (statusFilter === "draft" &&
          !resource.is_published);

      const matchesType =
        typeFilter === "all" ||
        resource.resource_type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    resources,
    search,
    statusFilter,
    typeFilter,
  ]);

  const publishedCount = resources.filter(
    (resource) => resource.is_published
  ).length;

  const draftCount = resources.filter(
    (resource) => !resource.is_published
  ).length;

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/resources",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load admin resources."
        );
      }

      setResources(data.resources ?? []);
    } catch (err) {
      console.error(
        "Admin resources loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resources."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResources();
  }, []);

  function openCreateForm() {
    setEditingResource(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(resource: Resource) {
    setEditingResource(resource);
    setForm(createFormFromResource(resource));
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingResource(null);
    setForm(EMPTY_FORM);
  }

  function updateForm<K extends keyof ResourceForm>(
    field: K,
    value: ResourceForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const description = form.description.trim();
    const resourceUrl = form.resourceUrl.trim();
    const fileUrl = form.fileUrl.trim();

    if (!title) {
      setError("Resource title is required.");
      return;
    }

    if (!description) {
      setError("Resource description is required.");
      return;
    }

    if (!resourceUrl && !fileUrl) {
      setError(
        "Add at least one resource URL or file URL."
      );
      return;
    }

    if (!isValidUrl(resourceUrl)) {
      setError("Resource URL is not valid.");
      return;
    }

    if (!isValidUrl(fileUrl)) {
      setError("File URL is not valid.");
      return;
    }

    let chapter: number | null = null;

    if (form.chapter.trim()) {
      const parsedChapter = Number(
        form.chapter.trim()
      );

      if (
        !Number.isInteger(parsedChapter) ||
        parsedChapter < 1 ||
        parsedChapter > 10
      ) {
        setError(
          "Chapter must be a number between 1 and 10."
        );
        return;
      }

      chapter = parsedChapter;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      const isEditing = Boolean(editingResource);

      const payload = {
        ...(isEditing
          ? { id: editingResource?.id }
          : {}),
        title,
        description,
        resourceType: form.resourceType,
        topic: form.topic.trim() || null,
        chapter,
        difficulty: form.difficulty,
        resourceUrl: resourceUrl || null,
        fileUrl: fileUrl || null,
        author: form.author.trim() || null,
        sourceName: form.sourceName.trim() || null,
        tags,
        isPublished: form.isPublished,
      };

      const response = await fetch(
        "/api/admin/resources",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${
              isEditing ? "update" : "create"
            } resource.`
        );
      }

      setSuccess(
        isEditing
          ? "Resource updated successfully."
          : "Resource created successfully."
      );

      setShowForm(false);
      setEditingResource(null);
      setForm(EMPTY_FORM);

      await loadResources();
    } catch (err) {
      console.error(
        "Admin resource save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save resource."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(resource: Resource) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/resources",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: resource.id,
            isPublished: !resource.is_published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update publication status."
        );
      }

      setResources((current) =>
        current.map((item) =>
          item.id === resource.id
            ? {
                ...item,
                is_published:
                  !item.is_published,
              }
            : item
        )
      );

      setSuccess(
        resource.is_published
          ? "Resource moved to drafts."
          : "Resource published successfully."
      );
    } catch (err) {
      console.error(
        "Resource publication update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update publication status."
      );
    }
  }

  async function deleteResource() {
    if (!deleteTarget) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/resources?id=${encodeURIComponent(
          deleteTarget.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete resource."
        );
      }

      setResources((current) =>
        current.filter(
          (resource) =>
            resource.id !== deleteTarget.id
        )
      );

      setSuccess(
        "Resource deleted successfully."
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error(
        "Resource deletion error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete resource."
      );
    }
  }

  function openResource(resource: Resource) {
    const url =
      resource.resource_url ||
      resource.file_url;

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                Admin
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                Resources
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Resource Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Add, edit, publish, and manage learning
              resources available to QuantumLearn AI
              students.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <span className="mr-2 text-lg">
              +
            </span>
            Add Resource
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <div className="flex items-start justify-between gap-4">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-300 hover:text-white"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <div className="flex items-start justify-between gap-4">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-300 hover:text-white"
                aria-label="Dismiss success message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Total Resources
            </p>
            <p className="mt-2 text-3xl font-bold">
              {resources.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-sm text-emerald-300/80">
              Published
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm text-amber-300/80">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              {draftCount}
            </p>
          </div>
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingResource
                    ? "Edit Resource"
                    : "Add New Resource"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingResource
                    ? "Update the resource information below."
                    : "Add a new resource to the QuantumLearn AI library."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Basic information */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-300">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Title *
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateForm(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Quantum Computing: An Introduction"
                      maxLength={300}
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Description *
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateForm(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Describe what students will learn from this resource..."
                      rows={5}
                      required
                      className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Resource Type *
                    </label>

                    <select
                      value={form.resourceType}
                      onChange={(event) =>
                        updateForm(
                          "resourceType",
                          event.target.value as ResourceType
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    >
                      {RESOURCE_TYPES.map(
                        (type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Difficulty *
                    </label>

                    <select
                      value={form.difficulty}
                      onChange={(event) =>
                        updateForm(
                          "difficulty",
                          event.target.value as Difficulty
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    >
                      {DIFFICULTIES.map(
                        (difficulty) => (
                          <option
                            key={difficulty.value}
                            value={difficulty.value}
                          >
                            {difficulty.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Topic
                    </label>

                    <input
                      type="text"
                      value={form.topic}
                      onChange={(event) =>
                        updateForm(
                          "topic",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Qubits"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Chapter
                    </label>

                    <select
                      value={form.chapter}
                      onChange={(event) =>
                        updateForm(
                          "chapter",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="">
                        No chapter
                      </option>

                      {Array.from(
                        { length: 10 },
                        (_, index) => index + 1
                      ).map((chapter) => (
                        <option
                          key={chapter}
                          value={chapter}
                        >
                          Chapter {chapter}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-300">
                  Source Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Author
                    </label>

                    <input
                      type="text"
                      value={form.author}
                      onChange={(event) =>
                        updateForm(
                          "author",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Michael Nielsen"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Source / Publisher
                    </label>

                    <input
                      type="text"
                      value={form.sourceName}
                      onChange={(event) =>
                        updateForm(
                          "sourceName",
                          event.target.value
                        )
                      }
                      placeholder="e.g. IBM Quantum"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Resource URL
                    </label>

                    <input
                      type="url"
                      value={form.resourceUrl}
                      onChange={(event) =>
                        updateForm(
                          "resourceUrl",
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      External webpage or reference URL.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      File / PDF URL
                    </label>

                    <input
                      type="url"
                      value={form.fileUrl}
                      onChange={(event) =>
                        updateForm(
                          "fileUrl",
                          event.target.value
                        )
                      }
                      placeholder="https://.../paper.pdf"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Direct PDF/document URL if available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags and publication */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-300">
                  Organization
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Tags
                    </label>

                    <input
                      type="text"
                      value={form.tags}
                      onChange={(event) =>
                        updateForm(
                          "tags",
                          event.target.value
                        )
                      }
                      placeholder="qubits, quantum gates, beginner"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Separate multiple tags with commas.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) =>
                        updateForm(
                          "isPublished",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500"
                    />

                    <span>
                      <span className="block text-sm font-medium text-white">
                        Publish immediately
                      </span>

                      <span className="block text-xs text-slate-500">
                        Published resources become visible
                        to students on the Resources page.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingResource
                      ? "Update Resource"
                      : "Create Resource"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_180px]">
            <div>
              <label className="sr-only">
                Search resources
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search resources..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "published"
                    | "draft"
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
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

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "all"
                    | ResourceType
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">
                All Types
              </option>

              {RESOURCE_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing {filteredResources.length} of{" "}
            {resources.length} resources
          </div>
        </section>

        {/* Resource list */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading resources...
            </p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
              📚
            </div>

            <h2 className="text-lg font-semibold">
              {resources.length === 0
                ? "No resources yet"
                : "No matching resources"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {resources.length === 0
                ? "Create your first learning resource to make it available in the QuantumLearn AI resource library."
                : "Try changing your search or filters."}
            </p>

            {resources.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Add First Resource
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map(
              (resource) => (
                <article
                  key={resource.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                          {getTypeLabel(
                            resource.resource_type
                          )}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            resource.is_published
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {resource.is_published
                            ? "Published"
                            : "Draft"}
                        </span>

                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                          {resource.difficulty}
                        </span>

                        {resource.chapter !==
                          null && (
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                            Chapter{" "}
                            {resource.chapter}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-white">
                        {resource.title}
                      </h2>

                      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                        {resource.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {resource.topic && (
                          <span>
                            Topic:{" "}
                            <span className="text-slate-300">
                              {resource.topic}
                            </span>
                          </span>
                        )}

                        {resource.author && (
                          <span>
                            Author:{" "}
                            <span className="text-slate-300">
                              {resource.author}
                            </span>
                          </span>
                        )}

                        {resource.source_name && (
                          <span>
                            Source:{" "}
                            <span className="text-slate-300">
                              {
                                resource.source_name
                              }
                            </span>
                          </span>
                        )}

                        <span>
                          Created:{" "}
                          <span className="text-slate-300">
                            {formatDate(
                              resource.created_at
                            )}
                          </span>
                        </span>
                      </div>

                      {resource.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {resource.tags.map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400"
                              >
                                #{tag}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:w-64 lg:justify-end">
                      {(resource.resource_url ||
                        resource.file_url) && (
                        <button
                          type="button"
                          onClick={() =>
                            openResource(resource)
                          }
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                          Open
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(resource)
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void togglePublished(
                            resource
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          resource.is_published
                            ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                            : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                        }`}
                      >
                        {resource.is_published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(
                            resource
                          )
                        }
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl">
              ⚠️
            </div>

            <h2 className="text-xl font-bold">
              Delete Resource?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              You are about to permanently delete:
            </p>

            <p className="mt-2 rounded-lg bg-slate-950 p-3 text-sm font-medium text-white">
              {deleteTarget.title}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              This action cannot be undone. Any
              associated student bookmarks will also
              be removed through the database
              relationship.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void deleteResource()
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}