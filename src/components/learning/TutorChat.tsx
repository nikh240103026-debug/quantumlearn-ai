"use client";

import { useState } from "react";
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
  role: "user" | "assistant";
  content: string;
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

/**
 * Render AI Tutor responses as Markdown.
 *
 * This allows the AI response to properly render:
 * - **bold**
 * - *italic*
 * - headings
 * - numbered lists
 * - bullet lists
 * - inline code
 * - code blocks
 * - blockquotes
 * - tables
 * - links
 */
function TutorMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="break-words text-sm leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-1 text-xl font-bold text-slate-950">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-lg font-bold text-slate-950">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-bold text-slate-950">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-sm font-semibold text-slate-950">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-7">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-bold text-slate-950">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1 leading-7">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-slate-300 pl-4 italic text-slate-600">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-5 border-slate-200" />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              {children}
            </a>
          ),

          code: ({
            className,
            children,
          }) => {
            const isCodeBlock =
              Boolean(className);

            if (isCodeBlock) {
              return (
                <code className="block whitespace-pre font-mono text-sm leading-6 text-slate-100">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
              {children}
            </pre>
          ),

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[500px] border-collapse text-sm">
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
            <tr className="border-b border-slate-200 last:border-b-0">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-950">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-3 py-2 text-left text-slate-700">
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
  const [messages, setMessages] = useState<
    TutorMessage[]
  >([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function sendMessage(question?: string) {
    const message = (question ?? input).trim();

    if (!message || loading) {
      return;
    }

    setError("");

    const userMessage: TutorMessage = {
      role: "user",
      content: message,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          question: message,
          messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong while contacting the AI Tutor.",
        );
      }

      const assistantMessage: TutorMessage = {
        role: "assistant",
        content:
          typeof data.answer === "string"
            ? data.answer
            : "I wasn't able to generate a response.",
      };

      setMessages([
        ...updatedMessages,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Tutor chat error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );

      // Remove the user message if the request failed.
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void sendMessage();
  }

  function handleSuggestion(
    suggestion: string,
  ) {
    void sendMessage(suggestion);
  }

  function clearConversation() {
    setMessages([]);
    setError("");
    setInput("");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Bot size={20} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">
              QuantumLearn Tutor
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-xs text-slate-500">
                Ready to help
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={clearConversation}
          disabled={
            loading ||
            messages.length === 0
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={13} />
          Clear
        </button>
      </div>

      {/* =====================================================
          CHAT AREA
      ===================================================== */}

      <div className="min-h-[500px] bg-slate-50/70 p-4 sm:p-6">
        {/* Empty state */}

        {messages.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <Sparkles size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Ask your AI Tutor
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ask anything about{" "}
              <span className="font-semibold text-slate-700">
                {lesson.title}
              </span>
              . The tutor will use this lesson as context when answering.
            </p>

            <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {/* Conversation */}

        {messages.length > 0 && (
          <div className="space-y-5">
            {messages.map(
              (message, index) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "items-start"
                    }`}
                  >
                    {isUser ? (
                      <div className="flex max-w-[88%] items-end gap-2">
                        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                          {message.content}
                        </div>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                          <User size={15} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex max-w-[92%] items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                          <Bot size={15} />
                        </div>

                        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
                          <TutorMarkdown
                            content={
                              message.content
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}

            {/* Loading */}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                  <Bot size={15} />
                </div>

                <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="mt-2 text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          SUGGESTIONS
      ===================================================== */}

      {messages.length > 0 && (
        <div className="border-t border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb
              size={14}
              className="text-amber-500"
            />

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Suggested questions
            </p>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
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
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
        >
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={loading}
            placeholder="Ask your quantum question..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={
              loading || !input.trim()
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          AI-generated guidance. Always verify important information.
        </p>
      </div>
    </div>
  );
}