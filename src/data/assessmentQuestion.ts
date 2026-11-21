import { AssessmentQuestion } from "@/types/assessmentQuestion";

/*
 * Assessment question bank. SERVER-ONLY: contains the answer key and is
 * read through lib/assessment/questionService.ts (marked "server-only").
 *
 * Each assessment has 10 questions worth 10 marks (total 100), matching
 * data/assessments.ts.
 */
export const assessmentQuestions: AssessmentQuestion[] = [
  // ==========================================================================
  // QUANTUM BASICS
  // ==========================================================================
  {
    id: "qb-1",
    assessmentId: "quantum-basics",
    question: "What is a qubit?",
    options: [
      { id: "A", text: "A classical bit" },
      { id: "B", text: "A logic gate" },
      { id: "C", text: "A quantum bit" },
      { id: "D", text: "A measurement device" },
    ],
    correctAnswer: "C",
    explanation:
      "A qubit is the basic unit of quantum information.",
    marks: 10,
    difficulty: "Easy",
    topic: "Qubits",
  },
  {
    id: "qb-2",
    assessmentId: "quantum-basics",
    question:
      "Which property allows a qubit to exist in multiple states simultaneously?",
    options: [
      { id: "A", text: "Superposition" },
      { id: "B", text: "Measurement" },
      { id: "C", text: "Entanglement" },
      { id: "D", text: "Interference" },
    ],
    correctAnswer: "A",
    explanation:
      "Superposition lets a qubit be in a combination α|0⟩ + β|1⟩ of both basis states.",
    marks: 10,
    difficulty: "Easy",
    topic: "Superposition",
  },
  {
    id: "qb-3",
    assessmentId: "quantum-basics",
    question:
      "A qubit is in the state (|0⟩ + |1⟩)/√2. What is the probability of measuring 1?",
    options: [
      { id: "A", text: "0" },
      { id: "B", text: "1/4" },
      { id: "C", text: "1" },
      { id: "D", text: "1/2" },
    ],
    correctAnswer: "D",
    explanation:
      "The probability is the squared magnitude of the amplitude: |1/√2|² = 1/2.",
    marks: 10,
    difficulty: "Easy",
    topic: "Measurement",
  },
  {
    id: "qb-4",
    assessmentId: "quantum-basics",
    question:
      "For the state 0.6|0⟩ + 0.8|1⟩, what is the probability of measuring |0⟩?",
    options: [
      { id: "A", text: "0.6" },
      { id: "B", text: "0.36" },
      { id: "C", text: "0.64" },
      { id: "D", text: "0.8" },
    ],
    correctAnswer: "B",
    explanation:
      "P(0) = |0.6|² = 0.36. The probabilities 0.36 and 0.64 add up to 1.",
    marks: 10,
    difficulty: "Medium",
    topic: "Measurement",
  },
  {
    id: "qb-5",
    assessmentId: "quantum-basics",
    question:
      "A qubit is measured and the result is 1. If it is measured again immediately, what is the result?",
    options: [
      { id: "A", text: "0 or 1 with equal probability" },
      { id: "B", text: "0 with certainty" },
      { id: "C", text: "It cannot be measured twice" },
      { id: "D", text: "1 with certainty" },
    ],
    correctAnswer: "D",
    explanation:
      "Measurement collapses the state to |1⟩, so an immediate repeat measurement gives 1 again.",
    marks: 10,
    difficulty: "Easy",
    topic: "Measurement",
  },
  {
    id: "qb-6",
    assessmentId: "quantum-basics",
    question:
      "For a qubit state α|0⟩ + β|1⟩, which condition must the amplitudes satisfy?",
    options: [
      { id: "A", text: "α + β = 1" },
      { id: "B", text: "|α|² + |β|² = 1" },
      { id: "C", text: "α · β = 0" },
      { id: "D", text: "|α| = |β|" },
    ],
    correctAnswer: "B",
    explanation:
      "The measurement probabilities |α|² and |β|² must sum to 1 (normalization).",
    marks: 10,
    difficulty: "Easy",
    topic: "Qubits",
  },
  {
    id: "qb-7",
    assessmentId: "quantum-basics",
    question:
      "How many complex amplitudes are needed to describe a general 3-qubit state?",
    options: [
      { id: "A", text: "8" },
      { id: "B", text: "3" },
      { id: "C", text: "6" },
      { id: "D", text: "9" },
    ],
    correctAnswer: "A",
    explanation:
      "An n-qubit state has 2ⁿ basis states, so 3 qubits need 2³ = 8 amplitudes.",
    marks: 10,
    difficulty: "Medium",
    topic: "Qubits",
  },
  {
    id: "qb-8",
    assessmentId: "quantum-basics",
    question: "Where are the states |0⟩ and |1⟩ on the Bloch sphere?",
    options: [
      { id: "A", text: "On the equator, opposite each other" },
      { id: "B", text: "Both at the centre" },
      { id: "C", text: "At the north and south poles" },
      { id: "D", text: "At the +X and −X points" },
    ],
    correctAnswer: "C",
    explanation:
      "By convention |0⟩ is the north pole (+Z) and |1⟩ the south pole (−Z).",
    marks: 10,
    difficulty: "Easy",
    topic: "Bloch Sphere",
  },
  {
    id: "qb-9",
    assessmentId: "quantum-basics",
    question:
      "The state |+⟩ = (|0⟩ + |1⟩)/√2 points along which axis of the Bloch sphere?",
    options: [
      { id: "A", text: "+X" },
      { id: "B", text: "+Z" },
      { id: "C", text: "−Z" },
      { id: "D", text: "+Y" },
    ],
    correctAnswer: "A",
    explanation:
      "Equal-weight superpositions lie on the equator; |+⟩ points along +X and |−⟩ along −X.",
    marks: 10,
    difficulty: "Medium",
    topic: "Bloch Sphere",
  },
  {
    id: "qb-10",
    assessmentId: "quantum-basics",
    question:
      "How do the states |ψ⟩ and e^(iφ)|ψ⟩ (differing only by a global phase) compare?",
    options: [
      { id: "A", text: "They are orthogonal" },
      { id: "B", text: "One of them is not normalized" },
      { id: "C", text: "Only one of them can be measured" },
      { id: "D", text: "They give identical measurement statistics" },
    ],
    correctAnswer: "D",
    explanation:
      "A global phase has no observable effect, so the two states are physically indistinguishable.",
    marks: 10,
    difficulty: "Hard",
    topic: "Superposition",
  },

  // ==========================================================================
  // QUANTUM GATES
  // ==========================================================================
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
      "H|0⟩ = (|0⟩ + |1⟩)/√2, an equal superposition.",
    marks: 10,
    difficulty: "Easy",
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
      "The Pauli-X gate is the quantum NOT: X|0⟩ = |1⟩ and X|1⟩ = |0⟩.",
    marks: 10,
    difficulty: "Easy",
    topic: "Pauli-X",
  },
  {
    id: "qg-3",
    assessmentId: "quantum-gates",
    question: "What is Z|1⟩?",
    options: [
      { id: "A", text: "|0⟩" },
      { id: "B", text: "|1⟩" },
      { id: "C", text: "i|1⟩" },
      { id: "D", text: "−|1⟩" },
    ],
    correctAnswer: "D",
    explanation:
      "Z leaves |0⟩ unchanged and multiplies |1⟩ by −1 (a phase flip).",
    marks: 10,
    difficulty: "Easy",
    topic: "Pauli-Z",
  },
  {
    id: "qg-4",
    assessmentId: "quantum-gates",
    question: "What is Y|0⟩?",
    options: [
      { id: "A", text: "|1⟩" },
      { id: "B", text: "i|1⟩" },
      { id: "C", text: "−i|1⟩" },
      { id: "D", text: "−|0⟩" },
    ],
    correctAnswer: "B",
    explanation:
      "Y = [[0, −i], [i, 0]], so Y|0⟩ = i|1⟩: a bit flip together with a phase.",
    marks: 10,
    difficulty: "Medium",
    topic: "Pauli-Y",
  },
  {
    id: "qg-5",
    assessmentId: "quantum-gates",
    question: "What happens when the Hadamard gate is applied twice in a row?",
    options: [
      { id: "A", text: "The qubit is measured" },
      { id: "B", text: "The qubit always ends in |1⟩" },
      { id: "C", text: "The global phase becomes −1" },
      { id: "D", text: "The qubit returns to its original state" },
    ],
    correctAnswer: "D",
    explanation:
      "H is its own inverse (H·H = I), so two Hadamards cancel out.",
    marks: 10,
    difficulty: "Easy",
    topic: "Hadamard",
  },
  {
    id: "qg-6",
    assessmentId: "quantum-gates",
    question:
      "A CNOT has its control qubit in |1⟩ and its target in |0⟩. What is the two-qubit state afterwards (control written first)?",
    options: [
      { id: "A", text: "|00⟩" },
      { id: "B", text: "|11⟩" },
      { id: "C", text: "|01⟩" },
      { id: "D", text: "|10⟩" },
    ],
    correctAnswer: "B",
    explanation:
      "The control is 1, so the target flips from 0 to 1, giving |11⟩.",
    marks: 10,
    difficulty: "Easy",
    topic: "CNOT",
  },
  {
    id: "qg-7",
    assessmentId: "quantum-gates",
    question:
      "Starting from |00⟩, apply H to qubit 0 and then a CNOT with qubit 0 as control and qubit 1 as target. What is the result?",
    options: [
      { id: "A", text: "(|00⟩ + |11⟩)/√2" },
      { id: "B", text: "(|00⟩ + |01⟩)/√2" },
      { id: "C", text: "|11⟩" },
      { id: "D", text: "(|01⟩ + |10⟩)/√2" },
    ],
    correctAnswer: "A",
    explanation:
      "H makes (|00⟩ + |10⟩)/√2, then CNOT flips the target only in the |10⟩ branch, giving the Bell state (|00⟩ + |11⟩)/√2.",
    marks: 10,
    difficulty: "Medium",
    topic: "CNOT",
  },
  {
    id: "qg-8",
    assessmentId: "quantum-gates",
    question: "What does a SWAP gate do to the state |01⟩?",
    options: [
      { id: "A", text: "Leaves it as |01⟩" },
      { id: "B", text: "Turns it into |11⟩" },
      { id: "C", text: "Turns it into |10⟩" },
      { id: "D", text: "Turns it into −|01⟩" },
    ],
    correctAnswer: "C",
    explanation:
      "SWAP exchanges the states of the two qubits, so |01⟩ becomes |10⟩.",
    marks: 10,
    difficulty: "Easy",
    topic: "SWAP",
  },
  {
    id: "qg-9",
    assessmentId: "quantum-gates",
    question: "Which phase gate is obtained by applying the T gate twice?",
    options: [
      { id: "A", text: "S" },
      { id: "B", text: "Z" },
      { id: "C", text: "H" },
      { id: "D", text: "X" },
    ],
    correctAnswer: "A",
    explanation:
      "T adds a phase of π/4 to |1⟩, so T·T adds π/2, which is the S gate (and S·S = Z).",
    marks: 10,
    difficulty: "Medium",
    topic: "Phase Gates",
  },
  {
    id: "qg-10",
    assessmentId: "quantum-gates",
    question: "What phase does the T gate apply to the |1⟩ component?",
    options: [
      { id: "A", text: "−1" },
      { id: "B", text: "i" },
      { id: "C", text: "e^(iπ/8)" },
      { id: "D", text: "e^(iπ/4)" },
    ],
    correctAnswer: "D",
    explanation:
      "T = diag(1, e^(iπ/4)); it leaves |0⟩ unchanged and multiplies |1⟩ by e^(iπ/4) = (1 + i)/√2.",
    marks: 10,
    difficulty: "Hard",
    topic: "Phase Gates",
  },

  // ==========================================================================
  // QUANTUM ALGORITHMS
  // ==========================================================================
  {
    id: "qa-1",
    assessmentId: "quantum-algorithms",
    question:
      "Which algorithm provides quadratic speedup for unstructured search?",
    options: [
      { id: "A", text: "Shor's Algorithm" },
      { id: "B", text: "Deutsch-Jozsa" },
      { id: "C", text: "Grover's Algorithm" },
      { id: "D", text: "VQE" },
    ],
    correctAnswer: "C",
    explanation:
      "Grover's algorithm searches N items in about √N steps instead of N.",
    marks: 10,
    difficulty: "Easy",
    topic: "Grover",
  },
  {
    id: "qa-2",
    assessmentId: "quantum-algorithms",
    question:
      "About how many Grover iterations are optimal for finding one marked item among N?",
    options: [
      { id: "A", text: "(π/4)√N" },
      { id: "B", text: "log₂ N" },
      { id: "C", text: "N/2" },
      { id: "D", text: "N" },
    ],
    correctAnswer: "A",
    explanation:
      "The success probability peaks after roughly (π/4)√N iterations; doing more over-rotates the state.",
    marks: 10,
    difficulty: "Medium",
    topic: "Grover",
  },
  {
    id: "qa-3",
    assessmentId: "quantum-algorithms",
    question:
      "How many oracle queries does Deutsch-Jozsa need to decide whether a function is constant or balanced?",
    options: [
      { id: "A", text: "n" },
      { id: "B", text: "2^(n−1) + 1" },
      { id: "C", text: "2ⁿ" },
      { id: "D", text: "1" },
    ],
    correctAnswer: "D",
    explanation:
      "A single query in superposition suffices; a deterministic classical algorithm can need 2^(n−1) + 1 queries.",
    marks: 10,
    difficulty: "Medium",
    topic: "Deutsch-Jozsa",
  },
  {
    id: "qa-4",
    assessmentId: "quantum-algorithms",
    question:
      "In Deutsch-Jozsa, the input register is measured as all zeros. What does this tell you?",
    options: [
      { id: "A", text: "The function is balanced" },
      { id: "B", text: "The function is constant" },
      { id: "C", text: "The oracle failed" },
      { id: "D", text: "Nothing; the result is random" },
    ],
    correctAnswer: "B",
    explanation:
      "For a constant function the amplitudes interfere so that |0…0⟩ is measured with certainty; for a balanced function it never is.",
    marks: 10,
    difficulty: "Hard",
    topic: "Deutsch-Jozsa",
  },
  {
    id: "qa-5",
    assessmentId: "quantum-algorithms",
    question:
      "Bernstein-Vazirani finds a hidden n-bit string s for f(x) = s·x (mod 2). How many oracle queries does it need?",
    options: [
      { id: "A", text: "log₂ n" },
      { id: "B", text: "n" },
      { id: "C", text: "2ⁿ" },
      { id: "D", text: "1" },
    ],
    correctAnswer: "D",
    explanation:
      "One quantum query reveals all of s; classically you need n queries, one per bit.",
    marks: 10,
    difficulty: "Medium",
    topic: "Bernstein-Vazirani",
  },
  {
    id: "qa-6",
    assessmentId: "quantum-algorithms",
    question:
      "How does the gate count of the standard Quantum Fourier Transform on n qubits scale?",
    options: [
      { id: "A", text: "O(n)" },
      { id: "B", text: "O(n²)" },
      { id: "C", text: "O(n · 2ⁿ)" },
      { id: "D", text: "O(2ⁿ)" },
    ],
    correctAnswer: "B",
    explanation:
      "The QFT uses n Hadamards and about n(n−1)/2 controlled-phase gates, so O(n²); the classical FFT on 2ⁿ values is O(n · 2ⁿ).",
    marks: 10,
    difficulty: "Hard",
    topic: "Quantum Fourier Transform",
  },
  {
    id: "qa-7",
    assessmentId: "quantum-algorithms",
    question:
      "Which algorithm uses the Quantum Fourier Transform as a key step to factor integers efficiently?",
    options: [
      { id: "A", text: "Shor's algorithm" },
      { id: "B", text: "Grover's algorithm" },
      { id: "C", text: "QAOA" },
      { id: "D", text: "Bernstein-Vazirani" },
    ],
    correctAnswer: "A",
    explanation:
      "Shor's algorithm finds the period of modular exponentiation with phase estimation, whose core is the QFT.",
    marks: 10,
    difficulty: "Easy",
    topic: "Quantum Fourier Transform",
  },
  {
    id: "qa-8",
    assessmentId: "quantum-algorithms",
    question: "What is the Variational Quantum Eigensolver (VQE) mainly used for?",
    options: [
      { id: "A", text: "Searching an unsorted database" },
      { id: "B", text: "Factoring large numbers" },
      { id: "C", text: "Estimating the ground-state energy of a Hamiltonian" },
      { id: "D", text: "Error-correcting logical qubits" },
    ],
    correctAnswer: "C",
    explanation:
      "VQE prepares a parameterized state, measures its energy, and lets a classical optimizer minimize it, e.g. for molecules.",
    marks: 10,
    difficulty: "Medium",
    topic: "VQE",
  },
  {
    id: "qa-9",
    assessmentId: "quantum-algorithms",
    question: "Which principle guarantees that VQE's measured energy bounds the true ground-state energy?",
    options: [
      { id: "A", text: "The variational principle: ⟨ψ|H|ψ⟩ ≥ E₀ for any normalized |ψ⟩" },
      { id: "B", text: "The no-cloning theorem" },
      { id: "C", text: "The uncertainty principle" },
      { id: "D", text: "The adiabatic theorem" },
    ],
    correctAnswer: "A",
    explanation:
      "Any trial state's energy expectation is at least the ground-state energy, so minimizing it approaches E₀ from above.",
    marks: 10,
    difficulty: "Hard",
    topic: "VQE",
  },
  {
    id: "qa-10",
    assessmentId: "quantum-algorithms",
    question:
      "What kind of problem is the Quantum Approximate Optimization Algorithm (QAOA) designed for?",
    options: [
      { id: "A", text: "Integer factoring" },
      { id: "B", text: "Simulating noise in hardware" },
      { id: "C", text: "Sorting lists" },
      { id: "D", text: "Combinatorial optimization, such as MaxCut" },
    ],
    correctAnswer: "D",
    explanation:
      "QAOA alternates cost and mixer layers with tunable angles to find good approximate solutions to combinatorial problems.",
    marks: 10,
    difficulty: "Medium",
    topic: "QAOA",
  },
];
