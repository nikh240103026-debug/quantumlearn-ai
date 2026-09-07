import { AssessmentQuestion } from "@/types/assessmentQuestion";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "qb-1",
    assessmentId: "quantum-basics",
    question: "What is a qubit?",
    options: [
      { id: "A", text: "A classical bit" },
      { id: "B", text: "A quantum bit" },
      { id: "C", text: "A logic gate" },
      { id: "D", text: "A measurement device" },
    ],
    correctAnswer: "B",
    explanation:
      "A qubit is the basic unit of quantum information.",
    marks: 5,
    difficulty: "Easy",
    topic: "Qubits",
  },

  {
    id: "qb-2",
    assessmentId: "quantum-basics",
    question: "Which property allows a qubit to exist in multiple states simultaneously?",
    options: [
      { id: "A", text: "Measurement" },
      { id: "B", text: "Entanglement" },
      { id: "C", text: "Superposition" },
      { id: "D", text: "Interference" },
    ],
    correctAnswer: "C",
    explanation:
      "Superposition allows a qubit to exist in a combination of |0⟩ and |1⟩.",
    marks: 5,
    difficulty: "Easy",
    topic: "Superposition",
  },

  {
    id: "qg-1",
    assessmentId: "quantum-gates",
    question: "Which gate creates superposition from |0⟩?",
    options: [
      { id: "A", text: "X Gate" },
      { id: "B", text: "Y Gate" },
      { id: "C", text: "Hadamard Gate" },
      { id: "D", text: "Z Gate" },
    ],
    correctAnswer: "C",
    explanation:
      "The Hadamard gate transforms |0⟩ into an equal superposition.",
    marks: 5,
    difficulty: "Medium",
    topic: "Hadamard",
  },

  {
    id: "qg-2",
    assessmentId: "quantum-gates",
    question: "Which quantum gate flips a qubit from |0⟩ to |1⟩?",
    options: [
      { id: "A", text: "X Gate" },
      { id: "B", text: "Z Gate" },
      { id: "C", text: "S Gate" },
      { id: "D", text: "T Gate" },
    ],
    correctAnswer: "A",
    explanation:
      "The Pauli-X gate acts like a NOT gate.",
    marks: 5,
    difficulty: "Medium",
    topic: "Pauli-X",
  },

  {
    id: "qa-1",
    assessmentId: "quantum-algorithms",
    question: "Which algorithm provides quadratic speedup for unstructured search?",
    options: [
      { id: "A", text: "Shor's Algorithm" },
      { id: "B", text: "Grover's Algorithm" },
      { id: "C", text: "Deutsch-Jozsa" },
      { id: "D", text: "VQE" },
    ],
    correctAnswer: "B",
    explanation:
      "Grover's Algorithm provides quadratic speedup for searching unsorted databases.",
    marks: 5,
    difficulty: "Hard",
    topic: "Grover",
  },
];