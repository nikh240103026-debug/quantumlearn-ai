import type { QuizItem } from "@/data/lessonQuizzes";

/*
 * More final-test questions. Each test draws a fixed number per topic, so
 * learners don't all see the same paper. SERVER-ONLY: contains answers.
 */
export type TopicItem = readonly [topic: string, ...item: QuizItem];

export const FUNDAMENTALS_EXTRA: readonly TopicItem[] = [
  ["Quantum computing", "Which statement about quantum advantage is correct?", ["It holds for every problem", "It depends on the problem and the hardware", "It needs no algorithm", "It means bits are obsolete"], 1, "Advantage is problem-dependent and must be shown against the best classical method."],
  ["Quantum computing", "Why is quantum error correction needed?", ["Gates are irreversible", "Qubits are disturbed by noise", "Measurement is free", "Classical bits never fail"], 1, "Noise and decoherence corrupt states, so information is spread over many physical qubits."],
  ["Bits and qubits", "How many classical bits are needed to list one outcome of measuring 4 qubits?", ["4", "8", "16", "2"], 0, "Each qubit gives one bit."],
  ["Bits and qubits", "Which statement about a qubit is true?", ["It stores infinitely many readable bits", "It can be copied freely", "Its state is described by two complex amplitudes up to normalization and global phase", "It is always 0 or 1"], 2, "A pure qubit state is α|0⟩ + β|1⟩, normalized and defined up to a global phase."],
  ["States and superposition", "What must c be so that c(|0⟩ + 2|1⟩) is normalized, with c positive?", ["1/3", "1/√3", "1/5", "1/√5"], 3, "c²(1 + 4) = 1, so c = 1/√5."],
  ["States and superposition", "What distinguishes |+⟩ from |−⟩?", ["Their probabilities in the computational basis", "Their relative phase", "Their global phase only", "Nothing"], 1, "Both give 50/50 in the computational basis; the sign is a relative phase."],
  ["Measurement", "A qubit is in (3/5)|0⟩ − (4/5)|1⟩. What is P(1)?", ["−4/5", "9/25", "16/25", "4/5"], 2, "|−4/5|² = 16/25."],
  ["Measurement", "|+⟩ is measured in the X basis. What happens?", ["It gives the + outcome with certainty", "50/50", "It gives the − outcome with certainty", "It can't be measured"], 0, "|+⟩ is an eigenstate of X, so the result is certain."],
  ["Bloch sphere", "Which states lie on the equator?", ["States with equal chances of 0 and 1", "Only |0⟩ and |1⟩", "Only mixed states", "States with P(0) = 1"], 0, "On the equator z = 0, so P(0) = P(1) = 1/2."],
  ["Bloch sphere", "Where does a maximally mixed single-qubit state sit?", ["North pole", "South pole", "On the equator", "At the center"], 3, "Its Bloch vector has length 0."],
  ["Quantum gates", "What does a unitary gate do to the total probability?", ["Halves it", "Keeps it at 1", "Doubles it", "Makes it random"], 1, "Unitary matrices preserve the norm of the state."],
  ["Quantum gates", "Which matrix is unitary?", ["[[1, 1], [0, 1]]", "[[2, 0], [0, 1]]", "[[0, 1], [1, 0]]", "[[1, 0], [0, 0]]"], 2, "That is the X gate. The others don't satisfy U†U = I."],
  ["Single-qubit gates", "Which gate swaps |0⟩ and |1⟩?", ["Z", "X", "S", "T"], 1, "X is the bit-flip gate."],
  ["Single-qubit gates", "What is S applied to |+⟩?", ["(|0⟩ + i|1⟩)/√2", "(|0⟩ − |1⟩)/√2", "|0⟩", "|1⟩"], 0, "S multiplies the |1⟩ amplitude by i."],
  ["Multi-qubit systems", "Which operator applies X to the second of two qubits only?", ["X ⊗ I", "I ⊗ X", "X ⊗ X", "I ⊗ I"], 1, "The left factor acts on the first qubit and the right factor on the second."],
  ["Multi-qubit systems", "CNOT has its control on the first qubit. What is CNOT|01⟩?", ["|01⟩", "|00⟩", "|11⟩", "|10⟩"], 0, "The control is 0, so nothing changes."],
  ["Entanglement", "Which state is a product state?", ["(|00⟩ − |11⟩)/√2", "(|01⟩ + |10⟩)/√2", "(|00⟩ + |10⟩)/√2", "(|01⟩ − |10⟩)/√2"], 2, "(|00⟩ + |10⟩)/√2 = |+⟩ ⊗ |0⟩. The others are Bell states."],
  ["Entanglement", "Besides a shared entangled pair, what does quantum teleportation need?", ["Two classical bits sent to the receiver", "A copy of the state", "Faster-than-light signalling", "Nothing"], 0, "The receiver needs the two measurement results to apply the right correction."],
  ["Quantum circuits", "What does the circuit H then H do to a qubit?", ["Flips it", "Leaves it unchanged", "Measures it", "Adds a phase of −1 to every state"], 1, "H is its own inverse."],
  ["Quantum circuits", "A 3-qubit circuit applies H to all qubits in one layer, then CNOT on qubits 1 and 2, then CNOT on qubits 2 and 3. What is its depth?", ["2", "3", "5", "6"], 1, "The two CNOTs share qubit 2, so they need separate layers: 1 + 1 + 1 = 3."],
];

export const ALGORITHMS_FINAL: readonly TopicItem[] = [
  ["Oracles", "Why is the oracle written |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩?", ["To make it reversible", "To measure x", "To copy y", "To remove interference"], 0, "Keeping x and using XOR makes the operation its own inverse, even when f is not."],
  ["Oracles", "With the target in |−⟩, what does the oracle do to |x⟩ when f(x) = 1?", ["Flips x", "Multiplies it by −1", "Nothing", "Measures it"], 1, "This is phase kickback."],
  ["Deutsch–Jozsa", "How many classical queries are needed in the worst case, with certainty, on n bits?", ["1", "n", "2ⁿ⁻¹ + 1", "2ⁿ"], 2, "After half the inputs agree, one more query settles it."],
  ["Deutsch–Jozsa", "What makes the |0…0⟩ amplitude vanish for a balanced f?", ["Equal numbers of + and − terms cancel", "Noise", "Measurement", "Entanglement with the environment"], 0, "The sum of (−1)^f(x) over all x is zero."],
  ["Bernstein–Vazirani", "For s = 101, what is f(110) = s·x mod 2?", ["0", "1", "2", "It can't be found"], 1, "1·1 + 0·1 + 1·0 = 1."],
  ["Bernstein–Vazirani", "How many quantum queries are needed?", ["1", "n", "n/2", "√n"], 0, "One query is enough."],
  ["Grover", "Roughly how many iterations are best for N = 16 and one marked item?", ["1", "3", "8", "16"], 1, "(π/4)√16 ≈ 3.14, so 3 iterations."],
  ["Grover", "What speedup does Grover give over unstructured classical search?", ["None", "Quadratic", "Exponential", "Logarithmic"], 1, "About √N queries instead of about N."],
  ["QFT", "Which gate is the QFT on one qubit?", ["X", "H", "S", "T"], 1, "For N = 2 the Fourier matrix is the Hadamard matrix."],
  ["QFT", "How many controlled rotations does the standard 4-qubit QFT use?", ["4", "6", "8", "16"], 1, "n(n − 1)/2 = 6."],
  ["Phase estimation", "Counting qubits read 101 exactly, with the first bit most significant. What is θ?", ["5/8", "3/8", "5", "1/5"], 0, "101 in binary is 5, and θ = 5/2³."],
  ["Phase estimation", "Which input makes phase estimation give a single eigenphase?", ["An eigenstate of U", "Any random state", "|0…0⟩ always", "A mixed state always"], 0, "A superposition of eigenstates gives one of their phases at random."],
  ["Shor", "What is the order of 2 modulo 7?", ["2", "3", "6", "7"], 1, "2³ = 8 ≡ 1 (mod 7)."],
  ["Shor", "Which part of Shor's algorithm is quantum?", ["Order finding", "Computing the gcd", "Checking whether N is even", "Multiplying the factors"], 0, "The rest is efficient classical number theory."],
  ["Variational", "Why is ⟨ψ|H|ψ⟩ useful for finding the ground energy?", ["It is always zero", "It is never below the ground energy", "It equals the largest eigenvalue", "It doesn't depend on ψ"], 1, "This is the variational principle."],
  ["Variational", "QAOA alternates which two kinds of layer?", ["Cost and mixer", "Measure and reset", "Encode and decode", "Copy and swap"], 0, "Cost layers add phases by objective value and mixer layers move amplitude between candidates."],
];
