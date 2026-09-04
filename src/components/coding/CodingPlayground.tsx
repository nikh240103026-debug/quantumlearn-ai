"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Square,
  Copy,
  RotateCcw,
  BookOpen,
  Trophy,
  Bot,
  Save,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import CodeExamples, { type CodeExample } from "./CodeExamples";
import { saveCode, addCodeHistory } from "@/lib/coding-storage";

const DEFAULT_CODE = `from qiskit import QuantumCircuit

# Create a quantum circuit with 2 qubits
qc = QuantumCircuit(2)

# Create a Bell state
qc.h(0)
qc.cx(0, 1)

# Display the circuit
print(qc)
`;

type ExecutionState = "idle" | "running" | "success" | "error";

export default function CodingPlayground() {
  const router = useRouter();

  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [executionState, setExecutionState] =
    useState<ExecutionState>("idle");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [programTitle, setProgramTitle] = useState("My Quantum Program");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedExample, setSelectedExample] = useState("bell-state");

  async function runCode() {
    if (!code.trim()) {
      setError("Write some Python code before running it.");
      setOutput("");
      setExecutionState("error");
      return;
    }

    setExecutionState("running");
    setOutput("");
    setError("");
    setExecutionTime(null);

    const startedAt = performance.now();

    try {
      const response = await fetch("/api/coding/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      const data = await response.json();

      const measuredTime =
        typeof data.executionTime === "number"
          ? data.executionTime
          : Math.round(performance.now() - startedAt);

      setExecutionTime(measuredTime);

      if (!response.ok || !data.success) {
        setExecutionState("error");
        setOutput(data.output || "");
        setError(data.error || "Execution failed.");

        addCodeHistory(programTitle, code, "run", "Python");

        return;
      }

      setExecutionState("success");
      setOutput(data.output || "Program executed successfully.");
      setError(data.error || "");

      addCodeHistory(programTitle, code, "run", "Python");
    } catch (requestError) {
      console.error("Execution request failed:", requestError);

      setExecutionState("error");
      setError(
        "Could not connect to the execution server. Make sure the development server is running."
      );
      setExecutionTime(Math.round(performance.now() - startedAt));
    }
  }

  function stopCode() {
    setExecutionState("idle");
    setError("Execution cannot be force-stopped yet from the browser.");
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  function resetCode() {
    setCode(DEFAULT_CODE);
    setOutput("");
    setError("");
    setExecutionTime(null);
    setExecutionState("idle");
  }

  function handleExampleSelect(example: CodeExample) {
    setSelectedExample(example.id);
    setCode(example.code);
    setOutput("");
    setError("");
    setExecutionTime(null);
    setExecutionState("idle");
  }

  function handleSave() {
    if (!programTitle.trim()) {
      return;
    }

    saveCode(programTitle.trim(), code, "Python");

    setShowSaveDialog(false);
  }

  const isRunning = executionState === "running";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-400">
                <Terminal size={16} />
                Quantum Coding Lab
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Quantum Programming Playground
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Write, execute and test Python quantum programs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/coding/tutorials")}
                className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                <BookOpen size={16} />
                Tutorials
              </button>

              <button
                type="button"
                onClick={() => router.push("/coding/challenges")}
                className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                <Trophy size={16} />
                Challenges
              </button>

              <button
                type="button"
                onClick={() => router.push("/coding/assistant")}
                className="inline-flex items-center gap-2 border border-blue-800 bg-blue-950/40 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-900/50 hover:text-blue-200"
              >
                <Bot size={16} />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IDE */}
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid min-h-[720px] grid-cols-1 overflow-hidden border border-slate-800 bg-slate-900 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="border-b border-slate-800 bg-slate-950 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-800 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Explorer
              </span>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={() => setCode(DEFAULT_CODE)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <span className="text-blue-400">PY</span>
                main.py
              </button>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Environment
                </div>

                <div className="space-y-2 px-3 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Language</span>
                    <span className="text-slate-300">Python</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Quantum SDK</span>
                    <span className="text-slate-300">Qiskit</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Runtime</span>
                    <span className="text-slate-300">Local</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main IDE */}
          <section className="flex min-w-0 flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                  <span className="text-blue-400">PY</span>
                  main.py
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={runCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      Run
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={stopCode}
                  disabled={!isRunning}
                  className="inline-flex items-center gap-2 border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Square size={14} fill="currentColor" />
                  Stop
                </button>

                <button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  className="inline-flex items-center gap-2 border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <Save size={16} />
                  Save
                </button>

                <button
                  type="button"
                  onClick={copyCode}
                  className="border border-slate-700 bg-slate-950 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Copy code"
                >
                  <Copy size={16} />
                </button>

                <button
                  type="button"
                  onClick={resetCode}
                  className="border border-slate-700 bg-slate-950 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Reset code"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {copied && (
              <div className="border-b border-emerald-900 bg-emerald-950/30 px-4 py-2 text-xs font-medium text-emerald-400">
                Code copied to clipboard.
              </div>
            )}

            {/* Example Selector */}
            <div className="border-b border-slate-800 bg-slate-950 px-3 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Examples
                </span>

                <CodeExamples
                  selectedExample={selectedExample}
                  onSelect={handleExampleSelect}
                />
              </div>
            </div>

            {/* Editor */}
            <div className="min-h-[400px] flex-1 bg-[#0b1120]">
              <CodeEditor value={code} onChange={setCode} />
            </div>

            {/* Output */}
            <div className="border-t border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Terminal size={15} />
                    Output
                  </div>

                  {executionState === "success" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 size={13} />
                      Completed
                    </span>
                  )}

                  {executionState === "error" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                      <XCircle size={13} />
                      Failed
                    </span>
                  )}

                  {executionState === "running" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400">
                      <Loader2 size={13} className="animate-spin" />
                      Executing
                    </span>
                  )}
                </div>

                {executionTime !== null && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={13} />
                    {executionTime} ms
                  </div>
                )}
              </div>

              <div className="max-h-[320px] min-h-[180px] overflow-auto p-4 font-mono text-sm">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 size={16} className="animate-spin" />
                    Running your quantum program...
                  </div>
                ) : error ? (
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                      Error
                    </div>

                    <pre className="whitespace-pre-wrap text-red-300">
                      {error}
                    </pre>

                    {output && (
                      <>
                        <div className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-600">
                          Standard Output
                        </div>

                        <pre className="whitespace-pre-wrap text-slate-300">
                          {output}
                        </pre>
                      </>
                    )}
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap text-slate-200">
                    {output}
                  </pre>
                ) : (
                  <div className="text-slate-600">
                    Run your program to see the execution output here.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              Save Quantum Program
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Save this program to your local Code History.
            </p>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Program Name
            </label>

            <input
              value={programTitle}
              onChange={(event) => setProgramTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSave();
                }
              }}
              autoFocus
              className="mt-2 w-full border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-blue-500"
              placeholder="My Quantum Program"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
              >
                Save Program
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}