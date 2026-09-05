"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  Circle,
  Code2,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
} from "lucide-react";
import {
  codingTutorials,
  tutorialFrameworks,
  type TutorialFramework,
} from "@/lib/coding-tutorials";

const frameworkMeta: Record<
  TutorialFramework,
  {
    label: string;
    description: string;
  }
> = {
  Qiskit: {
    label: "Qiskit",
    description: "IBM quantum programming framework",
  },
  Cirq: {
    label: "Cirq",
    description: "Quantum circuit framework from Google",
  },
  PennyLane: {
    label: "PennyLane",
    description: "Quantum machine learning framework",
  },
};

export default function CodingTutorials() {
  const [framework, setFramework] =
    useState<TutorialFramework>("Qiskit");

  const [selectedTutorial, setSelectedTutorial] = useState(
    codingTutorials.find((item) => item.framework === "Qiskit")?.id ??
      codingTutorials[0].id
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const visibleTutorials = useMemo(
    () =>
      codingTutorials.filter(
        (tutorial) => tutorial.framework === framework
      ),
    [framework]
  );

  const tutorial =
    codingTutorials.find((item) => item.id === selectedTutorial) ??
    visibleTutorials[0];

  const step = tutorial.steps[stepIndex];

  function selectFramework(nextFramework: TutorialFramework) {
    const firstTutorial = codingTutorials.find(
      (item) => item.framework === nextFramework
    );

    if (!firstTutorial) return;

    setFramework(nextFramework);
    setSelectedTutorial(firstTutorial.id);
    setStepIndex(0);
    setCompleted(false);
    setCode(firstTutorial.steps[0].code);
    setOutput("");
  }

  function selectTutorial(id: string) {
    const nextTutorial = codingTutorials.find(
      (item) => item.id === id
    );

    if (!nextTutorial) return;

    setSelectedTutorial(id);
    setStepIndex(0);
    setCompleted(false);
    setCode(nextTutorial.steps[0].code);
    setOutput("");
  }

  function goNext() {
    if (stepIndex < tutorial.steps.length - 1) {
      const nextIndex = stepIndex + 1;

      setStepIndex(nextIndex);
      setCode(tutorial.steps[nextIndex].code);
      setOutput("");
      setCompleted(false);
      return;
    }

    setCompleted(true);
  }

  function goPrevious() {
    if (stepIndex === 0) return;

    const previousIndex = stepIndex - 1;

    setStepIndex(previousIndex);
    setCode(tutorial.steps[previousIndex].code);
    setOutput("");
    setCompleted(false);
  }

  function resetTutorial() {
    setStepIndex(0);
    setCode(tutorial.steps[0].code);
    setOutput("");
    setCompleted(false);
  }

  async function runCode() {
    setOutput("Running...");

    try {
      const response = await fetch("/api/coding/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: "python",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(
          data?.error ||
            data?.stderr ||
            "Code execution failed."
        );
        return;
      }

      setOutput(
        data?.stdout ||
          data?.output ||
          "Program executed successfully with no output."
      );
    } catch {
      setOutput("Unable to connect to the execution engine.");
    }
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100">
      <header className="border-b border-slate-800 bg-[#07101d]">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <BookOpen size={19} />
            </div>

            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                Quantum Coding Tutorials
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Qiskit · Cirq · PennyLane
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/coding/assistant"
              className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/15"
            >
              <Bot size={14} />
              <span className="hidden sm:inline">
                AI Assistant
              </span>
            </a>

            <a
              href="/coding/challenges"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Trophy size={14} />
              <span className="hidden sm:inline">
                Challenges
              </span>
            </a>

            <a
              href="/coding"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Code2 size={14} />
              <span className="hidden sm:inline">
                Playground
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-[#080f1a]">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tutorialFrameworks.map((item) => {
              const active = framework === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectFramework(item)}
                  className={`border-b-2 px-5 py-4 text-xs font-bold transition ${
                    active
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {frameworkMeta[item].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-px bg-slate-800 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-[calc(100vh-7rem)] bg-[#080f1a]">
          <div className="border-b border-slate-800 px-4 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              {framework}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {frameworkMeta[framework].description}
            </p>
          </div>

          <div className="p-2">
            {visibleTutorials.map((item, index) => {
              const active = item.id === selectedTutorial;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTutorial(item.id)}
                  className={`group flex w-full items-start gap-3 border-l-2 px-3 py-4 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-transparent hover:bg-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] font-bold ${
                      active
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`block text-xs font-semibold ${
                        active
                          ? "text-blue-300"
                          : "text-slate-300"
                      }`}
                    >
                      {item.title}
                    </span>

                    <span className="mt-1 block text-[10px] text-slate-600">
                      {item.level} · {item.duration}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 bg-[#050b14]">
          <div className="border-b border-slate-800 px-5 py-6 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                    {tutorial.framework}
                  </span>

                  <span className="border border-slate-800 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    {tutorial.level}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {tutorial.title}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {tutorial.description}
                </p>
              </div>

              <button
                type="button"
                onClick={resetTutorial}
                className="inline-flex items-center gap-2 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-700 hover:text-slate-300"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-px bg-slate-800 xl:grid-cols-2">
            <section className="bg-[#07101d]">
              <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      Step {stepIndex + 1} / {tutorial.steps.length}
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-slate-200">
                      {step.title}
                    </h3>
                  </div>

                  <div className="text-[10px] text-slate-600">
                    {tutorial.duration}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-slate-400">
                  {step.explanation}
                </p>

                <div className="mt-6 border border-slate-800 bg-[#050a11]">
                  <div className="flex h-10 items-center justify-between border-b border-slate-800 px-4">
                    <div className="flex items-center gap-2">
                      <Code2 size={13} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        lesson.py
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={runCode}
                      className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-blue-500"
                    >
                      <Play size={11} fill="currentColor" />
                      Run
                    </button>
                  </div>

                  <textarea
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value)
                    }
                    spellCheck={false}
                    className="min-h-[360px] w-full resize-y bg-transparent p-5 font-mono text-xs leading-6 text-slate-300 outline-none"
                  />
                </div>

                <div className="mt-4 border border-slate-800 bg-[#050a11]">
                  <div className="flex h-9 items-center gap-2 border-b border-slate-800 px-4">
                    <Terminal size={12} className="text-slate-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Output
                    </span>
                  </div>

                  <pre className="min-h-[100px] whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 text-slate-400">
                    {output || step.expectedOutput}
                  </pre>
                </div>
              </div>
            </section>

            <section className="bg-[#080f1a]">
              <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  Learning checkpoint
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="border border-blue-500/20 bg-blue-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-400">
                      <Check size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-blue-300">
                        Checkpoint
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {step.checkpoint}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-slate-800 bg-[#050a11]">
                  <div className="border-b border-slate-800 px-4 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      Expected result
                    </p>
                  </div>

                  <pre className="whitespace-pre-wrap p-5 font-mono text-xs leading-6 text-slate-500">
                    {step.expectedOutput}
                  </pre>
                </div>

                <div className="mt-6 grid gap-px bg-slate-800 sm:grid-cols-3">
                  <div className="bg-[#07101d] p-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      <Circle size={9} />
                      Level
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-300">
                      {tutorial.level}
                    </p>
                  </div>

                  <div className="bg-[#07101d] p-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      <Terminal size={10} />
                      Framework
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-300">
                      {tutorial.framework}
                    </p>
                  </div>

                  <div className="bg-[#07101d] p-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      <Play size={10} />
                      Duration
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-300">
                      {tutorial.duration}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 bg-[#07101d] px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={goPrevious}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            {completed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check size={16} />
                Tutorial completed
              </div>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                {stepIndex === tutorial.steps.length - 1
                  ? "Complete"
                  : "Next Step"}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}