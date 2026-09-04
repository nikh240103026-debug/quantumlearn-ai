"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Code2,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { Trophy } from "lucide-react";
import { Bot } from "lucide-react";

interface TutorialStep {
  title: string;
  explanation: string;
  code: string;
  output: string;
  checkpoint: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate";
  duration: string;
  steps: TutorialStep[];
}

const tutorials: Tutorial[] = [
  {
    id: "first-qubit",
    title: "Your First Qubit",
    description:
      "Learn how to create a quantum circuit and initialize a single qubit.",
    level: "Beginner",
    duration: "10 min",
    steps: [
      {
        title: "Import QuantumCircuit",
        explanation:
          "Quantum circuits are represented using QuantumCircuit in Qiskit. Start by importing it into your Python program.",
        code: `from qiskit import QuantumCircuit`,
        output: "QuantumCircuit imported successfully.",
        checkpoint: "You imported the QuantumCircuit class.",
      },
      {
        title: "Create a Qubit",
        explanation:
          "Create a circuit containing one qubit. The argument 1 tells Qiskit to allocate one quantum bit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)`,
        output: "Quantum circuit created.\nQubits: 1",
        checkpoint: "Your circuit now contains 1 qubit.",
      },
      {
        title: "Inspect the Circuit",
        explanation:
          "Printing the circuit gives a visual representation of its current quantum registers and operations.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

print(qc)`,
        output: "     \nq: ──\n     \n\nCircuit contains one qubit.",
        checkpoint: "The circuit is ready for quantum operations.",
      },
    ],
  },
  {
    id: "hadamard",
    title: "Create Superposition",
    description:
      "Use the Hadamard gate to place a qubit into a superposition.",
    level: "Beginner",
    duration: "15 min",
    steps: [
      {
        title: "Create the Circuit",
        explanation:
          "Begin with a circuit containing one qubit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)`,
        output: "Circuit created with 1 qubit.",
        checkpoint: "One qubit is available.",
      },
      {
        title: "Apply Hadamard",
        explanation:
          "The Hadamard gate transforms |0⟩ into an equal superposition of |0⟩ and |1⟩.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.h(0)`,
        output: "Hadamard gate applied to qubit 0.",
        checkpoint: "|0⟩ → (|0⟩ + |1⟩) / √2",
      },
      {
        title: "Visualize the Circuit",
        explanation:
          "Print the circuit to inspect the gate that was applied.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.h(0)

print(qc)`,
        output: "     ┌───┐\nq: ──┤ H ├──\n     └───┘",
        checkpoint: "You created your first superposition circuit.",
      },
    ],
  },
  {
    id: "bell-state",
    title: "Build a Bell State",
    description:
      "Combine a Hadamard and CNOT gate to create entanglement.",
    level: "Intermediate",
    duration: "20 min",
    steps: [
      {
        title: "Create Two Qubits",
        explanation:
          "A Bell state requires two qubits, so initialize a two-qubit circuit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)`,
        output: "Circuit created with 2 qubits.",
        checkpoint: "Two qubits are available.",
      },
      {
        title: "Create Superposition",
        explanation:
          "Apply a Hadamard gate to the first qubit. This creates superposition on qubit 0.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)`,
        output: "Hadamard gate applied to q0.",
        checkpoint: "Qubit 0 is in superposition.",
      },
      {
        title: "Entangle the Qubits",
        explanation:
          "Apply a controlled-X gate with qubit 0 as the control and qubit 1 as the target.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

print(qc)`,
        output:
          "     ┌───┐     \nq_0: ┤ H ├──■──\n     └───┘┌─┴─┐\nq_1: ─────┤ X ├\n          └───┘",
        checkpoint: "Bell state circuit created successfully.",
      },
    ],
  },
];

export default function CodingTutorials() {
  const [selectedTutorial, setSelectedTutorial] =
    useState("first-qubit");
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [code, setCode] = useState("");

  const tutorial = useMemo(
    () => tutorials.find((item) => item.id === selectedTutorial)!,
    [selectedTutorial]
  );

  const step = tutorial.steps[stepIndex];

  function selectTutorial(id: string) {
    setSelectedTutorial(id);
    setStepIndex(0);
    setCompleted(false);
    setCode(tutorials.find((item) => item.id === id)?.steps[0].code ?? "");
  }

  function goNext() {
    if (stepIndex < tutorial.steps.length - 1) {
      setStepIndex((value) => value + 1);
      setCode(tutorial.steps[stepIndex + 1].code);
      return;
    }

    setCompleted(true);
  }

  function goPrevious() {
    if (stepIndex === 0) return;

    setStepIndex((value) => value - 1);
    setCode(tutorial.steps[stepIndex - 1].code);
    setCompleted(false);
  }

  function resetTutorial() {
    setStepIndex(0);
    setCompleted(false);
    setCode(tutorial.steps[0].code);
  }

  function runCode() {
    // Educational preview until the secure execution backend is connected.
  }

  return (
    <div className="min-h-screen text-slate-100">
      {/* Header */}
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
                Learn quantum programming step by step
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/coding/assistant"
              className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:border-blue-500/50 hover:bg-blue-500/15"
            >
              <Bot size={14} />
              <span className="hidden sm:inline">AI Assistant</span>
            </a>

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

      <div className="mx-auto grid max-w-[1500px] gap-px bg-slate-800 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Tutorial List */}
        <aside className="min-h-[calc(100vh-4rem)] bg-[#080f1a]">
          <div className="border-b border-slate-800 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Learning Path
            </p>
          </div>

          <div className="p-2">
            {tutorials.map((item, index) => {
              const active = item.id === selectedTutorial;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTutorial(item.id)}
                  className={`mb-1 flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-transparent hover:bg-slate-900"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] font-bold ${
                      active
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-slate-800 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold ${
                        active ? "text-blue-300" : "text-slate-300"
                      }`}
                    >
                      {item.title}
                    </div>

                    <div className="mt-1 text-[10px] leading-4 text-slate-600">
                      {item.level} · {item.duration}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Tutorial Workspace */}
        <main className="min-w-0 bg-[#050b14]">
          <div className="border-b border-slate-800 px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <span>Tutorials</span>
              <ChevronRight size={12} />
              <span className="text-blue-400">{tutorial.level}</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              {tutorial.title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {tutorial.description}
            </p>
          </div>

          <div className="grid gap-px bg-slate-800 lg:grid-cols-2">
            {/* Lesson */}
            <section className="bg-[#07101d]">
              <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Step {stepIndex + 1} of {tutorial.steps.length}
                    </p>

                    <h3 className="mt-1 text-base font-bold text-white">
                      {step.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={resetTutorial}
                    className="text-slate-600 transition hover:text-slate-300"
                    title="Reset tutorial"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                {/* Progress */}
                <div className="mt-4 flex gap-1">
                  {tutorial.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 ${
                        index <= stepIndex
                          ? "bg-blue-500"
                          : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <p className="text-sm leading-7 text-slate-400">
                  {step.explanation}
                </p>

                <div className="mt-7 border border-slate-800 bg-[#03070d]">
                  <div className="flex h-10 items-center justify-between border-b border-slate-800 px-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <Code2 size={13} />
                      Key Concept
                    </div>

                    <span className="text-[10px] text-slate-700">
                      Qiskit
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="font-mono text-xs leading-6 text-blue-300">
                      {step.checkpoint}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Code */}
            <section className="flex min-h-[520px] flex-col bg-[#03070d]">
              <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">
                <div className="flex items-center gap-2">
                  <Code2 size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    lesson.py
                  </span>
                </div>

                <button
                  type="button"
                  onClick={runCode}
                  className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-blue-500"
                >
                  <Play size={12} fill="currentColor" />
                  Run
                </button>
              </div>

              <div className="flex min-h-0 flex-1">
                <div className="w-10 shrink-0 border-r border-slate-900 bg-[#050a11] py-4 text-right font-mono text-[11px] leading-6 text-slate-700">
                  {code.split("\n").map((_, index) => (
                    <div key={index} className="pr-2">
                      {index + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  className="min-h-[400px] flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-xs leading-6 text-slate-300 outline-none"
                />
              </div>

              <div className="border-t border-slate-800">
                <div className="flex h-10 items-center gap-2 border-b border-slate-800 bg-[#080f1a] px-4">
                  <Terminal size={13} className="text-slate-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Output
                  </span>
                </div>

                <pre className="min-h-[105px] whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 text-slate-500">
                  {step.output}
                </pre>
              </div>
            </section>
          </div>

          {/* Navigation */}
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

          {/* Bottom Info */}
          <div className="grid border-t border-slate-800 sm:grid-cols-3">
            <div className="border-b border-slate-800 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <Circle size={10} />
                Level
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                {tutorial.level}
              </p>
            </div>

            <div className="border-b border-slate-800 p-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <Terminal size={11} />
                Language
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                Python + Qiskit
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <Play size={11} />
                Duration
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                {tutorial.duration}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}