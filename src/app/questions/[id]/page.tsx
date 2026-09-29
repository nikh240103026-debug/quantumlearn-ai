"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Flag,
  Loader2,
  ThumbsUp,
  Trash2,
  UserPlus,
} from "lucide-react";

import type {
  CommunityAnswer,
  CommunityQuestion,
} from "@/types/community";

function initials(
  name: string | null | undefined,
) {
  return (name || "Learner")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function date(value: string) {
  const d = new Date(value);

  return Number.isNaN(d.getTime())
    ? "Recently"
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function nameOf(
  profile: CommunityQuestion["author"],
) {
  return (
    profile?.full_name ||
    profile?.username ||
    "Learner"
  );
}

export default function QuestionDetailPage() {
  const params =
    useParams<{ id: string }>();

  const id = params.id;

  const [question, setQuestion] =
    useState<CommunityQuestion | null>(
      null,
    );

  const [answers, setAnswers] =
    useState<CommunityAnswer[]>([]);

  const [viewerId, setViewerId] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function load() {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/questions/${id}`,
        {
          cache: "no-store",
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load question.",
        );
      }

      setQuestion(data.question);
      setAnswers(data.answers ?? []);
      setViewerId(
        data.viewer_id ?? "",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load question.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function action(
    payload: Record<string, unknown>,
  ) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/questions/${id}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Action failed.",
        );
      }

      await load();

      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Action failed.",
      );

      return null;
    } finally {
      setBusy(false);
    }
  }

  async function postAnswer(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!answer.trim()) {
      return;
    }

    const result = await action({
      action: "answer",
      body: answer,
    });

    if (result) {
      setAnswer("");
      setMessage("Answer posted.");
    }
  }

  async function deleteQuestion() {
    if (
      !window.confirm(
        "Delete this question? This cannot be undone.",
      )
    ) {
      return;
    }

    setBusy(true);

    const response = await fetch(
      `/api/questions/${id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const data =
        await response
          .json()
          .catch(() => null);

      setError(
        data?.error ||
          "Unable to delete question.",
      );

      setBusy(false);
      return;
    }

    window.location.href =
      "/questions";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090c11] text-white">
        <div className="flex min-h-[70vh] items-center justify-center text-white/40">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading question...
        </div>
      </main>
    );
  }

  if (error && !question) {
    return (
      <main className="min-h-screen bg-[#090c11] px-6 py-20 text-center text-white">
        <p className="text-red-300">
          {error}
        </p>

        <Link
          href="/questions"
          className="mt-6 inline-flex text-sm font-semibold text-blue-400"
        >
          Back to questions
        </Link>
      </main>
    );
  }

  if (!question) {
    return null;
  }

  const questionAuthorName =
    nameOf(question.author);

  return (
    <main className="min-h-screen bg-[#090c11] text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:px-16">
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Questions
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          <article>
            <div className="flex flex-wrap items-center gap-2">
              {question.topic && (
                <span className="bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-400">
                  {question.topic}
                </span>
              )}

              <span
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  question.status ===
                  "answered"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {question.status ===
                "answered"
                  ? "Answered"
                  : "Unanswered"}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">
              {question.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/35">
              <span>
                {question.view_count} views
              </span>

              <span>
                Asked{" "}
                {date(
                  question.created_at,
                )}
              </span>

              {question.accepted_answer_id && (
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accepted answer
                </span>
              )}
            </div>

            <div className="mt-10 whitespace-pre-wrap text-base leading-8 text-white/70">
              {question.description}
            </div>

            {question.attachment_url && (
              <a
                href={
                  question.attachment_url
                }
                target="_blank"
                rel="noreferrer"
                className="mt-8 block overflow-hidden bg-white/[0.035] p-3"
              >
                <div className="text-xs text-white/35">
                  Attached image
                </div>

                <div
                  className="mt-3 min-h-64 w-full bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${question.attachment_url})`,
                  }}
                  aria-label="Question attachment"
                  role="img"
                />
              </a>
            )}

            {question.code && (
              <pre className="mt-8 overflow-x-auto bg-black/30 p-5 text-xs leading-6 text-white/65">
                <code>
                  {question.code}
                </code>
              </pre>
            )}

            {question.circuit_data && (
              <pre className="mt-4 overflow-x-auto bg-black/30 p-5 text-xs leading-6 text-white/65">
                <code>
                  {JSON.stringify(
                    question.circuit_data,
                    null,
                    2,
                  )}
                </code>
              </pre>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                disabled={busy}
                onClick={() =>
                  void action({
                    action:
                      "question_vote",
                  })
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold ${
                  question.has_voted
                    ? "bg-blue-600 text-white"
                    : "bg-white/[0.06] text-white/55 hover:text-white"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                {question.vote_count}
              </button>

              <button
                disabled={busy}
                onClick={() =>
                  void action({
                    action: "follow",
                  })
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold ${
                  question.is_following
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-white/55 hover:text-white"
                }`}
              >
                <UserPlus className="h-4 w-4" />

                {question.is_following
                  ? "Following"
                  : "Follow"}
              </button>

              <button
                disabled={busy}
                onClick={() =>
                  void action({
                    action: "report",
                    reason: "other",
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/35 hover:text-red-300"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>

              {question.user_id ===
                viewerId && (
                <button
                  disabled={busy}
                  onClick={() =>
                    void deleteQuestion()
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/35 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>

            <div className="mt-16 flex items-center gap-4 bg-white/[0.035] p-5">
              {question.author
                ?.avatar_url ? (
                <div
                  className="h-12 w-12 shrink-0 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${question.author.avatar_url})`,
                  }}
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {initials(
                    questionAuthorName,
                  )}
                </div>
              )}

              <div>
                <p className="font-semibold">
                  {questionAuthorName}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  {question.author?.role ||
                    "Learner"}

                  {question.author
                    ?.branch
                    ? ` · ${question.author.branch}`
                    : ""}

                  {question.author
                    ?.institute
                    ? ` · ${question.author.institute}`
                    : ""}
                </p>

                {question.author
                  ?.bio && (
                  <p className="mt-2 max-w-2xl text-sm text-white/40">
                    {
                      question.author
                        .bio
                    }
                  </p>
                )}
              </div>
            </div>

            {/* ANSWERS */}

            <section className="mt-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Community answers
                </p>

                <h2 className="mt-3 text-3xl font-medium">
                  {answers.length}{" "}
                  {answers.length === 1
                    ? "answer"
                    : "answers"}
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {answers.map(
                  (item) => (
                    <AnswerCard
                      key={item.id}
                      answer={item}
                      viewerId={
                        viewerId
                      }
                      questionOwnerId={
                        question.user_id
                      }
                      busy={busy}
                      onAction={action}
                    />
                  ),
                )}
              </div>
            </section>

            {/* ANSWER FORM */}

            <form
              onSubmit={postAnswer}
              className="mt-12 bg-white/[0.035] p-6 sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                Your answer
              </p>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(
                    e.target.value,
                  )
                }
                rows={8}
                maxLength={12000}
                placeholder="Share a clear explanation, reasoning, code, or a useful reference..."
                className="mt-5 w-full resize-y bg-white/[0.05] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:bg-white/[0.08]"
              />

              {error && (
                <p className="mt-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              {message && (
                <p className="mt-3 text-sm text-emerald-300">
                  {message}
                </p>
              )}

              <button
                disabled={
                  busy ||
                  !answer.trim()
                }
                className="mt-5 inline-flex items-center gap-2 bg-blue-600 px-6 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Post Answer
              </button>
            </form>
          </article>

          {/* SIDEBAR */}

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white/[0.035] p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-white/30">
                Question activity
              </p>

              <div className="mt-6 grid grid-cols-2 gap-5">
                <SideStat
                  value={
                    question.vote_count
                  }
                  label="Votes"
                />

                <SideStat
                  value={
                    answers.length
                  }
                  label="Answers"
                />

                <SideStat
                  value={
                    question.view_count
                  }
                  label="Views"
                />

                <SideStat
                  value={
                    question.is_following
                      ? "Yes"
                      : "No"
                  }
                  label="Following"
                />
              </div>
            </div>

            <div className="bg-white/[0.035] p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-white/30">
                Community rule
              </p>

              <p className="mt-4 text-sm leading-6 text-white/45">
                Be precise, respectful,
                and educational. Share
                reasoning rather than only
                the final answer.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function AnswerCard({
  answer,
  viewerId,
  questionOwnerId,
  busy,
  onAction,
}: {
  answer: CommunityAnswer;
  viewerId: string;
  questionOwnerId: string;
  busy: boolean;
  onAction: (
    payload: Record<string, unknown>,
  ) => Promise<unknown>;
}) {
  const name = nameOf(
    answer.author,
  );

  return (
    <article
      className={`bg-white/[0.035] p-6 sm:p-7 ${
        answer.is_accepted
          ? "ring-1 ring-emerald-400/30"
          : ""
      }`}
    >
      {answer.is_accepted && (
        <div className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Accepted answer
        </div>
      )}

      <div className="whitespace-pre-wrap text-sm leading-7 text-white/70">
        {answer.body}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {answer.author
            ?.avatar_url ? (
            <div
              className="h-9 w-9 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${answer.author.avatar_url})`,
              }}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
              {initials(name)}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold">
              {name}
            </p>

            <p className="text-xs text-white/30">
              {answer.author?.role ||
                "Learner"}{" "}
              ·{" "}
              {date(
                answer.created_at,
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={busy}
            onClick={() =>
              void onAction({
                action:
                  "answer_vote",
                answer_id:
                  answer.id,
              })
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${
              answer.has_voted
                ? "bg-blue-600"
                : "bg-white/[0.06] text-white/50"
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {answer.vote_count}
          </button>

          {questionOwnerId ===
            viewerId &&
            !answer.is_accepted && (
              <button
                disabled={busy}
                onClick={() =>
                  void onAction({
                    action:
                      "accept_answer",
                    answer_id:
                      answer.id,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/10"
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </button>
            )}

          <button
            disabled={busy}
            onClick={() =>
              void onAction({
                action: "report",
                answer_id:
                  answer.id,
                reason: "other",
              })
            }
            className="p-2 text-white/25 hover:text-red-300"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SideStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-medium">
        {value}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>
    </div>
  );
}