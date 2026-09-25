"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type TutorContext = {
  topic?: string;
  chapter?: number | string;
  lessonId?: string;
  lessonSlug?: string;
  source?: string;
  reason?: string;
  [key: string]: unknown;
};

type Conversation = {
  id: string;
  title: string;
  context_type?: string | null;
  context?: TutorContext | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
};

type Message = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

type PersistentAITutorProps = {
  initialTopic?: string;
  initialContext?: TutorContext;
  compact?: boolean;
  pageMode?: boolean;
  className?: string;
};

const DEFAULT_WELCOME_MESSAGE =
  "Hello! I'm your QuantumLearn AI Tutor. Ask me anything about quantum computing, your current lessons, practice, or concepts you're struggling with.";

const MAX_MESSAGE_LENGTH = 8000;

function formatConversationTitle(title: string): string {
  const cleaned = title.trim();

  if (!cleaned) {
    return "New conversation";
  }

  return cleaned.length > 45
    ? `${cleaned.slice(0, 42)}...`
    : cleaned;
}

async function readApiResponse(response: Response): Promise<{
  data: Record<string, unknown>;
  text: string;
}> {
  const text = await response.text();

  if (!text.trim()) {
    return {
      data: {},
      text: "",
    };
  }

  try {
    const parsed = JSON.parse(text);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return {
        data: parsed as Record<string, unknown>,
        text,
      };
    }

    return {
      data: {},
      text,
    };
  } catch {
    return {
      data: {},
      text,
    };
  }
}

function TutorMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="tutor-markdown max-w-none break-words text-[15px] leading-7 text-[#2f2f2f] dark:text-[#ececec]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-1 text-2xl font-semibold tracking-tight text-[#171717] dark:text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-[#171717] dark:text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-semibold text-[#171717] dark:text-white">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mb-2 mt-5 text-base font-semibold text-[#171717] dark:text-white">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-7">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-[#171717] dark:text-white">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-1.5">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1.5">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1 leading-7">{children}</li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-[#d1d1d1] pl-4 italic text-[#666] dark:border-[#555] dark:text-[#aaa]">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-6 border-[#e5e5e5] dark:border-[#444]" />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8] dark:text-[#60a5fa] dark:hover:text-[#93c5fd]"
            >
              {children}
            </a>
          ),

          code: ({ className, children }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return (
                <code className="block whitespace-pre font-mono text-[13px] leading-6">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md bg-[#f1f1f1] px-1.5 py-0.5 font-mono text-[0.9em] text-[#333] dark:bg-[#2f2f2f] dark:text-[#ddd]">
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-xl bg-[#171717] p-4 text-sm leading-6 text-[#f5f5f5] dark:bg-black">
              {children}
            </pre>
          ),

          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#444]">
              <table className="w-full min-w-[500px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-[#f7f7f7] dark:bg-[#2a2a2a]">
              {children}
            </thead>
          ),

          tbody: ({ children }) => <tbody>{children}</tbody>,

          tr: ({ children }) => (
            <tr className="border-b border-[#e5e5e5] last:border-b-0 dark:border-[#444]">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-[#171717] dark:text-white">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-3 py-2 text-left text-[#555] dark:text-[#ccc]">
              {children}
            </td>
          ),

          del: ({ children }) => (
            <del className="text-[#777]">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function PersistentAITutor({
  initialTopic,
  initialContext = {},
  compact = false,
  pageMode = false,
  className = "",
}: PersistentAITutorProps) {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [deletingConversationId, setDeletingConversationId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(
    !compact && !pageMode,
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const conversationsRequestRef = useRef(0);

  const messagesRequestRef = useRef(0);

  const mountedRef = useRef(true);

  const context = useMemo<TutorContext>(
    () => ({
      ...initialContext,
      ...(initialTopic
        ? {
            topic: initialTopic,
          }
        : {}),
    }),
    [initialContext, initialTopic],
  );

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedConversationId,
    ) ?? null;

  /*
   * IMPORTANT:
   *
   * Lock the document itself while the tutor page is mounted.
   *
   * This prevents the outer Next.js page from scrolling.
   * Only the sidebar and message area are allowed to scroll.
   */
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    const previousHeight =
      document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.body.style.height =
        previousHeight;
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadConversations = useCallback(
    async (preserveSelection = true) => {
      const requestId =
        ++conversationsRequestRef.current;

      try {
        if (mountedRef.current) {
          setLoadingConversations(true);
        }

        const response = await fetch(
          "/api/ai-tutor/conversations",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const { data } =
          await readApiResponse(response);

        if (
          !mountedRef.current ||
          requestId !==
            conversationsRequestRef.current
        ) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : `Unable to load conversations (${response.status}).`,
          );
        }

        const loaded = Array.isArray(
          data.conversations,
        )
          ? (data.conversations as Conversation[])
          : [];

        setConversations(loaded);

        if (!preserveSelection) {
          setSelectedConversationId(
            loaded.length > 0
              ? loaded[0].id
              : null,
          );

          return;
        }

        setSelectedConversationId(
          (currentSelectedId) => {
            if (
              currentSelectedId &&
              loaded.some(
                (conversation) =>
                  conversation.id ===
                  currentSelectedId,
              )
            ) {
              return currentSelectedId;
            }

            return loaded.length > 0
              ? loaded[0].id
              : null;
          },
        );
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !==
            conversationsRequestRef.current
        ) {
          return;
        }

        console.error(
          "Conversation loading error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load conversations.",
        );
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            conversationsRequestRef.current
        ) {
          setLoadingConversations(false);
        }
      }
    },
    [],
  );

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const requestId =
        ++messagesRequestRef.current;

      try {
        if (mountedRef.current) {
          setLoadingMessages(true);
        }

        const response = await fetch(
          `/api/ai-tutor/conversations/${conversationId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const { data } =
          await readApiResponse(response);

        if (
          !mountedRef.current ||
          requestId !==
            messagesRequestRef.current
        ) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : `Unable to load conversation (${response.status}).`,
          );
        }

        const loadedMessages = Array.isArray(
          data.messages,
        )
          ? (data.messages as Message[])
          : [];

        setMessages(loadedMessages);
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !==
            messagesRequestRef.current
        ) {
          return;
        }

        console.error(
          "Conversation message loading error:",
          err,
        );

        setMessages([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load conversation.",
        );
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            messagesRequestRef.current
        ) {
          setLoadingMessages(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    ++messagesRequestRef.current;

    if (!selectedConversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    void loadConversation(
      selectedConversationId,
    );
  }, [
    selectedConversationId,
    loadConversation,
  ]);

  useEffect(() => {
    void loadConversations(false);
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [selectedConversationId]);

  const createConversation = useCallback(
    async () => {
      try {
        setCreatingConversation(true);
        setError(null);

        const response = await fetch(
          "/api/ai-tutor/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: initialTopic
                ? `Learning: ${formatConversationTitle(
                    initialTopic,
                  )}`
                : "New conversation",
              contextType: initialTopic
                ? "topic"
                : "general",
              context,
            }),
          },
        );

        const { data } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : `Unable to create conversation (${response.status}).`,
          );
        }

        const conversation =
          data.conversation as
            | Conversation
            | undefined;

        if (!conversation?.id) {
          throw new Error(
            "The server did not return a valid conversation.",
          );
        }

        if (!mountedRef.current) {
          return null;
        }

        ++conversationsRequestRef.current;

        setConversations((previous) => [
          conversation,
          ...previous.filter(
            (item) =>
              item.id !== conversation.id,
          ),
        ]);

        ++messagesRequestRef.current;

        setSelectedConversationId(
          conversation.id,
        );

        setMessages([]);
        setLoadingMessages(false);

        return conversation;
      } catch (err) {
        if (!mountedRef.current) {
          return null;
        }

        console.error(
          "Conversation creation error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to create conversation.",
        );

        return null;
      } finally {
        if (mountedRef.current) {
          setCreatingConversation(false);
        }
      }
    },
    [context, initialTopic],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (deletingConversationId) {
        return;
      }

      const conversationToDelete =
        conversations.find(
          (conversation) =>
            conversation.id ===
            conversationId,
        );

      if (!conversationToDelete) {
        return;
      }

      const confirmed = window.confirm(
        `Delete "${formatConversationTitle(
          conversationToDelete.title,
        )}" permanently?\n\nThis will permanently delete the conversation and its messages.`,
      );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingConversationId(
          conversationId,
        );
        setError(null);

        const response = await fetch(
          `/api/ai-tutor/conversations/${conversationId}`,
          {
            method: "DELETE",
            cache: "no-store",
          },
        );

        const { data } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : `Unable to delete conversation (${response.status}).`,
          );
        }

        if (!mountedRef.current) {
          return;
        }

        ++conversationsRequestRef.current;
        ++messagesRequestRef.current;

        const wasSelected =
          selectedConversationId ===
          conversationId;

        const remaining =
          conversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          );

        setConversations(remaining);

        if (wasSelected) {
          if (remaining.length > 0) {
            setSelectedConversationId(
              remaining[0].id,
            );
          } else {
            setSelectedConversationId(null);
            setMessages([]);
            setLoadingMessages(false);
          }
        }
      } catch (err) {
        if (!mountedRef.current) {
          return;
        }

        console.error(
          "Conversation deletion error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete conversation.",
        );
      } finally {
        if (mountedRef.current) {
          setDeletingConversationId(null);
        }
      }
    },
    [
      conversations,
      deletingConversationId,
      selectedConversationId,
    ],
  );

  async function sendMessage() {
    const trimmed = input.trim();

    if (!trimmed || sending) {
      return;
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Your message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      );
      return;
    }

    setError(null);
    setSending(true);

    let conversationId =
      selectedConversationId;

    const optimisticMessageId =
      `temporary-user-${Date.now()}`;

    try {
      if (!conversationId) {
        const conversation =
          await createConversation();

        if (!conversation) {
          throw new Error(
            "Unable to create a new AI Tutor conversation.",
          );
        }

        conversationId =
          conversation.id;
      }

      const optimisticMessage: Message = {
        id: optimisticMessageId,
        role: "user",
        content: trimmed,
        created_at:
          new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        optimisticMessage,
      ]);

      setInput("");

      const activeConversation =
        conversations.find(
          (conversation) =>
            conversation.id ===
            conversationId,
        );

      const response = await fetch(
        "/api/ai-tutor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            message: trimmed,
            contextType:
              activeConversation
                ?.context_type ??
              (initialTopic
                ? "topic"
                : "general"),
            context: {
              ...context,
              conversationId,
            },
          }),
        },
      );

      const { data } =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Unable to get a response from AI Tutor (${response.status}).`,
        );
      }

      const returnedConversation =
        data.conversation as
          | Conversation
          | undefined;

      if (
        returnedConversation?.id &&
        returnedConversation.id !==
          conversationId
      ) {
        conversationId =
          returnedConversation.id;

        ++messagesRequestRef.current;

        setSelectedConversationId(
          conversationId,
        );
      }

      const assistantMessageData =
        data.assistantMessage as
          | Message
          | undefined;

      if (
        !assistantMessageData ||
        typeof assistantMessageData.content !==
          "string"
      ) {
        throw new Error(
          "The AI response was not returned in the expected format.",
        );
      }

      if (
        mountedRef.current &&
        selectedConversationId ===
          conversationId
      ) {
        setMessages((previous) => [
          ...previous.filter(
            (message) =>
              message.id !==
              optimisticMessageId,
          ),
          {
            ...assistantMessageData,
            role: "assistant",
          },
        ]);
      }

      await loadConversations(true);

      if (
        conversationId &&
        mountedRef.current &&
        selectedConversationId ===
          conversationId
      ) {
        await loadConversation(
          conversationId,
        );
      }
    } catch (err) {
      console.error(
        "AI Tutor send error:",
        err,
      );

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message.id !==
            optimisticMessageId,
        ),
      );

      setInput(trimmed);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message.",
      );
    } finally {
      setSending(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void sendMessage();
    }
  }

  async function startNewConversation() {
    if (
      creatingConversation ||
      sending
    ) {
      return;
    }

    setInput("");
    setError(null);

    const conversation =
      await createConversation();

    if (!conversation) {
      return;
    }

    setSelectedConversationId(
      conversation.id,
    );

    setMessages([]);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }

  return (
    /*
     * =========================================================
     * FULL VIEWPORT CHAT APPLICATION
     *
     * Navbar height = 64px
     *
     * The tutor is fixed directly underneath the navbar.
     * This completely removes the page-level scroll.
     * =========================================================
     */
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-40 flex min-h-0 overflow-hidden bg-white text-[#171717] dark:bg-[#212121] dark:text-white ${className}`}
    >
      {/* =====================================================
          SIDEBAR
         ===================================================== */}

      {showHistory && (
        <aside className="hidden h-full w-[260px] shrink-0 flex-col overflow-hidden bg-[#f7f7f8] dark:bg-[#171717] md:flex">
          {/* Sidebar header */}

          <div className="flex h-14 shrink-0 items-center justify-between px-3">
            <div className="flex min-w-0 items-center gap-2 px-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#171717] text-sm font-semibold text-white dark:bg-white dark:text-black">
                Q
              </div>

              <span className="truncate text-sm font-semibold text-[#171717] dark:text-white">
                QuantumLearn
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                void startNewConversation()
              }
              disabled={
                creatingConversation ||
                sending
              }
              aria-label="New conversation"
              title="New conversation"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl text-[#666] transition hover:bg-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#aaa] dark:hover:bg-[#2f2f2f]"
            >
              +
            </button>
          </div>

          {/* New chat */}

          <div className="shrink-0 px-3 pb-2">
            <button
              type="button"
              onClick={() =>
                void startNewConversation()
              }
              disabled={
                creatingConversation ||
                sending
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#333] transition hover:bg-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#eee] dark:hover:bg-[#2f2f2f]"
            >
              <span className="text-base">
                +
              </span>

              <span>
                New chat
              </span>
            </button>
          </div>

          {/* Conversations heading */}

          <div className="shrink-0 px-3 pb-2 pt-3">
            <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-[#777] dark:text-[#999]">
              Conversations
            </p>
          </div>

          {/* ONLY SIDEBAR SCROLLS */}

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3">
            {loadingConversations ? (
              <div className="space-y-1">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-10 animate-pulse rounded-lg bg-[#e5e5e5] dark:bg-[#242424]"
                  />
                ))}
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="px-3 py-8 text-center text-xs leading-5 text-[#777] dark:text-[#999]">
                No conversations yet.
                <br />
                Start a new chat.
              </div>
            ) : (
              <div className="space-y-0.5">
                {conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      selectedConversationId;

                    const deleting =
                      deletingConversationId ===
                      conversation.id;

                    return (
                      <div
                        key={conversation.id}
                        className={`group relative flex items-center rounded-lg transition ${
                          active
                            ? "bg-[#e5e5e5] dark:bg-[#2f2f2f]"
                            : "hover:bg-[#e5e5e5] dark:hover:bg-[#242424]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedConversationId(
                              conversation.id,
                            )
                          }
                          disabled={deleting}
                          className="min-w-0 flex-1 px-3 py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="truncate pr-6 text-[13px] text-[#333] dark:text-[#eee]">
                            {formatConversationTitle(
                              conversation.title,
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          aria-label={`Delete ${formatConversationTitle(
                            conversation.title,
                          )}`}
                          title="Delete conversation"
                          disabled={deleting}
                          onClick={() =>
                            void deleteConversation(
                              conversation.id,
                            )
                          }
                          className="absolute right-2 hidden rounded-md px-1.5 py-1 text-xs text-[#888] transition hover:bg-[#d5d5d5] hover:text-red-600 group-hover:block dark:hover:bg-[#3a3a3a] dark:hover:text-red-400"
                        >
                          {deleting ? "..." : "×"}
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* Sidebar footer */}

          <div className="shrink-0 px-3 pb-3">
            <div className="mx-1 border-t border-[#e5e5e5] dark:border-[#2f2f2f]" />

            <div className="mt-3 px-2 text-[11px] text-[#999]">
              QuantumLearn AI Tutor
            </div>
          </div>
        </aside>
      )}

      {/* =====================================================
          MAIN CHAT
         ===================================================== */}

      <section className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#212121]">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            {!showHistory && (
              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="rounded-lg px-2 py-1.5 text-[#666] hover:bg-[#f1f1f1] md:hidden dark:text-[#ccc] dark:hover:bg-[#2f2f2f]"
                aria-label="Open conversation history"
              >
                ☰
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-[#333] dark:text-[#eee]">
                {selectedConversation
                  ? formatConversationTitle(
                      selectedConversation.title,
                    )
                  : "QuantumLearn AI Tutor"}
              </h1>

              {initialTopic && (
                <p className="truncate text-[11px] text-[#888] dark:text-[#999]">
                  {initialTopic}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void startNewConversation()
            }
            disabled={
              creatingConversation ||
              sending
            }
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#666] transition hover:bg-[#f1f1f1] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#ccc] dark:hover:bg-[#2f2f2f]"
          >
            {creatingConversation
              ? "..."
              : "New chat"}
          </button>
        </header>

        {/* ===================================================
            MOBILE HISTORY
           =================================================== */}

        {showHistory &&
          conversations.length > 0 && (
            <div className="shrink-0 px-3 pb-2 md:hidden">
              <select
                value={
                  selectedConversationId ?? ""
                }
                onChange={(event) =>
                  setSelectedConversationId(
                    event.target.value ||
                      null,
                  )
                }
                className="w-full rounded-lg border-0 bg-[#f1f1f1] px-3 py-2 text-sm text-[#333] outline-none dark:bg-[#2f2f2f] dark:text-white"
              >
                <option value="">
                  New conversation
                </option>

                {conversations.map(
                  (conversation) => (
                    <option
                      key={conversation.id}
                      value={conversation.id}
                    >
                      {formatConversationTitle(
                        conversation.title,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

        {/* ===================================================
            ERROR
           =================================================== */}

        {error && (
          <div className="mx-auto mt-2 flex w-[calc(100%-2rem)] max-w-4xl shrink-0 items-start justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* ===================================================
            MESSAGE AREA
           =================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {loadingMessages ? (
            <div className="mx-auto max-w-3xl px-4 py-8">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#e5e5e5] dark:bg-[#333]" />

                  <div className="w-full max-w-xl space-y-2">
                    <div className="h-4 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />

                    <div className="h-4 w-3/5 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-[#f1f1f1] dark:bg-[#2f2f2f]" />
                </div>

                <div className="flex gap-4">
                  <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#e5e5e5] dark:bg-[#333]" />

                  <div className="w-full max-w-2xl space-y-2">
                    <div className="h-4 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />

                    <div className="h-4 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#e5e5e5] dark:bg-[#333]" />
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-5 py-12">
              <div className="w-full max-w-2xl text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-xl text-white dark:bg-white dark:text-[#171717]">
                  ✦
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-[#171717] dark:text-white">
                  How can I help you?
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#777] dark:text-[#aaa]">
                  {initialTopic
                    ? `Ask me anything about ${initialTopic}, or ask for an explanation, example, quiz, or study plan.`
                    : DEFAULT_WELCOME_MESSAGE}
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {[
                    "Explain this concept simply",
                    "Give me an example",
                    "Quiz me",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setInput(
                          initialTopic
                            ? `${suggestion} about ${initialTopic}`
                            : suggestion,
                        )
                      }
                      className="rounded-full bg-[#f1f1f1] px-4 py-2 text-xs font-medium text-[#444] transition hover:bg-[#e5e5e5] dark:bg-[#2f2f2f] dark:text-[#ddd] dark:hover:bg-[#3a3a3a]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 pb-8 pt-4 sm:px-6">
              {messages.map(
                (message, index) => {
                  const isUser =
                    message.role === "user";

                  if (
                    message.role ===
                    "system"
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        message.id ??
                        `${message.role}-${index}`
                      }
                      className={`flex w-full gap-4 py-5 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white dark:bg-white dark:text-[#171717]">
                          Q
                        </div>
                      )}

                      <div
                        className={
                          isUser
                            ? "max-w-[82%]"
                            : "min-w-0 max-w-[calc(100%-3rem)] flex-1"
                        }
                      >
                        {isUser ? (
                          <div className="rounded-3xl bg-[#f1f1f1] px-4 py-3 text-[15px] leading-7 text-[#171717] dark:bg-[#2f2f2f] dark:text-[#eee]">
                            <div className="whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <TutorMarkdown
                            content={
                              message.content
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                },
              )}

              {sending && (
                <div className="flex gap-4 py-5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white dark:bg-white dark:text-[#171717]">
                    Q
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#999] [animation-delay:-0.3s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#999] [animation-delay:-0.15s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#999]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ===================================================
            COMPOSER
           =================================================== */}

        <div className="shrink-0 bg-white px-3 pb-4 pt-2 dark:bg-[#212121]">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-3xl"
          >
            <div className="relative flex items-end rounded-3xl bg-[#f1f1f1] px-3 py-2 shadow-sm dark:bg-[#2f2f2f]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Message QuantumLearn AI..."
                className="max-h-48 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#888] disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-[#999]"
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !input.trim() ||
                  input.length >
                    MAX_MESSAGE_LENGTH
                }
                aria-label="Send message"
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#d1d1d1] disabled:text-[#888] dark:bg-white dark:text-black dark:hover:bg-[#e5e5e5] dark:disabled:bg-[#555] dark:disabled:text-[#999]"
              >
                {sending ? (
                  <span className="text-sm">
                    ...
                  </span>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 19V5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M6 11l6-6 6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>

          <div className="mx-auto mt-2 flex max-w-3xl items-center justify-center px-2 text-[10px] text-[#999]">
            <span>
              Enter to send · Shift + Enter for new line
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}