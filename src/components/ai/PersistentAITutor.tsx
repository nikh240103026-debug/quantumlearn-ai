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

function getAssistantContent(
  data: Record<string, unknown>,
): string {
  const assistantMessage = data.assistantMessage;

  if (
    assistantMessage &&
    typeof assistantMessage === "object" &&
    !Array.isArray(assistantMessage)
  ) {
    const content = (
      assistantMessage as Record<string, unknown>
    ).content;

    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
  }

  const possibleKeys = [
    "assistantContent",
    "content",
    "response",
    "answer",
    "message",
  ];

  for (const key of possibleKeys) {
    const value = data[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getReturnedConversation(
  data: Record<string, unknown>,
): Conversation | null {
  const value = data.conversation;

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const conversation =
    value as Partial<Conversation>;

  if (
    typeof conversation.id !== "string" ||
    !conversation.id
  ) {
    return null;
  }

  return conversation as Conversation;
}

function TutorMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="tutor-markdown break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-lg font-bold text-slate-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-bold text-slate-900 dark:text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-7">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-950 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-5 list-disc space-y-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-5 list-decimal space-y-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-7">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:border-slate-600 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-5 border-slate-200 dark:border-slate-700" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return (
                <code className="block whitespace-pre text-sm leading-6">
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 dark:border-slate-700">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[500px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 dark:bg-slate-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-left text-slate-700 dark:text-slate-300">
              {children}
            </td>
          ),
          del: ({ children }) => (
            <del className="text-slate-500">{children}</del>
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
  const [conversations, setConversations] = useState<Conversation[]>(
    [],
  );

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] = useState(false);

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

  /*
   * IMPORTANT:
   *
   * React state updates are asynchronous.
   * Reading selectedConversationId immediately after calling
   * setSelectedConversationId() can therefore return the old ID.
   *
   * This ref always contains the latest selected conversation.
   */
  const selectedConversationIdRef = useRef<string | null>(
    null,
  );

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

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /*
   * Keep the ref synchronized with React state.
   */
  useEffect(() => {
    selectedConversationIdRef.current =
      selectedConversationId;
  }, [selectedConversationId]);

  /*
   * Conversation list loading.
   *
   * Only the latest request is allowed to update state.
   */
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

        const { data, text } =
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
          const nextId =
            loaded.length > 0
              ? loaded[0].id
              : null;

          selectedConversationIdRef.current =
            nextId;

          setSelectedConversationId(nextId);

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
              selectedConversationIdRef.current =
                currentSelectedId;

              return currentSelectedId;
            }

            const nextId =
              loaded.length > 0
                ? loaded[0].id
                : null;

            selectedConversationIdRef.current =
              nextId;

            return nextId;
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

  /*
   * Message loading.
   *
   * Every conversation request receives a unique version.
   * Older requests can never overwrite a newer conversation.
   */
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
          requestId !== messagesRequestRef.current
        ) {
          return;
        }

        /*
         * Also verify that the requested conversation is
         * still the active conversation.
         */
        if (
          selectedConversationIdRef.current !==
          conversationId
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
          requestId !== messagesRequestRef.current
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
          requestId === messagesRequestRef.current
        ) {
          setLoadingMessages(false);
        }
      }
    },
    [],
  );

  /*
   * Selecting a conversation immediately invalidates every
   * previous message request.
   */
  useEffect(() => {
    const conversationId =
      selectedConversationId;

    ++messagesRequestRef.current;

    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    void loadConversation(conversationId);
  }, [
    selectedConversationId,
    loadConversation,
  ]);

  /*
   * Initial conversation loading.
   */
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
                : "New AI Tutor Conversation",
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
          getReturnedConversation(data);

        if (!conversation) {
          throw new Error(
            "The server did not return a valid conversation.",
          );
        }

        if (!mountedRef.current) {
          return null;
        }

        /*
         * Invalidate stale conversation-list requests.
         */
        ++conversationsRequestRef.current;

        setConversations((previous) => [
          conversation,
          ...previous.filter(
            (item) =>
              item.id !== conversation.id,
          ),
        ]);

        /*
         * Invalidate every message request belonging to
         * the previous conversation.
         */
        ++messagesRequestRef.current;

        /*
         * IMPORTANT:
         * Update the ref immediately, not only React state.
         * This prevents sendMessage() from reading the old ID.
         */
        selectedConversationIdRef.current =
          conversation.id;

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

        /*
         * Invalidate all old requests.
         */
        ++conversationsRequestRef.current;
        ++messagesRequestRef.current;

        const wasSelected =
          selectedConversationIdRef.current ===
          conversationId;

        const remaining =
          conversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          );

        setConversations(remaining);

        if (wasSelected) {
          const nextId =
            remaining.length > 0
              ? remaining[0].id
              : null;

          selectedConversationIdRef.current =
            nextId;

          setSelectedConversationId(nextId);

          if (!nextId) {
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
      selectedConversationIdRef.current;

    const optimisticMessageId =
      `temporary-user-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    try {
      /*
       * Create the conversation if none exists.
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

        /*
         * createConversation already updates the ref,
         * but set it explicitly here as a final guarantee.
         */
        selectedConversationIdRef.current =
          conversationId;
      }

      /*
       * Capture the exact conversation used for this request.
       */
      const requestConversationId =
        conversationId;

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
            requestConversationId,
        );

      const response = await fetch(
        "/api/ai-tutor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId:
              requestConversationId,
            message: trimmed,
            contextType:
              activeConversation?.context_type ??
              (initialTopic
                ? "topic"
                : "general"),
            context: {
              ...context,
              conversationId:
                requestConversationId,
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
            : text.trim()
              ? text.slice(0, 300)
              : `Unable to get a response from AI Tutor (${response.status}).`,
        );
      }

      /*
       * Some API implementations may return the conversation
       * object in the response. Respect it if present.
       */
      const returnedConversation =
        getReturnedConversation(data);

      if (
        returnedConversation?.id &&
        returnedConversation.id !==
          requestConversationId
      ) {
        conversationId =
          returnedConversation.id;

        ++messagesRequestRef.current;

        selectedConversationIdRef.current =
          conversationId;

        setSelectedConversationId(
          conversationId,
        );
      }

      /*
       * Normalize assistant response from the API.
       */
      const assistantContent =
        getAssistantContent(data);

      if (!assistantContent) {
        console.error(
          "AI Tutor returned no assistant content.",
          {
            status: response.status,
            responseText: text,
            responseData: data,
          },
        );

        throw new Error(
          "The AI Tutor returned an empty response. Please try again.",
        );
      }

      const assistantMessageData =
        data.assistantMessage &&
        typeof data.assistantMessage ===
          "object" &&
        !Array.isArray(
          data.assistantMessage,
        )
          ? (data.assistantMessage as Message)
          : {
              role: "assistant" as const,
              content: assistantContent,
              created_at:
                new Date().toISOString(),
            };

      /*
       * Check the CURRENT active conversation through the ref.
       *
       * Do not use selectedConversationId here because that
       * state value may be one render behind.
       */
      const stillViewingRequestConversation =
        mountedRef.current &&
        selectedConversationIdRef.current ===
          requestConversationId;

      if (
        stillViewingRequestConversation
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
            content: assistantContent,
          },
        ]);
      }

      /*
       * Refresh the conversation list.
       */
      await loadConversations(true);

      /*
       * Only reload messages if the user is still looking
       * at the conversation that produced the response.
       *
       * Use the ref, never the stale state closure.
       */
      if (
        requestConversationId &&
        mountedRef.current &&
        selectedConversationIdRef.current ===
          requestConversationId
      ) {
        await loadConversation(
          requestConversationId,
        );
      }
    } catch (err) {
      console.error(
        "AI Tutor send error:",
        err,
      );

      if (mountedRef.current) {
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
      }
    } finally {
      if (mountedRef.current) {
        setSending(false);

        window.setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
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

    /*
     * createConversation already changed both state and ref.
     */
    selectedConversationIdRef.current =
      conversation.id;

    setSelectedConversationId(
      conversation.id,
    );

    setMessages([]);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }

  return (
    <div
      className={`flex h-full min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
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
              onClick={() =>
                void startNewConversation()
              }
              disabled={
                creatingConversation ||
                sending
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {creatingConversation
                ? "..."
                : "+ New"}
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
            ) : conversations.length ===
              0 ? (
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

                    const deleting =
                      deletingConversationId ===
                      conversation.id;

                    return (
                      <div
                        key={conversation.id}
                        className={`group relative w-full rounded-xl transition ${
                          active
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            selectedConversationIdRef.current =
                              conversation.id;

                            ++messagesRequestRef.current;

                            setSelectedConversationId(
                              conversation.id,
                            );

                            setError(null);
                          }}
                          disabled={deleting}
                          className="w-full p-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex items-start justify-between gap-2 pr-6">
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

                          <div className="mt-2">
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
                          className={`absolute right-2 top-3 hidden rounded-md px-1.5 py-1 text-xs transition group-hover:block disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                              ? "text-slate-300 hover:bg-white/10 hover:text-white dark:text-slate-600 dark:hover:bg-black/10 dark:hover:text-slate-900"
                              : "text-slate-400 hover:bg-slate-300 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400"
                          }`}
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
        </aside>
      )}

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
              onClick={() =>
                void startNewConversation()
              }
              disabled={
                creatingConversation ||
                sending
              }
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {creatingConversation
                ? "..."
                : "New"}
            </button>
          </div>
        </header>

        {showHistory &&
          conversations.length > 0 && (
            <div className="border-b border-slate-200 p-2 md:hidden dark:border-slate-800">
              <select
                value={
                  selectedConversationId ??
                  ""
                }
                onChange={(event) => {
                  const nextId =
                    event.target.value ||
                    null;

                  selectedConversationIdRef.current =
                    nextId;

                  ++messagesRequestRef.current;

                  setSelectedConversationId(
                    nextId,
                  );

                  setError(null);
                }}
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
          <div className="mx-4 mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
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

                        {isUser ? (
                          <div className="whitespace-pre-wrap break-words">
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
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Ask your AI Tutor..."
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !input.trim() ||
                input.length >
                  MAX_MESSAGE_LENGTH
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

            <span>
              {input.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}