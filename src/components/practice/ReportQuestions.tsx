"use client";

import { useState } from "react";

import type {
  PracticeReportReason,
} from "@/types/practice-report";

type ReportQuestionProps = {
  questionId: string;
  practiceResultId?: string | null;
};

const REPORT_REASONS: Array<{
  value: PracticeReportReason;
  label: string;
}> = [
  {
    value: "wrong_answer",
    label: "Wrong answer",
  },
  {
    value: "ambiguous_question",
    label: "Ambiguous question",
  },
  {
    value: "incorrect_explanation",
    label: "Incorrect explanation",
  },
  {
    value: "typo",
    label: "Typo",
  },
  {
    value: "too_difficult",
    label: "Too difficult",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function ReportQuestion({
  questionId,
  practiceResultId = null,
}: ReportQuestionProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [reason, setReason] =
    useState<PracticeReportReason | "">("");

  const [description, setDescription] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!reason) {
      setError(
        "Please select a reason for reporting this question.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/practice/question-report",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question_id: questionId,
            practice_result_id:
              practiceResultId,
            reason,
            description:
              description.trim() || null,
            page_url:
              window.location.pathname,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data?.error ??
            "Unable to submit the report.",
        );
        return;
      }

      setMessage(
        "Thanks. Your report has been submitted for review.",
      );

      setReason("");
      setDescription("");
    } catch (submitError) {
      console.error(
        "Failed to submit practice question report:",
        submitError,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setError(null);
            setMessage(null);
          }}
          className="text-sm font-medium text-black/45 underline decoration-black/20 underline-offset-4 transition-colors hover:text-red-600 hover:decoration-red-300"
        >
          Report Question
        </button>
      ) : (
        <div className="border border-black/10 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Question feedback
              </p>

              <h3 className="mt-2 text-lg font-medium tracking-tight">
                Report this question
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/50">
                Tell us what appears to be wrong so
                we can review and improve the question.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-black/40 transition-colors hover:text-black"
              aria-label="Close report form"
            >
              Close
            </button>
          </div>

          {message ? (
            <div className="mt-6 border border-emerald-600/20 bg-emerald-600/5 p-4 text-sm leading-6 text-emerald-700">
              {message}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6"
            >
              <fieldset disabled={isSubmitting}>
                <legend className="text-sm font-semibold">
                  What is wrong with this question?
                </legend>

                <div className="mt-4 grid gap-3">
                  {REPORT_REASONS.map(
                    (item) => (
                      <label
                        key={item.value}
                        className="flex cursor-pointer items-center gap-3 text-sm text-black/65"
                      >
                        <input
                          type="radio"
                          name={`report-reason-${questionId}`}
                          value={item.value}
                          checked={
                            reason ===
                            item.value
                          }
                          onChange={() =>
                            setReason(
                              item.value,
                            )
                          }
                          className="h-4 w-4 accent-blue-600"
                        />

                        <span>
                          {item.label}
                        </span>
                      </label>
                    ),
                  )}
                </div>

                <div className="mt-6">
                  <label
                    htmlFor={`report-description-${questionId}`}
                    className="text-sm font-semibold"
                  >
                    Additional details
                    <span className="ml-1 font-normal text-black/35">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id={`report-description-${questionId}`}
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    maxLength={2000}
                    rows={4}
                    placeholder="Tell us what should be corrected..."
                    className="mt-3 w-full resize-y border border-black/15 bg-[#f5f5f3] px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-black/30 focus:border-blue-600"
                  />

                  <div className="mt-2 text-right text-xs text-black/30">
                    {description.length}/2000
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 border border-red-600/20 bg-red-600/5 p-4 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !reason
                    }
                    className="bg-[#090c11] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Report"}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsOpen(false);
                      setReason("");
                      setDescription("");
                      setError(null);
                    }}
                    className="border border-black/15 px-5 py-3 text-sm font-semibold text-black/60 transition-colors hover:border-black/30 hover:text-black disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </div>
  );
}