"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Loader2,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Explain this quantum circuit",
  "Find errors in my code",
  "How does the Hadamard gate work?",
  "Optimize this circuit",
];

const defaultCode = `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

print(qc)`;

export default function AICodingAssistant() {
  const [code, setCode] = useState(defaultCode);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(
    "AI Coding Assistant is ready. Ask a question about your quantum code."
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I’m ready to help with your quantum code. You can ask me to explain, debug, improve, or teach concepts from your program.",
    },
  ]);

  async function askAssistant(text = question) {
    const prompt = text.trim();

    if (!prompt || loading) return;

    setQuestion("");
    setLoading(true);

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: prompt,
      },
    ]);

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `${prompt}

Here is the user's current quantum Python code:

\`\`\`python
${code}
\`\`\`

Answer specifically in the context of this code. Explain clearly and provide corrected code when appropriate.`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to contact the AI assistant."
        );
      }

      const answer =
        data?.answer ||
        data?.response ||
        data?.message ||
        "The AI assistant returned an empty response.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);

      setOutput(answer);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the AI assistant.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Unable to get an AI response.\n\n${message}`,
        },
      ]);

      setOutput(message);
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setOutput("Unable to copy code.");
    }
  }

  function resetCode() {
    setCode(defaultCode);
    setOutput(
      "Code reset. Ask the AI assistant about the circuit whenever you're ready."
    );
  }

  function runPreview() {
    setOutput(
      "Quantum circuit preview:\n\nq_0: ── H ──■──\n           │\nq_1: ────── X ──\n\nBell-state circuit detected.\n\nExecution backend will be connected in the coding execution feature."
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#07101d]">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Bot size={19} />
            </div>

            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                AI Coding Assistant
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Debug, explain and improve quantum programs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/coding/challenges"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Trophy size={14} />
              <span className="hidden sm:inline">Challenges</span>
            </a>

            <a
              href="/coding"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Code2 size={14} />
              <span className="hidden sm:inline">Playground</span>
            </a>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="mx-auto grid max-w-[1500px] gap-px bg-slate-800 lg:grid-cols-[minmax(0,1fr)_390px]">
        {/* Code Workspace */}
        <section className="min-w-0 bg-[#050b14]">
          <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-blue-400" />

              <span className="text-xs font-semibold text-slate-300">
                main.py
              </span>

              <span className="border border-slate-800 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-slate-600">
                Python
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:text-slate-300"
              >
                {copied ? (
                  <>
                    <Check size={13} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetCode}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:text-slate-300"
              >
                <RotateCcw size={13} />
                Reset
              </button>

              <button
                type="button"
                onClick={runPreview}
                className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-blue-500"
              >
                <Play size={12} fill="currentColor" />
                Preview
              </button>
            </div>
          </div>

          <div className="flex min-h-[calc(100vh-8rem)] flex-col">
            <div className="flex min-h-[500px] flex-1">
              {/* Line Numbers */}
              <div className="w-11 shrink-0 border-r border-slate-900 bg-[#050a11] py-4 text-right font-mono text-[11px] leading-6 text-slate-700">
                {code.split("\n").map((_, index) => (
                  <div key={index} className="pr-2">
                    {index + 1}
                  </div>
                ))}
              </div>

              {/* Code */}
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="min-h-[500px] flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700"
                placeholder="# Write your quantum Python code here..."
                aria-label="Quantum code editor"
              />
            </div>

            {/* Output */}
            <div className="border-t border-slate-800">
              <div className="flex h-10 items-center gap-2 border-b border-slate-800 bg-[#080f1a] px-4">
                <Terminal size={13} className="text-blue-400" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Preview / Output
                </span>
              </div>

              <pre className="min-h-[150px] whitespace-pre-wrap overflow-auto bg-[#03070d] p-4 font-mono text-[11px] leading-5 text-slate-500">
                {output}
              </pre>
            </div>
          </div>
        </section>

        {/* AI Panel */}
        <aside className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#080f1a]">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 px-4">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-blue-400" />

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                AI Assistant
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-500">
              <span className="h-1.5 w-1.5 bg-emerald-500" />
              Ready
            </span>
          </div>

          {/* Suggestions */}
          <div className="border-b border-slate-800 p-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-700">
              Quick Actions
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => askAssistant(suggestion)}
                  disabled={loading}
                  className="border border-slate-800 bg-[#050b14] px-2 py-2 text-left text-[10px] leading-4 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-6"
                      : "mr-3"
                  }
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    {message.role === "assistant" ? (
                      <Bot size={12} className="text-blue-400" />
                    ) : (
                      <MessageSquare
                        size={12}
                        className="text-slate-600"
                      />
                    )}

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      {message.role === "assistant" ? "Quantum AI" : "You"}
                    </span>
                  </div>

                  <div
                    className={`border p-3 text-xs leading-6 ${
                      message.role === "assistant"
                        ? "border-slate-800 bg-[#050b14] text-slate-400"
                        : "border-blue-500/20 bg-blue-500/5 text-slate-300"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mr-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Bot size={12} className="text-blue-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Quantum AI
                    </span>
                  </div>

                  <div className="border border-slate-800 bg-[#050b14] p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2
                        size={14}
                        className="animate-spin text-blue-400"
                      />
                      Analyzing your code...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 bg-[#07101d] p-3">
            <div className="border border-slate-800 bg-[#03070d]">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    askAssistant();
                  }
                }}
                disabled={loading}
                rows={3}
                placeholder="Ask about your code..."
                className="w-full resize-none bg-transparent p-3 text-xs leading-5 text-slate-300 outline-none placeholder:text-slate-700 disabled:opacity-50"
              />

              <div className="flex items-center justify-between border-t border-slate-900 px-3 py-2">
                <span className="text-[9px] text-slate-700">
                  Enter to send · Shift + Enter for new line
                </span>

                <button
                  type="button"
                  onClick={() => askAssistant()}
                  disabled={!question.trim() || loading}
                  className="flex h-7 w-7 items-center justify-center bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send question"
                >
                  {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <a
                href="/coding/tutorials"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 transition hover:text-slate-300"
              >
                Tutorials
                <ChevronRight size={12} />
              </a>

              <a
                href="/coding/challenges"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 transition hover:text-slate-300"
              >
                Challenges
                <ChevronRight size={12} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}