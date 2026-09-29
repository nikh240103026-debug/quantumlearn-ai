"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDown,
  FileCode2,
  Flame,
  ImagePlus,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Star,
  ThumbsUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

import type { CommunityQuestion } from "@/types/community";

const TOPICS = [
  "Quantum Computing",
  "Quantum Gates",
  "Quantum Circuits",
  "Quantum Algorithms",
  "Quantum Mathematics",
  "Quantum Programming",
  "Quantum Hardware",
  "Quantum Error Correction",
  "Other",
];

const FILTERS = [
  ["all", "All Questions"],
  ["mine", "My Questions"],
  ["unanswered", "Unanswered"],
  ["answered", "Answered"],
  ["popular", "Popular"],
] as const;

function initials(name: string | null | undefined) {
  return (name || "Learner")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProfileMini({
  question,
}: {
  question: CommunityQuestion;
}) {
  const author = question.author;

  const name =
    author?.full_name ||
    author?.username ||
    "Learner";

  return (
    <div className="flex items-center gap-3">
      {author?.avatar_url ? (
        <div
          className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${author.avatar_url})`,
          }}
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {initials(name)}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {name}
        </p>

        <p className="truncate text-xs text-white/35">
          {author?.role || "Learner"} ·{" "}
          {formatDate(question.created_at)}
        </p>
      </div>
    </div>
  );
}

export default function QuestionsClient() {
  const [questions, setQuestions] = useState<
    CommunityQuestion[]
  >([]);

  const [filter, setFilter] = useState<
    (typeof FILTERS)[number][0]
  >("all");

  const [topic, setTopic] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAsk, setShowAsk] = useState(false);

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        filter,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (topic !== "all") {
        params.set("topic", topic);
      }

      const response = await fetch(
        `/api/questions?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load questions.",
        );
      }

      setQuestions(
        Array.isArray(data?.questions)
          ? data.questions
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load questions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestions();

    // Search is intentionally triggered by the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, topic]);

  function submitSearch(
    event: React.FormEvent,
  ) {
    event.preventDefault();
    void loadQuestions();
  }

  return (
    <main className="min-h-screen bg-[#090c11] text-white">
      {/* HERO */}

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative mx-auto max-w-[1500px] px-6 py-20 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-blue-500" />

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                  Quantum community
                </p>
              </div>

              <h1 className="text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                Questions worth
                <br />
                <span className="text-white/35">
                  learning from.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
                Ask doubts, share explanations, and
                build a searchable knowledge base with
                other quantum learners.
              </p>
            </div>

            <button
              onClick={() => setShowAsk(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Ask a Question
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}

      <section className="mx-auto max-w-[1500px] px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-4 lg:flex-row">
          <form
            onSubmit={submitSearch}
            className="relative flex-1"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search questions, concepts, or topics..."
              className="h-12 w-full bg-white/[0.05] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/[0.08]"
            />
          </form>

          <label className="relative">
            <span className="sr-only">
              Topic
            </span>

            <select
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              className="h-12 min-w-56 appearance-none bg-white/[0.05] px-4 pr-10 text-sm text-white outline-none"
            >
              <option
                value="all"
                className="bg-[#11151c]"
              >
                All topics
              </option>

              {TOPICS.map((item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-[#11151c]"
                >
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </label>
        </div>

        <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
          {FILTERS.map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setFilter(value)
                }
                className={`shrink-0 pb-3 text-sm font-semibold transition ${
                  filter === value
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-white/35 hover:text-white/70"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {/* QUESTIONS */}

        <div className="mt-8">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center text-white/40">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Loading questions...
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-300">
                {error}
              </p>

              <button
                onClick={() =>
                  void loadQuestions()
                }
                className="mt-5 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Try again
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-20 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-white/15" />

              <h2 className="mt-5 text-2xl font-medium">
                No questions found.
              </h2>

              <p className="mt-3 text-sm text-white/35">
                Be the first to ask about
                something you are learning.
              </p>

              <button
                onClick={() =>
                  setShowAsk(true)
                }
                className="mt-7 bg-blue-600 px-5 py-3 text-sm font-semibold"
              >
                Ask the first question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map(
                (question) => (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="group block bg-white/[0.035] p-6 transition hover:bg-white/[0.06] sm:p-7"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div>
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

                        <h2 className="mt-4 max-w-4xl text-2xl font-medium tracking-[-0.03em] transition group-hover:text-blue-300 sm:text-3xl">
                          {question.title}
                        </h2>

                        <p className="mt-3 line-clamp-2 max-w-4xl text-sm leading-6 text-white/40">
                          {question.description}
                        </p>

                        <div className="mt-6">
                          <ProfileMini
                            question={
                              question
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6 lg:w-64 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                        <Stat
                          icon={
                            <ThumbsUp className="h-3.5 w-3.5" />
                          }
                          value={
                            question.vote_count
                          }
                          label="Votes"
                          active={
                            question.has_voted
                          }
                        />

                        <Stat
                          icon={
                            <MessageCircle className="h-3.5 w-3.5" />
                          }
                          value={
                            question.answer_count
                          }
                          label="Answers"
                          active={Boolean(
                            question.accepted_answer_id,
                          )}
                        />

                        <Stat
                          icon={
                            <Users className="h-3.5 w-3.5" />
                          }
                          value={
                            question.view_count
                          }
                          label="Views"
                        />

                        <Stat
                          icon={
                            <Star className="h-3.5 w-3.5" />
                          }
                          value={
                            question.is_following
                              ? "Following"
                              : "Follow"
                          }
                          label=""
                          active={
                            question.is_following
                          }
                        />
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {showAsk && (
        <AskQuestionModal
          onClose={() =>
            setShowAsk(false)
          }
          onCreated={(id) => {
            window.location.href =
              `/questions/${id}`;
          }}
        />
      )}
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
  active,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`text-center ${
        active
          ? "text-blue-400"
          : "text-white/45"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 text-sm font-semibold">
        {icon}
        {value}
      </div>

      {label && (
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>
      )}
    </div>
  );
}

function AskQuestionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    [],
  );

  const fileRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [topic, setTopic] =
    useState(TOPICS[0]);

  const [description, setDescription] =
    useState("");

  const [code, setCode] = useState("");
  const [circuit, setCircuit] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      let attachmentUrl:
        | string
        | undefined;

      let attachmentType:
        | "image"
        | "file"
        | undefined;

      if (file) {
        if (!file.type.startsWith("image/")) {
          throw new Error(
            "Only image attachments are supported right now.",
          );
        }

        if (
          file.size >
          5 * 1024 * 1024
        ) {
          throw new Error(
            "Image must be 5 MB or smaller.",
          );
        }

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) {
          window.location.href =
            "/login";
          return;
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const path = `${user.id}/question-${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "community-attachments",
          )
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            uploadError.message,
          );
        }

        const { data } =
          supabase.storage
            .from(
              "community-attachments",
            )
            .getPublicUrl(path);

        attachmentUrl =
          data.publicUrl;

        attachmentType =
          "image";
      }

      const response = await fetch(
        "/api/questions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            topic,
            description,
            code: code || null,
            circuit_data:
              circuit || null,
            attachment_url:
              attachmentUrl,
            attachment_type:
              attachmentType,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to post question.",
        );
      }

      onCreated(
        data.questionId,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to post question.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-[#10141b] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              Community
            </p>

            <h2 className="mt-1 text-2xl font-medium">
              Ask a Question
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 px-6 pb-8 sm:px-8"
        >
          <Field label="Title">
            <input
              required
              minLength={8}
              maxLength={180}
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value,
                )
              }
              placeholder="Why does CNOT create entanglement?"
              className="field"
            />
          </Field>

          <Field label="Topic">
            <select
              value={topic}
              onChange={(e) =>
                setTopic(
                  e.target.value,
                )
              }
              className="field"
            >
              {TOPICS.map((item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-[#10141b]"
                >
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              required
              minLength={10}
              maxLength={12000}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              rows={7}
              placeholder="Explain what you are misunderstanding, what you tried, and where you got stuck..."
              className="field resize-y"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                fileRef.current?.click()
              }
              className="attachment-button"
            >
              <ImagePlus className="h-4 w-4" />
              Image
            </button>

            <button
              type="button"
              onClick={() =>
                setCode((value) =>
                  value ? "" : " ",
                )
              }
              className="attachment-button"
            >
              <FileCode2 className="h-4 w-4" />
              Code
            </button>

            <button
              type="button"
              onClick={() =>
                setCircuit((value) =>
                  value ? "" : " ",
                )
              }
              className="attachment-button"
            >
              <Flame className="h-4 w-4" />
              Circuit JSON
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] ??
                  null,
              )
            }
          />

          {file && (
            <p className="text-xs text-white/45">
              Attached: {file.name}
            </p>
          )}

          {code !== "" && (
            <Field label="Code">
              <textarea
                value={code.trim() ? code : ""}
                onChange={(e) =>
                  setCode(
                    e.target.value,
                  )
                }
                rows={6}
                placeholder="Paste your quantum code here..."
                className="field font-mono text-xs"
              />
            </Field>
          )}

          {circuit !== "" && (
            <Field label="Circuit JSON">
              <textarea
                value={
                  circuit.trim()
                    ? circuit
                    : ""
                }
                onChange={(e) =>
                  setCircuit(
                    e.target.value,
                  )
                }
                rows={6}
                placeholder='{"qubits":2,"gates":[]}'
                className="field font-mono text-xs"
              />
            </Field>
          )}

          {error && (
            <p className="bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-semibold text-white/50 hover:text-white"
            >
              Cancel
            </button>

            <button
              disabled={busy}
              className="inline-flex items-center gap-2 bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {busy && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
        {label}
      </span>

      {children}
    </label>
  );
}