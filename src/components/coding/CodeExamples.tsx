"use client";

import {
  Atom,
  CircleDot,
  GitBranch,
  Hash,
  Layers,
  Zap,
} from "lucide-react";

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  category: "Basics" | "Gates" | "Circuits";
  icon: "atom" | "zap" | "circle" | "branch" | "layers" | "hash";
  code: string;
  output: string;
}

const examples: CodeExample[] = [
  {
    id: "hello-qubit",
    title: "Hello Qubit",
    description: "Create a single qubit",
    category: "Basics",
    icon: "atom",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

print(qc)`,
    output: "     ┌───┐\nq: ──┤   ├──\n     └───┘\n\nCircuit created successfully.",
  },
  {
    id: "hadamard",
    title: "Hadamard Gate",
    description: "Create a superposition",
    category: "Gates",
    icon: "zap",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.h(0)

print(qc)`,
    output:
      "     ┌───┐\nq: ──┤ H ├──\n     └───┘\n\nHadamard gate applied to qubit 0.",
  },
  {
    id: "pauli-x",
    title: "Pauli-X Gate",
    description: "Flip a qubit state",
    category: "Gates",
    icon: "circle",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.x(0)

print(qc)`,
    output:
      "     ┌───┐\nq: ──┤ X ├──\n     └───┘\n\nPauli-X gate applied to qubit 0.",
  },
  {
    id: "measurement",
    title: "Measurement",
    description: "Measure a qubit",
    category: "Basics",
    icon: "hash",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)

qc.h(0)
qc.measure(0, 0)

print(qc)`,
    output:
      "     ┌───┐┌─┐\nq: ──┤ H ├┤M├\n     └───┘└╥┘\nc: ═════════╩═\n\nMeasurement circuit created.",
  },
  {
    id: "bell-state",
    title: "Bell State",
    description: "Create entanglement",
    category: "Circuits",
    icon: "branch",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

print(qc)`,
    output:
      "     ┌───┐\nq_0: ┤ H ├──■──\n     └───┘┌─┴─┐\nq_1: ─────┤ X ├\n          └───┘\n\nBell state circuit created.",
  },
  {
    id: "three-qubit",
    title: "Three Qubits",
    description: "Build a 3-qubit circuit",
    category: "Circuits",
    icon: "layers",
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(3)

qc.h(0)
qc.h(1)
qc.x(2)

print(qc)`,
    output:
      "Three-qubit circuit created.\n\nH applied to q0\nH applied to q1\nX applied to q2",
  },
];

const iconMap = {
  atom: Atom,
  zap: Zap,
  circle: CircleDot,
  branch: GitBranch,
  layers: Layers,
  hash: Hash,
};

interface CodeExamplesProps {
  selectedExample: string;
  onSelect: (example: CodeExample) => void;
}

function ExampleItem({
  example,
  selected,
  onSelect,
}: {
  example: CodeExample;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = iconMap[example.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-start gap-3 border-l-2 px-3 py-3 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-transparent hover:bg-slate-900"
      }`}
    >
      <Icon
        size={16}
        className={`mt-0.5 shrink-0 ${
          selected
            ? "text-blue-400"
            : "text-slate-600 group-hover:text-slate-400"
        }`}
      />

      <span className="min-w-0">
        <span
          className={`block text-xs font-semibold ${
            selected ? "text-blue-300" : "text-slate-300"
          }`}
        >
          {example.title}
        </span>

        <span className="mt-0.5 block text-[11px] leading-4 text-slate-600">
          {example.description}
        </span>
      </span>
    </button>
  );
}

export default function CodeExamples({
  selectedExample,
  onSelect,
}: CodeExamplesProps) {
  const categories = ["Basics", "Gates", "Circuits"] as const;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {categories.map((category) => {
        const categoryExamples = examples.filter(
          (example) => example.category === category
        );

        return (
          <div key={category} className="border-b border-slate-900 py-2">
            <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
              {category}
            </div>

            {categoryExamples.map((example) => (
              <ExampleItem
                key={example.id}
                example={example}
                selected={selectedExample === example.id}
                onSelect={() => onSelect(example)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

CodeExamples.examples = examples;