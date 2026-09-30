// fixing deployemeny error
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Archive,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  content: string;
};

export default function AdminEditLessonPage() {
  const params = useParams();
  const lessonId = params?.id;

  const [title, setTitle] = useState("What Is Quantum Computing?");
  const [slug, setSlug] = useState("what-is-quantum-computing");
  const [description, setDescription] = useState(
    "An introduction to quantum computing, how it differs from classical computing, and why quantum systems can solve certain problems in fundamentally different ways.",
  );
  const [course, setCourse] = useState("Quantum Computing Fundamentals");
  const [chapter, setChapter] = useState(
    "Introduction to Quantum Computing",
  );
  const [type, setType] = useState("Theory");
  const [status, setStatus] = useState("Published");

  const [sections, setSections] = useState<Section[]>([
    {
      id: "section-1",
      title: "Introduction",
      content:
        "Quantum computing is a computing paradigm that uses quantum mechanical phenomena to process information.",
    },
    {
      id: "section-2",
      title: "Classical Computing",
      content:
        "Classical computers process information using bits that represent either 0 or 1.",
    },
    {
      id: "section-3",
      title: "Quantum Computing",
      content:
        "Quantum computers use qubits, which can exist in combinations of quantum states.",
    },
    {
      id: "section-4",
      title: "Why Quantum Computing Matters",
      content:
        "Quantum computing may provide significant advantages for specific classes of problems.",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const updateSection = (
    id: string,
    field: "title" | "content",
    value: string,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    );
  };

  const addSection = () => {
    setSections((current) => [
      ...current,
      {
        id: `section-${Date.now()}`,
        title: "New Section",
        content: "",
      },
    ]);
  };

  const removeSection = (id: string) => {
    setSections((current) =>
      current.filter((section) => section.id !== id),
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <Link
          href={`/admin/lessons/${lessonId}`}
          className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lesson
        </Link>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Learning Management
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Edit Lesson
          </h1>

          <p className="mt-2 text-sm text-white/45">
            Update lesson information and content.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/learn/${slug}`}
            className="inline-flex h-10 items-center gap-2 border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-4 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-3 border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Lesson changes saved successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Lesson Details
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Basic information displayed to learners.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <FormField
                label="Lesson Title"
                required
                value={title}
                onChange={setTitle}
                placeholder="Enter lesson title"
              />

              <FormField
                label="Lesson Slug"
                required
                value={slug}
                onChange={setSlug}
                placeholder="lesson-slug"
                helper="Used as part of the public lesson URL."
              />

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-medium text-white/65"
                >
                  Description
                  <span className="ml-1 text-cyan-400">*</span>
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={5}
                  placeholder="Describe this lesson..."
                  className="w-full resize-y border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-cyan-400/40"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Course"
                  value={course}
                  onChange={setCourse}
                  options={[
                    "Quantum Computing Fundamentals",
                    "Quantum Gates & Circuits",
                    "Quantum Algorithms",
                    "Quantum Information",
                  ]}
                />

                <SelectField
                  label="Chapter"
                  value={chapter}
                  onChange={setChapter}
                  options={[
                    "Introduction to Quantum Computing",
                    "Qubits and Quantum States",
                    "Quantum Gates",
                    "Quantum Entanglement",
                    "Quantum Measurement",
                    "Building Quantum Circuits",
                  ]}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Content Type"
                  value={type}
                  onChange={setType}
                  options={[
                    "Theory",
                    "Interactive",
                    "Video",
                    "Simulation",
                    "Assessment",
                  ]}
                />

                <SelectField
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={["Published", "Draft", "Archived"]}
                />
              </div>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Lesson Content
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  Manage the sections that make up this lesson.
                </p>
              </div>

              <button
                type="button"
                onClick={addSection}
                className="inline-flex h-9 items-center justify-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-3 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Section
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {sections.map((section, index) => (
                <div key={section.id} className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <GripVertical className="h-4 w-4 cursor-grab text-white/20" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                      Section {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center text-white/25 transition hover:bg-white/5 hover:text-white"
                        aria-label="Collapse section"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        disabled={sections.length === 1}
                        className="flex h-7 w-7 items-center justify-center text-white/25 transition hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-20"
                        aria-label="Delete section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pl-7">
                    <FormField
                      label="Section Title"
                      value={section.title}
                      onChange={(value) =>
                        updateSection(section.id, "title", value)
                      }
                      placeholder="Section title"
                    />

                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/65">
                        Section Content
                      </label>

                      <textarea
                        value={section.content}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "content",
                            event.target.value,
                          )
                        }
                        rows={7}
                        placeholder="Write lesson content..."
                        className="w-full resize-y border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-cyan-400/40"
                      />

                      <p className="mt-2 text-[10px] text-white/25">
                        Markdown content is supported.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Publishing
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Control lesson visibility.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="publish-status"
                  className="mb-2 block text-xs font-medium text-white/65"
                >
                  Visibility
                </label>

                <select
                  id="publish-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-11 w-full border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-cyan-400/40"
                >
                  <option value="Published" className="bg-[#0b1020]">
                    Published
                  </option>

                  <option value="Draft" className="bg-[#0b1020]">
                    Draft
                  </option>

                  <option value="Archived" className="bg-[#0b1020]">
                    Archived
                  </option>
                </select>
              </div>

              <div className="border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                  <p className="text-xs leading-5 text-white/45">
                    Published content is immediately available to learners.
                    Review all sections before saving.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Lesson"}
              </button>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Content Guidelines
              </h2>
            </div>

            <div className="space-y-3 p-5">
              <Guideline text="Keep explanations concise and learner-focused." />
              <Guideline text="Use Markdown for structured lesson content." />
              <Guideline text="Add examples where concepts are difficult." />
              <Guideline text="Verify quantum formulas and circuit notation." />
            </div>
          </section>

          <section className="border border-red-400/10 bg-red-400/[0.02]">
            <div className="border-b border-red-400/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Danger Zone
              </h2>

              <p className="mt-1 text-xs text-white/35">
                High-impact lesson actions.
              </p>
            </div>

            <div className="p-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-medium text-red-400 transition hover:bg-red-400/15"
              >
                <Archive className="h-4 w-4" />
                Archive Lesson
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/65">
        {label}
        {required && <span className="ml-1 text-cyan-400">*</span>}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-400/40"
      />

      {helper && (
        <p className="mt-2 text-[10px] text-white/25">{helper}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/65">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-cyan-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0b1020]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Guideline({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />

      <p className="text-xs leading-5 text-white/40">{text}</p>
    </div>
  );
}