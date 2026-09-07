import { Assessment } from "@/types/assessment";

export const assessments: Assessment[] = [
  {
    id: "quantum-basics",
    title: "Quantum Basics Assessment",
    description:
      "Evaluate your understanding of qubits, superposition, measurement and Bloch sphere.",
    difficulty: "Beginner",
    duration: 30,
    questions: 20,
    passingMarks: 50,
    totalMarks: 100,
    topics: [
      "Qubits",
      "Superposition",
      "Measurement",
      "Bloch Sphere",
    ],
  },
  {
    id: "quantum-gates",
    title: "Quantum Gates Assessment",
    description:
      "Test your knowledge of single and multi-qubit quantum gates.",
    difficulty: "Intermediate",
    duration: 45,
    questions: 30,
    passingMarks: 60,
    totalMarks: 100,
    topics: [
      "Pauli-X",
      "Pauli-Y",
      "Pauli-Z",
      "Hadamard",
      "CNOT",
      "SWAP",
      "Phase Gates",
    ],
  },
  {
    id: "quantum-algorithms",
    title: "Quantum Algorithms Assessment",
    description:
      "Assess your understanding of major quantum algorithms.",
    difficulty: "Advanced",
    duration: 60,
    questions: 40,
    passingMarks: 70,
    totalMarks: 100,
    topics: [
      "Deutsch-Jozsa",
      "Grover",
      "Bernstein-Vazirani",
      "Quantum Fourier Transform",
      "QAOA",
      "VQE",
    ],
  },
];