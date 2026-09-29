"use client";

import { useState } from "react";
import Link from "next/link";

type FeedbackType =
  | "bug"
  | "feature"
  | "content"
  | "ai_response"
  | "general"
  | "support";

const feedbackTypes: Array<{
  value: FeedbackType;
  title: string;
  description: string;
}> = [
  {
    value: "bug",
    title: "Report a Bug",
    description: "Something is not working as expected.",
  },
  {
    value: "feature",
    title: "Suggest a Feature",
    description: "Tell us what would make QuantumLearn better.",
  },
  {
    value: "content",
    title: "Report Content Issue",
    description: "Report incorrect, missing, or unclear learning content.",
  },
  {
    value: "ai_response",
    title: "Report AI Response",
    description: "Tell us when an AI Tutor response is incorrect or unhelpful.",
  },
  {
    value: "general",
    title: "General Feedback",
    description: "Share your experience or suggestions.",
  },
  {
    value: "support",
    title: "Contact Support",
    description: "Get help with your account or platform experience.",
  },
];

const pageOptions = [
  "Dashboard",
  "Learn",
  "Practice",
  "Quantum Lab",
  "AI Tutor",
  "Questions",
  "Resources",
  "Account / Settings",
  "Other",
];

export default function FeedbackClient() {
  const [type, setType] = useState<FeedbackType>("bug");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState("");
  const [tryingToDo, setTryingToDo] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedType = feedbackTypes.find(
    (item) => item.value === type,
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!description.trim()) {
      setError("Please describe your feedback.");
      return;
    }

    if (description.trim().length < 10) {
      setError(
        "Please provide a little more detail so we can understand the issue.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("type", type);
      formData.append("description", description.trim());
      formData.append("page", page);
      formData.append("tryingToDo", tryingToDo.trim());

      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to submit feedback.",
        );
      }

      setMessage(
        "Thank you. Your feedback has been submitted successfully.",
      );

      setDescription("");
      setTryingToDo("");
      setPage("");
      setScreenshot(null);

      const input =
        document.getElementById(
          "feedback-screenshot",
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (submitError) {
      console.error(
        "Feedback submission failed:",
        submitError,
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 py-8 sm:px-10 lg:px-16">
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40 transition-colors hover:text-blue-600"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-16 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Feedback center
            </p>

            <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Help us improve
              <span className="block text-black/35">
                QuantumLearn AI.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              Report problems, suggest improvements, or tell us
              how your learning experience can be better.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          {/* =================================================
              FEEDBACK TYPES
          ================================================= */}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              Feedback type
            </p>

            <div className="mt-6 space-y-1">
              {feedbackTypes.map((item) => {
                const active = item.value === type;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setType(item.value);
                      setError("");
                      setMessage("");
                    }}
                    className={`w-full border-l-2 px-5 py-5 text-left transition-all ${
                      active
                        ? "border-blue-600 bg-white"
                        : "border-transparent hover:border-black/20 hover:bg-white/60"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        active
                          ? "text-blue-600"
                          : "text-[#111318]"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                {selectedType?.title}
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                {selectedType?.description}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="feedback-description"
                  className="text-sm font-semibold"
                >
                  {type === "bug"
                    ? "What happened?"
                    : type === "feature"
                      ? "What would you like us to add?"
                      : type === "ai_response"
                        ? "What was wrong with the AI response?"
                        : "Tell us what you think"}
                </label>

                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder={
                    type === "bug"
                      ? "Describe what happened and what you expected to happen..."
                      : type === "feature"
                        ? "Describe the feature or improvement you would like..."
                        : type === "ai_response"
                          ? "Explain what the AI response got wrong or how it could be improved..."
                          : "Write your feedback here..."
                  }
                  rows={7}
                  maxLength={5000}
                  className="mt-3 w-full resize-y border border-black/15 bg-white px-5 py-4 text-sm leading-6 outline-none transition-colors placeholder:text-black/30 focus:border-blue-600"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-black/30">
                    {description.length}/5000
                  </span>
                </div>
              </div>

              {/* PAGE */}

              <div>
                <label
                  htmlFor="feedback-page"
                  className="text-sm font-semibold"
                >
                  Where did it happen?
                </label>

                <select
                  id="feedback-page"
                  value={page}
                  onChange={(event) =>
                    setPage(event.target.value)
                  }
                  className="mt-3 w-full appearance-none border border-black/15 bg-white px-5 py-4 text-sm outline-none transition-colors focus:border-blue-600"
                >
                  <option value="">
                    Select a section
                  </option>

                  {pageOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* TRYING TO DO */}

              {(type === "bug" ||
                type === "support" ||
                type === "content") && (
                <div>
                  <label
                    htmlFor="feedback-action"
                    className="text-sm font-semibold"
                  >
                    What were you trying to do?
                  </label>

                  <textarea
                    id="feedback-action"
                    value={tryingToDo}
                    onChange={(event) =>
                      setTryingToDo(
                        event.target.value,
                      )
                    }
                    placeholder="Describe the action you were trying to perform..."
                    rows={4}
                    maxLength={2000}
                    className="mt-3 w-full resize-y border border-black/15 bg-white px-5 py-4 text-sm leading-6 outline-none transition-colors placeholder:text-black/30 focus:border-blue-600"
                  />
                </div>
              )}

              {/* SCREENSHOT */}

              <div>
                <label
                  htmlFor="feedback-screenshot"
                  className="text-sm font-semibold"
                >
                  Screenshot
                  <span className="ml-2 font-normal text-black/35">
                    Optional
                  </span>
                </label>

                <div className="mt-3 border border-dashed border-black/20 bg-white px-5 py-7">
                  <input
                    id="feedback-screenshot"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      setScreenshot(
                        event.target.files?.[0] ??
                          null,
                      )
                    }
                    className="block w-full text-sm text-black/50 file:mr-4 file:border-0 file:bg-[#111318] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-600"
                  />

                  <p className="mt-3 text-xs text-black/35">
                    PNG, JPG, or WebP. Maximum 5 MB.
                  </p>

                  {screenshot && (
                    <p className="mt-3 text-xs font-medium text-blue-600">
                      Selected: {screenshot.name}
                    </p>
                  )}
                </div>
              </div>

              {/* AUTOMATIC CONTEXT */}

              <div className="border-y border-black/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                  Automatically captured
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <ContextItem
                    label="Account"
                    value="Your authenticated account"
                  />

                  <ContextItem
                    label="Page"
                    value="Current feedback page"
                  />

                  <ContextItem
                    label="Browser"
                    value="Automatically detected"
                  />

                  <ContextItem
                    label="Timestamp"
                    value="Automatically recorded"
                  />
                </div>

                <p className="mt-5 text-xs leading-5 text-black/35">
                  This information helps us reproduce problems
                  and investigate reports. We do not require you
                  to manually enter it.
                </p>
              </div>

              {/* MESSAGES */}

              {error && (
                <div
                  role="alert"
                  className="border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="border-l-2 border-green-600 bg-green-50 px-5 py-4 text-sm leading-6 text-green-700"
                >
                  {message}
                </div>
              )}

              {/* SUBMIT */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-black/35">
                  Please avoid submitting passwords, private
                  keys, or other sensitive information.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="shrink-0 bg-[#090c11] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContextItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-black/30">
        {label}
      </p>

      <p className="mt-1 text-sm text-black/55">
        {value}
      </p>
    </div>
  );
}