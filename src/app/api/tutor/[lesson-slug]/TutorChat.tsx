"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
}

interface TutorMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface TutorChatProps {
  lesson: Lesson;
}

const suggestions = [
  "Explain this lesson in simple words.",
  "What are the most important concepts in this lesson?",
  "Give me an example related to this lesson.",
  "Quiz me on this lesson.",
];

function TutorMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose prose-slate max-w-none text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-xl font-bold text-slate-900">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-lg font-bold text-slate-900">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-bold text-slate-900">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-sm font-bold text-slate-900">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="mb-3 last:mb-0">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),

          ul: ({ children }) => (
            <ul className="mb-3 ml-5 list-disc space-y-1">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-3 ml-5 list-decimal space-y-1">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-slate-300 pl-4 italic text-slate-600">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-4 border-slate-200" />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline hover:text-blue-800"
            >
              {children}
            </a>
          ),

          code: ({ children, className }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-6 text-slate-100">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-slate-900">
              {children}
            </pre>
          ),

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-slate-300 text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-100">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr className="border-b border-slate-200">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-slate-300 px-3 py-2">
              {children}
            </td>
          ),

          del: ({ children }) => (
            <del className="text-slate-500">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function TutorChat({
  lesson,
}: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>(
    [],
  );

  const [conversationId, setConversationId] = useState<
    string | null
  >(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // LOAD PERSISTENT LESSON HISTORY
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        setLoadingHistory(true);
        setError(null);

        const response = await fetch(
          `/api/tutor?lessonId=${encodeURIComponent(lesson.id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load Tutor history.",
          );
        }

        if (cancelled) {
          return;
        }

        setConversationId(
          data.conversation?.id ?? null,
        );

        const loadedMessages: TutorMessage[] = (
          data.messages ?? []
        )
          .filter(
            (message: TutorMessage) =>
              message.role === "user" ||
              message.role === "assistant",
          )
          .map((message: TutorMessage) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            created_at: message.created_at,
          }));

        setMessages(loadedMessages);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Tutor history loading error:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Tutor history.",
        );
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function sendMessage(question?: string) {
    const message = (question ?? input).trim();

    if (!message || loading || loadingHistory) {
      return;
    }

    setError(null);
    setLoading(true);

    const optimisticUserMessage: TutorMessage = {
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      optimisticUserMessage,
    ]);

    if (!question) {
      setInput("");
    }

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          question: message,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to get a response from the AI Tutor.",
        );
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: TutorMessage = {
        id: data.assistantMessage?.id,
        role: "assistant",
        content: data.answer,
        created_at:
          data.assistantMessage?.created_at,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (sendError) {
      console.error(
        "Tutor message error:",
        sendError,
      );

      // Remove the optimistic user message if
      // the request failed.
      setMessages((current) => {
        const copy = [...current];

        const lastIndex = copy.length - 1;

        if (
          lastIndex >= 0 &&
          copy[lastIndex].role === "user" &&
          copy[lastIndex].content === message
        ) {
          copy.pop();
        }

        return copy;
      });

      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to contact the AI Tutor.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // CLEAR / START NEW CONVERSATION
  // ==========================================================

  async function clearChat() {
    if (loading) {
      return;
    }

    setError(null);

    try {
      if (conversationId) {
        const response = await fetch(
          `/api/ai-tutor/conversations/${conversationId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isArchived: true,
            }),
          },
        );

        if (!response.ok) {
          const data = await response.json();

          throw new Error(
            data.error ||
              "Unable to clear the Tutor conversation.",
          );
        }
      }

      setMessages([]);
      setConversationId(null);
      setInput("");
    } catch (clearError) {
      console.error(
        "Tutor clear error:",
        clearError,
      );

      setError(
        clearError instanceof Error
          ? clearError.message
          : "Unable to clear the Tutor conversation.",
      );
    }
  }

  // ==========================================================
  // SUGGESTION CLICK
  // ==========================================================

  function handleSuggestion(
    suggestion: string,
  ) {
    sendMessage(suggestion);
  }

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Bot size={21} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">
                QuantumLearn Tutor
              </h2>

              <Sparkles
                size={15}
                className="text-amber-500"
              />
            </div>

            <p className="text-xs text-slate-500">
              Ask questions about this lesson
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={
            loading ||
            loadingHistory ||
            messages.length === 0
          }
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={14} />
          Clear
        </button>
      </div>

      {/* ======================================================
          CHAT AREA
      ====================================================== */}

      <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
        {loadingHistory ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
              Loading your Tutor history...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Bot
                size={30}
                className="text-slate-700"
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Ask your AI Tutor
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ask questions about{" "}
              <span className="font-medium text-slate-700">
                {lesson.title}
              </span>{" "}
              and I&apos;ll help you understand the
              concepts step by step.
            </p>

            <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {suggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      handleSuggestion(
                        suggestion,
                      )
                    }
                    disabled={loading}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map(
              (message, index) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={
                      message.id ??
                      `${message.role}-${index}`
                    }
                    className={`flex gap-3 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "rounded-br-md bg-slate-900 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap text-sm leading-7">
                          {message.content}
                        </div>
                      ) : (
                        <TutorMarkdown
                          content={
                            message.content
                          }
                        />
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Bot size={16} />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loadingHistory &&
        messages.length === 0 &&
        error && (
          <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* ======================================================
          SUGGESTIONS AFTER CHAT
      ====================================================== */}

      {!loadingHistory &&
        messages.length > 0 &&
        !loading && (
          <div className="border-t border-slate-200 bg-white px-5 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {suggestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      handleSuggestion(
                        suggestion,
                      )
                    }
                    disabled={loading}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-100"
                  >
                    <Lightbulb size={13} />
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

      {/* ======================================================
          INPUT
      ====================================================== */}

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={
              loading || loadingHistory
            }
            placeholder={
              loadingHistory
                ? "Loading Tutor..."
                : "Ask something about this lesson..."
            }
            rows={1}
            className="min-h-[46px] max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={
              !input.trim() ||
              loading ||
              loadingHistory
            }
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
          AI Tutor responses may occasionally contain
          mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}