import type { AssessmentQuestion } from "@/types/assessmentQuestion";

/*
 * Final test for "Quantum Computing Fundamentals": two questions for each of
 * its ten lessons, 5 marks each (total 100), matching data/assessments.ts.
 *
 * SERVER-ONLY: contains the answer key. Read it through
 * lib/assessment/questionService.ts.
 */

type Entry = [
  topic: string,
  difficulty: AssessmentQuestion["difficulty"],
  question: string,
  options: [string, string, string, string],
  correctAnswer: "A" | "B" | "C" | "D",
  explanation: string,
];

const ENTRIES: Entry[] = [
  // What Is Quantum Computing?
  [
    "Quantum computing",
    "Easy",
    "Which statement best describes what a quantum computer can do?",
    [
      "It runs every program faster than a classical computer",
      "It can solve certain problems with fewer steps by using quantum effects",
      "It replaces bits with many-valued digits that can all be read at once",
      "It can solve problems that no classical computer could ever solve, given unlimited time",
    ],
    "B",
    "Quantum speedups exist for particular problems. Given unlimited time and memory, a classical computer can simulate a quantum one.",
  ],
  [
    "Quantum computing",
    "Medium",
    "Why do quantum algorithms rely on interference?",
    [
      "To make wrong answers less likely and right answers more likely when measured",
      "To copy a quantum state many times",
      "To stop qubits from becoming entangled",
      "To read every amplitude directly",
    ],
    "A",
    "Amplitudes can add or cancel. Algorithms arrange them so that correct outcomes are reinforced before measurement.",
  ],
  // Classical Bits vs Qubits
  [
    "Bits and qubits",
    "Easy",
    "How many complex amplitudes describe a general pure state of 3 qubits?",
    ["3", "6", "9", "8"],
    "D",
    "An n-qubit state has 2ⁿ amplitudes, so 3 qubits need 2³ = 8.",
  ],
  [
    "Bits and qubits",
    "Medium",
    "When a single qubit is measured in the computational basis, how much classical information does that measurement return?",
    ["Two real numbers, α and β", "An unlimited amount", "One bit", "Two bits"],
    "C",
    "A measurement returns 0 or 1, which is one bit, even though the state is described by continuous amplitudes.",
  ],
  // Quantum States and Superposition
  [
    "States and superposition",
    "Easy",
    "For the state α|0⟩ + β|1⟩ to be valid, what must be true?",
    ["α + β = 1", "|α|² + |β|² = 1", "α = β", "α and β must both be real"],
    "B",
    "The probabilities |α|² and |β|² must add up to 1.",
  ],
  [
    "States and superposition",
    "Medium",
    "Which pair of states gives identical results for every possible measurement?",
    ["|0⟩ and |1⟩", "|+⟩ and |−⟩", "|0⟩ and |+⟩", "|+⟩ and −|+⟩"],
    "D",
    "−|+⟩ differs from |+⟩ only by a global phase, which no measurement can detect.",
  ],
  // Measurement and Probability
  [
    "Measurement",
    "Easy",
    "A qubit is in the state (√3/2)|0⟩ + (1/2)|1⟩. What is the probability of measuring 1 in the computational basis?",
    ["1/4", "1/2", "√3/2", "3/4"],
    "A",
    "The probability is the squared magnitude of the amplitude: (1/2)² = 1/4.",
  ],
  [
    "Measurement",
    "Medium",
    "A qubit in state |+⟩ is measured in the computational basis and gives 0. It is immediately measured again in the same basis. What happens?",
    [
      "0 or 1 with equal probability",
      "It always gives 1",
      "It always gives 0",
      "The second measurement is not possible",
    ],
    "C",
    "The first measurement leaves the qubit in |0⟩, so repeating it gives 0 with certainty.",
  ],
  // The Bloch Sphere
  [
    "Bloch sphere",
    "Easy",
    "With |0⟩ at the north pole of the Bloch sphere, where is |+⟩?",
    ["At the south pole", "At the center", "On the equator, along +z", "On the equator, along +x"],
    "D",
    "|+⟩ = (|0⟩ + |1⟩)/√2 points along the positive x axis, on the equator.",
  ],
  [
    "Bloch sphere",
    "Medium",
    "Two single-qubit pure states are orthogonal. How are their points placed on the Bloch sphere?",
    ["At right angles", "At opposite ends of a diameter", "At the same point", "Both on the equator"],
    "B",
    "Orthogonal states are antipodal, like |0⟩ and |1⟩ at the two poles.",
  ],
  // Quantum Gates
  [
    "Quantum gates",
    "Easy",
    "Which property must the matrix of every quantum gate have?",
    ["It must be unitary", "Its entries must be real", "It must be diagonal", "Its determinant must be 0"],
    "A",
    "Unitary matrices keep total probability equal to 1 and can be reversed.",
  ],
  [
    "Quantum gates",
    "Medium",
    "A gate U is applied to a qubit. Which operation undoes it?",
    ["Applying U a second time, for any U", "Measuring the qubit", "Applying the conjugate transpose U†", "Applying the Pauli-X gate"],
    "C",
    "Because U is unitary, U†U = I. Applying U twice works only for gates that are their own inverse.",
  ],
  // Single-Qubit Gates
  [
    "Single-qubit gates",
    "Easy",
    "What state results from applying the Hadamard gate to |1⟩?",
    ["|0⟩", "(|0⟩ − |1⟩)/√2", "(|0⟩ + |1⟩)/√2", "|1⟩"],
    "B",
    "H|1⟩ = (|0⟩ − |1⟩)/√2, also written |−⟩.",
  ],
  [
    "Single-qubit gates",
    "Medium",
    "The sequence H, then Z, then H acts on a qubit. Which single gate does the same thing?",
    ["X", "Y", "Z", "S"],
    "A",
    "HZH = X: the Hadamard gate swaps the roles of the x and z axes.",
  ],
  // Multi-Qubit Systems
  [
    "Multi-qubit systems",
    "Easy",
    "A CNOT gate has the first qubit as control and the second as target. What does it do to |10⟩?",
    ["|00⟩", "|10⟩", "|01⟩", "|11⟩"],
    "D",
    "The control is 1, so the target flips from 0 to 1, giving |11⟩.",
  ],
  [
    "Multi-qubit systems",
    "Medium",
    "Two independent qubits are both in state |+⟩. What is the probability of measuring 01 in the computational basis?",
    ["0", "1/2", "1/4", "1"],
    "C",
    "The joint state has four equal amplitudes of 1/2, so each outcome has probability 1/4.",
  ],
  // Entanglement
  [
    "Entanglement",
    "Easy",
    "Which of these two-qubit states is entangled?",
    ["|01⟩", "(|00⟩ + |01⟩)/√2", "(|00⟩ + |01⟩ + |10⟩ + |11⟩)/2", "(|00⟩ + |11⟩)/√2"],
    "D",
    "(|00⟩ + |11⟩)/√2 cannot be written as a product of two single-qubit states. The others can.",
  ],
  [
    "Entanglement",
    "Hard",
    "Two people share the state (|00⟩ + |11⟩)/√2. Can one of them send a message faster than light just by measuring their qubit?",
    [
      "No, because the other person's results look random on their own",
      "Yes, because the two results always match",
      "Yes, but only one bit at a time",
      "No, because the two results are unrelated",
    ],
    "A",
    "The results are correlated, but each person sees 0 or 1 at random whatever the other does, so no message is carried.",
  ],
  // Quantum Circuits
  [
    "Quantum circuits",
    "Easy",
    "Both qubits start in |0⟩. Which circuit prepares (|00⟩ + |11⟩)/√2?",
    [
      "X on both qubits",
      "H on both qubits",
      "H on the first qubit, then CNOT with the first qubit as control",
      "CNOT with the first qubit as control, then X on the first qubit",
    ],
    "C",
    "H makes the first qubit (|0⟩ + |1⟩)/√2, and CNOT copies its basis value onto the second qubit.",
  ],
  [
    "Quantum circuits",
    "Medium",
    "A 2-qubit circuit applies X to both qubits at the same time, then one CNOT. What is its depth, not counting measurement?",
    ["1", "2", "3", "4"],
    "B",
    "Gates on different qubits can share a time step, so the X gates take one step and the CNOT takes another.",
  ],
];

export const finalTestQuestions: AssessmentQuestion[] = ENTRIES.map(
  ([topic, difficulty, question, options, correctAnswer, explanation], index) => ({
    id: `qf-${index + 1}`,
    assessmentId: "quantum-fundamentals-final",
    question,
    options: options.map((text, position) => ({ id: "ABCD"[position], text })),
    correctAnswer,
    explanation,
    marks: 5,
    difficulty,
    topic,
  }),
);
