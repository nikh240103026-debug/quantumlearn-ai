import { Assessment } from "@/types/assessment";

export const FINAL_TEST_DAILY_ATTEMPTS = 3;

export const assessments: Assessment[] = [
  {
    id: "quantum-basics",
    title: "Quantum Basics Assessment",
    description:
      "Evaluate your understanding of qubits, superposition, measurement and Bloch sphere.",
    difficulty: "Beginner",
    duration: 30,
    questions: 10,
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
    questions: 10,
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
    questions: 10,
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
  {
    id: "quantum-fundamentals-final",
    title: "Quantum Computing Fundamentals Final Test",
    description:
      `Covers all ten lessons. Pass it and complete every lesson to earn the course certificate. ${FINAL_TEST_DAILY_ATTEMPTS} attempts per day.`,
    difficulty: "Beginner",
    duration: 40,
    questions: 20,
    passingMarks: 60,
    totalMarks: 100,
    topics: [
      "Quantum computing",
      "Bits and qubits",
      "States and superposition",
      "Measurement",
      "Bloch sphere",
      "Quantum gates",
      "Single-qubit gates",
      "Multi-qubit systems",
      "Entanglement",
      "Quantum circuits",
    ],
    finalForCourse: "quantum-computing-fundamentals",
    drawPerTopic: 2,
  },
  {
    id: "quantum-algorithms-final",
    title: "Quantum Algorithms Final Test",
    description:
      `Covers all eight lessons. Pass it and complete every lesson to earn the course certificate. ${FINAL_TEST_DAILY_ATTEMPTS} attempts per day.`,
    difficulty: "Intermediate",
    duration: 40,
    questions: 16,
    passingMarks: 60,
    totalMarks: 80,
    topics: ["Oracles", "Deutsch–Jozsa", "Bernstein–Vazirani", "Grover", "QFT", "Phase estimation", "Shor", "Variational"],
    finalForCourse: "quantum-algorithms-course",
    drawPerTopic: 2,
    // List it when the course is published.
    unlisted: true,
  },
];