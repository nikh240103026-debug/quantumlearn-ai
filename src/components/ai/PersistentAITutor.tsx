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

function formatConversationTitle(title: string): string {
  const cleaned = title.trim();

  if (!cleaned) {
    return "New AI Tutor Conversation";
  }

  return cleaned.length > 45
    ? `${cleaned.slice(0, 42)}...`
    : cleaned;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Safely read an API response.
 *
 * Some framework-generated errors can return HTML or an empty body.
 * This prevents JSON parsing errors from hiding the real problem.
 */
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

  const [error, setError] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(
    !compact && !pageMode,
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  /**
   * Load active conversations.
   */
  const loadConversations = useCallback(
    async (preserveSelection = true) => {
      try {
        setLoadingConversations(true);

        const response = await fetch(
          "/api/ai-tutor/conversations",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const { data, text } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : text
                ? `Unable to load conversations (${response.status}).`
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
          if (loaded.length > 0) {
            setSelectedConversationId(
              loaded[0].id,
            );
          } else {
            setSelectedConversationId(null);
          }

          return;
        }

        /**
         * Keep the currently selected conversation if it
         * still exists.
         */
        if (
          selectedConversationId &&
          loaded.some(
            (conversation) =>
              conversation.id ===
              selectedConversationId,
          )
        ) {
          return;
        }

        /**
         * If the selected conversation no longer exists,
         * select the newest conversation.
         */
        if (loaded.length > 0) {
          setSelectedConversationId(
            loaded[0].id,
          );
        }
      } catch (err) {
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
        setLoadingConversations(false);
      }
    },
    [selectedConversationId],
  );

  /**
   * Load one conversation and all persisted messages.
   */
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setLoadingMessages(true);
        setError(null);

        const response = await fetch(
          `/api/ai-tutor/conversations/${conversationId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const { data, text } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : text
                ? `Unable to load conversation (${response.status}).`
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
        setLoadingMessages(false);
      }
    },
    [],
  );

  /**
   * Create a conversation explicitly.
   *
   * This is used when the user starts a brand-new chat.
   */
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
                : "New AI Tutor Conversation",
              contextType: initialTopic
                ? "topic"
                : "general",
              context,
            }),
          },
        );

        const { data, text } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : text
                ? `Unable to create conversation (${response.status}).`
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

        setConversations((previous) => [
          conversation,
          ...previous.filter(
            (item) =>
              item.id !== conversation.id,
          ),
        ]);

        setSelectedConversationId(
          conversation.id,
        );

        setMessages([]);

        return conversation;
      } catch (err) {
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
        setCreatingConversation(false);
      }
    },
    [context, initialTopic],
  );

  /**
   * Archive conversation.
   *
   * IMPORTANT:
   * We intentionally use PATCH instead of DELETE.
   *
   * Your [id]/route.ts already supports PATCH with
   * isArchived, while the running Next.js route was
   * returning 405 for DELETE.
   */
  const archiveConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null);

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

        const { data, text } =
          await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : text
                ? `Unable to archive conversation (${response.status}).`
                : `Unable to archive conversation (${response.status}).`,
          );
        }

        /**
         * Remove it immediately from the visible history.
         */
        setConversations((previous) =>
          previous.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          ),
        );

        /**
         * If the archived conversation was active,
         * switch to another existing conversation.
         */
        if (
          selectedConversationId ===
          conversationId
        ) {
          const remaining =
            conversations.filter(
              (conversation) =>
                conversation.id !==
                conversationId,
            );

          if (remaining.length > 0) {
            setSelectedConversationId(
              remaining[0].id,
            );
          } else {
            setSelectedConversationId(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error(
          "Conversation archive error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to archive conversation.",
        );
      }
    },
    [
      conversations,
      selectedConversationId,
    ],
  );

  /**
   * Initial conversation loading.
   */
  useEffect(() => {
    void loadConversations(false);
  }, [loadConversations]);

  /**
   * Load messages whenever selected conversation changes.
   */
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadConversation(
      selectedConversationId,
    );
  }, [
    selectedConversationId,
    loadConversation,
  ]);

  /**
   * Auto-scroll to newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  /**
   * Focus input when switching conversations.
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, [selectedConversationId]);

  /**
   * Send message.
   *
   * If there is no selected conversation, explicitly create
   * one first. This guarantees that every new chat has a
   * persistent conversation ID before the message is sent.
   */
  async function sendMessage() {
    const trimmed = input.trim();

    if (!trimmed || sending) {
      return;
    }

    setError(null);
    setSending(true);

    let conversationId =
      selectedConversationId;

    try {
      /**
       * Create persistent conversation first when this
       * is a brand-new chat.
       */
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
        id: `temporary-user-${Date.now()}`,
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

      const response = await fetch(
        "/api/ai-tutor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            conversationId,
            message: trimmed,
            contextType:
              selectedConversation
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

      const { data, text } =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : text
              ? `Unable to get a response from AI Tutor (${response.status}).`
              : `Unable to get a response from AI Tutor (${response.status}).`,
        );
      }

      const messageData =
        data.message as
          | {
              content?: string;
            }
          | undefined;

      const assistantContent =
        typeof messageData?.content ===
        "string"
          ? messageData.content
          : "I wasn't able to generate a response.";

      const assistantMessage: Message = {
        id: `temporary-assistant-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        created_at:
          new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      /**
       * The API should normally return the same conversation
       * ID. If it creates one for any reason, synchronize it.
       */
      if (
        typeof data.conversationId ===
          "string" &&
        data.conversationId !==
          conversationId
      ) {
        conversationId =
          data.conversationId;

        setSelectedConversationId(
          conversationId,
        );
      }

      /**
       * Refresh the sidebar so updated_at/title ordering
       * reflects the persisted database state.
       */
      await loadConversations(true);

      /**
       * IMPORTANT:
       * Reload the persisted messages after the API call.
       *
       * This proves the messages are actually stored in
       * Supabase instead of relying only on optimistic UI.
       */
      if (conversationId) {
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
            !(
              message.id?.startsWith(
                "temporary-user-",
              ) &&
              message.content === trimmed
            ),
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
  if (creatingConversation) {
    return;
  }

  setInput("");
  setError(null);

  const conversation = await createConversation();

  if (!conversation) {
    return;
  }

  setSelectedConversationId(conversation.id);
  setMessages([]);

  window.setTimeout(() => {
    textareaRef.current?.focus();
  }, 0);
}

  return (
    <div
      className={`flex h-full min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Conversation sidebar */}
      {showHistory && (
        <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 md:flex dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                AI Tutor
              </h2>

              <p className="text-xs text-slate-500">
                Your conversations
              </p>
            </div>

            <button
              type="button"
              onClick={() => void startNewConversation()}
              disabled={creatingConversation}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {creatingConversation ? "..." : "+ New"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingConversations ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No conversations yet.
                <br />
                Start your first one.
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      selectedConversationId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          setSelectedConversationId(
                            conversation.id,
                          )
                        }
                        className={`group w-full rounded-xl p-3 text-left transition ${
                          active
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-medium">
                            {formatConversationTitle(
                              conversation.title,
                            )}
                          </span>

                          <span
                            className={`shrink-0 text-[10px] ${
                              active
                                ? "text-slate-300 dark:text-slate-600"
                                : "text-slate-400"
                            }`}
                          >
                            {formatDate(
                              conversation.updated_at,
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-[10px] ${
                              active
                                ? "text-slate-300 dark:text-slate-600"
                                : "text-slate-400"
                            }`}
                          >
                            {conversation.context_type ??
                              "general"}
                          </span>

                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();

                              void archiveConversation(
                                conversation.id,
                              );
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();
                                event.stopPropagation();

                                void archiveConversation(
                                  conversation.id,
                                );
                              }
                            }}
                            className={`hidden rounded px-1.5 py-0.5 text-[10px] group-hover:inline-block ${
                              active
                                ? "bg-white/10 text-white dark:bg-black/10 dark:text-slate-900"
                                : "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                            }`}
                          >
                            Archive
                          </span>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Tutor */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white">
              {selectedConversation
                ? formatConversationTitle(
                    selectedConversation.title,
                  )
                : "QuantumLearn AI Tutor"}
            </h1>

            {initialTopic && (
              <p className="truncate text-xs text-slate-500">
                Topic: {initialTopic}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setShowHistory(
                  (previous) => !previous,
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              History
            </button>

            <button
              type="button"
              onClick={() => void startNewConversation()}
              disabled={creatingConversation}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {creatingConversation ? "..." : "New"}
            </button>
          </div>
        </header>

        {/* Mobile history */}
        {showHistory &&
          conversations.length > 0 && (
            <div className="border-b border-slate-200 p-2 md:hidden dark:border-slate-800">
              <select
                value={
                  selectedConversationId ??
                  ""
                }
                onChange={(event) =>
                  setSelectedConversationId(
                    event.target.value ||
                      null,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loadingMessages ? (
            <div className="space-y-4">
              <div className="h-20 max-w-[75%] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
              <div className="ml-auto h-16 max-w-[70%] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
              <div className="h-24 max-w-[75%] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <div className="max-w-lg text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white dark:bg-white dark:text-slate-900">
                  ✦
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Learn with AI Tutor
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {initialTopic
                    ? `Ask me anything about ${initialTopic}, or ask for an explanation, example, quiz, or study plan.`
                    : DEFAULT_WELCOME_MESSAGE}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
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
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-5">
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
                      className={`flex ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUser
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {!isUser && (
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            QuantumLearn AI
                          </div>
                        )}

                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-4xl items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={2}
              maxLength={8000}
              placeholder="Ask your AI Tutor..."
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !input.trim()
              }
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>

          <div className="mx-auto mt-2 flex max-w-4xl items-center justify-between px-1 text-[10px] text-slate-400">
            <span>
              Enter to send · Shift + Enter for new line
            </span>

            <span>{input.length}/8000</span>
          </div>
        </div>
      </section>
    </div>
  );
}