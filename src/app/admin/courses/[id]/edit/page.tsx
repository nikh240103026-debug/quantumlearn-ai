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
} from "lucide-react";

export default function AdminEditCoursePage() {
  const params = useParams();
  const courseId = params?.id;

  const [title, setTitle] = useState("Quantum Computing Fundamentals");
  const [slug, setSlug] = useState("quantum-foundations");
  const [description, setDescription] = useState(
    "Core concepts, qubits, superposition, measurement, entanglement, and the foundations required to understand quantum computing.",
  );
  const [status, setStatus] = useState("Published");
  const [category, setCategory] = useState("Quantum Computing");
  const [level, setLevel] = useState("Beginner");
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Learning Management
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Edit Course
          </h1>

          <p className="mt-2 text-sm text-white/45">
            Update course information and publication settings.
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
          Course changes saved successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Course Details
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Basic information displayed throughout the platform.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <FormField
                label="Course Title"
                required
                value={title}
                onChange={setTitle}
                placeholder="Enter course title"
              />

              <FormField
                label="Course Slug"
                required
                value={slug}
                onChange={setSlug}
                placeholder="course-slug"
                helper="Used as part of the public course URL."
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
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  placeholder="Describe this course..."
                  className="w-full resize-y border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-cyan-400/40"
                />

                <p className="mt-2 text-[10px] text-white/25">
                  {description.length} characters
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  options={[
                    "Quantum Computing",
                    "Quantum Algorithms",
                    "Quantum Information",
                    "Quantum Programming",
                  ]}
                />

                <SelectField
                  label="Difficulty"
                  value={level}
                  onChange={setLevel}
                  options={[
                    "Beginner",
                    "Basic",
                    "Intermediate",
                    "Advanced",
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Course Structure
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Course chapters and lessons are managed separately.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between border border-white/10 bg-black/10 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    6 Chapters
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    24 lessons currently configured.
                  </p>
                </div>

                <Link
                  href={`/admin/courses/${courseId}`}
                  className="text-xs text-cyan-400 transition hover:text-cyan-300"
                >
                  Manage Structure
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Publication
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Control the visibility of this course.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-xs font-medium text-white/65"
                >
                  Status
                </label>

                <select
                  id="status"
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
                    Published courses are visible to learners. Make sure all
                    lesson content and practice questions are ready before
                    publishing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Publication Settings"}
              </button>
            </div>
          </section>

          <section className="border border-red-400/10 bg-red-400/[0.02]">
            <div className="border-b border-red-400/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Danger Zone
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Irreversible or high-impact course actions.
              </p>
            </div>

            <div className="p-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-medium text-red-400 transition hover:bg-red-400/15"
              >
                <Archive className="h-4 w-4" />
                Archive Course
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
