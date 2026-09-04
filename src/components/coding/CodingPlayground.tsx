"use client";

import { useMemo, useState } from "react";
import { Bot, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  Play,
  RotateCcw,
  Terminal,
  X,
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import CodeExamples, { type CodeExample } from "./CodeExamples";

export default function CodingPlayground() {
  const [selectedExample, setSelectedExample] = useState("hello-qubit");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(
    "Ready. Select an example or write your own quantum program."
  );
  const [isCopied, setIsCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const router = useRouter();

  const selectedCodeExample = useMemo<CodeExample | undefined>(
    () =>
      CodeExamples.examples.find(
        (example) => example.id === selectedExample
      ),
    [selectedExample]
  );

  function handleExampleSelect(example: CodeExample) {
    setSelectedExample(example.id);
    setCode(example.code);
    setOutput(example.output);
  }

  function handleReset() {
    if (selectedCodeExample) {
      setCode(selectedCodeExample.code);
      setOutput(selectedCodeExample.output);
    } else {
      setCode("");
      setOutput("Editor reset.");
    }
  }

  async function handleCopy() {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);

      window.setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch {
      setOutput("Unable to copy code to clipboard.");
    }
  }

  function handleRun() {
    setOutput(
      "Execution engine is not connected yet.\n\nThe playground UI is ready. The next coding feature will connect this editor to a secure Python + Qiskit execution backend."
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#07101d]">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Code2 size={21} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                  Quantum Coding Playground
                </h1>

                <span className="hidden border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 sm:inline-block">
                  Qiskit
                </span>
              </div>

              <p className="hidden text-xs text-slate-500 sm:block">
                Write and explore quantum programs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
  type="button"
  onClick={() => router.push("/coding/assistant")}
  className="inline-flex h-9 items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 text-xs font-semibold text-blue-400 transition hover:border-blue-500/50 hover:bg-blue-500/15 hover:text-blue-300"
>
  <Bot size={15} />
  <span className="hidden sm:inline">AI Assistant</span>
</button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-2 border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleRun}
              className="inline-flex h-9 items-center gap-2 bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-500"
            >
              <Play size={15} fill="currentColor" />
              Run
            </button>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div
          className={`grid min-h-[calc(100vh-8rem)] gap-px border border-slate-800 bg-slate-800 ${
            showExamples
              ? "lg:grid-cols-[260px_minmax(0,1fr)]"
              : "grid-cols-1"
          }`}
        >
          {/* Examples */}
          {showExamples && (
            <aside className="flex min-h-0 flex-col bg-[#080f1a]">
              <div className="flex h-12 shrink-0 items-center border-b border-slate-800 px-4">
                <div className="flex items-center gap-2">
                  <FileCode2 size={15} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                    Examples
                  </span>
                </div>
              </div>

              <CodeExamples
                selectedExample={selectedExample}
                onSelect={handleExampleSelect}
              />

              <div className="mt-auto border-t border-slate-800 p-4">
                <div className="border border-slate-800 bg-[#050b14] p-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Terminal size={13} />
                    Environment
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language</span>
                      <span className="text-slate-300">Python</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Framework</span>
                      <span className="text-slate-300">Qiskit</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Backend</span>
                      <span className="text-amber-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main Editor Area */}
          <section className="grid min-h-0 min-w-0 grid-rows-[minmax(400px,1fr)_220px] bg-[#050b14]">
            {/* Editor */}
            <div className="flex min-h-0 flex-col">
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">
                <div className="flex items-center gap-2">
                  <FileCode2 size={15} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-300">
                    main.py
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!code}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCopied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <CodeEditor value={code} onChange={setCode} />
            </div>

            {/* Output */}
            <div className="flex min-h-0 flex-col border-t border-slate-800">
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
                    Output
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Console
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-[#03070d] p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-slate-400">
                  <span className="mr-2 select-none text-blue-500">
                    $
                  </span>
                  {output}
                </pre>
              </div>
            </div>
          </section>
        </div>

        {/* Status Bar */}
        <div className="flex min-h-8 items-center justify-between border-x border-b border-slate-800 bg-[#07101d] px-3 text-[10px] text-slate-600">
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Python</span>
            <span>UTF-8</span>
            <span>Spaces: 4</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-amber-500" />
            <span>Execution backend pending</span>
          </div>
        </div>

        {/* Mobile example hint */}
        {!showExamples && (
          <button
            type="button"
            onClick={() => setShowExamples(true)}
            className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 lg:hidden"
          >
            Open examples
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}