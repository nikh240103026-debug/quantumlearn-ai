/*
 * Short quiz for each lesson, by lesson slug.
 *
 * SERVER-ONLY: contains answers. Read through lib/lesson-quiz.ts.
 */
export type QuizItem = readonly [
  question: string,
  options: readonly [string, string, string, string],
  /** Index of the right option. */
  answer: 0 | 1 | 2 | 3,
  explanation: string,
];

export const LESSON_QUIZZES: Record<string, readonly QuizItem[]> = {
  /* ---------------- Quantum Computing Fundamentals ---------------- */
  "what-is-quantum-computing": [
    ["Which task is a quantum computer expected to help with most?", ["Word processing", "Simulating molecules", "Streaming video", "Sorting a short list"], 1, "Molecules are quantum systems, so simulating them is a natural use."],
    ["What is decoherence?", ["A gate that resets a qubit", "Loss of quantum behaviour through contact with the environment", "A way to copy qubits", "A kind of measurement error in classical chips"], 1, "Unwanted interaction with the surroundings destroys superposition and entanglement."],
    ["What does hybrid quantum-classical computing mean?", ["Using qubits as ordinary bits", "Running the same program twice", "Classical and quantum processors each doing part of the work", "A computer that never needs measurement"], 2, "A classical computer often prepares, controls and optimizes what the quantum processor runs."],
  ],
  "classical-bits-vs-qubits": [
    ["How many values can a classical bit hold at one moment?", ["One", "Two", "Four", "Any number"], 0, "A bit is either 0 or 1 at any moment."],
    ["In α|0⟩ + β|1⟩, what is |β|²?", ["The phase of the qubit", "The probability of measuring 1", "The probability of measuring 0", "The energy of the qubit"], 1, "The squared magnitude of an amplitude is the probability of its outcome."],
    ["Why does superposition alone not give a speedup?", ["Qubits are slower than bits", "Superposition lasts forever", "A measurement returns one outcome, so interference must favour the useful ones", "Only entangled bits can be measured"], 2, "Without interference, measuring a superposition is just random sampling."],
  ],
  "quantum-states-and-superposition": [
    ["Which of these is a valid qubit state?", ["|0⟩ + |1⟩", "(3/5)|0⟩ + (4/5)|1⟩", "(1/2)|0⟩ + (1/2)|1⟩", "2|0⟩"], 1, "(3/5)² + (4/5)² = 9/25 + 16/25 = 1, so it is normalized."],
    ["Which phase can a measurement reveal?", ["Global phase only", "Relative phase, after a suitable gate such as H", "Neither", "Both, directly in the computational basis"], 1, "Relative phase changes interference, which shows up after changing basis. Global phase never shows."],
    ["What are α and β in α|0⟩ + β|1⟩?", ["Probabilities", "Measured results", "Probability amplitudes, which may be complex", "Whole numbers"], 2, "They are complex amplitudes; probabilities are their squared magnitudes."],
  ],
  "measurement-and-probability": [
    ["A qubit in (|0⟩ + i|1⟩)/√2 is measured in the computational basis. What is the probability of 1?", ["0", "1/4", "1/2", "1"], 2, "|i/√2|² = 1/2."],
    ["Why are many shots used?", ["To make the qubit last longer", "To estimate the probabilities of the outcomes", "To remove the need for gates", "To read α and β exactly"], 1, "Each shot gives one outcome; frequencies over many shots estimate the probabilities."],
    ["What is the state just after a computational-basis measurement gives 1?", ["|0⟩", "|+⟩", "|1⟩", "Unchanged"], 2, "The state is projected onto the observed basis state."],
  ],
  "the-bloch-sphere": [
    ["Where is |1⟩ on the Bloch sphere?", ["North pole", "South pole", "On the equator at +x", "At the center"], 1, "|0⟩ is the north pole and |1⟩ the south pole."],
    ["A pure state has Bloch z-coordinate 0.6. What is P(0)?", ["0.6", "0.36", "0.8", "0.2"], 2, "P(0) = (1 + z)/2 = 1.6/2 = 0.8."],
    ["What does the angle φ describe?", ["The relative phase between |0⟩ and |1⟩", "The probability of 0", "The length of the vector", "The global phase"], 0, "φ is the relative phase; θ sets the balance between |0⟩ and |1⟩."],
  ],
  "quantum-gates": [
    ["U₁ is applied first, then U₂. Which matrix describes both?", ["U₁U₂", "U₂U₁", "U₁ + U₂", "U₁ − U₂"], 1, "Matrices act from the right, so the first gate is the rightmost."],
    ["Which condition makes a matrix U a valid gate?", ["U†U = I", "U = U†", "det U = 0", "U² = U"], 0, "Gates are unitary: U†U = I."],
    ["Why can an ordinary AND gate not be a quantum gate as it stands?", ["It is too slow", "It has two inputs and one output, so it can't be reversed", "It uses zeros", "It changes phase"], 1, "Quantum gates are reversible; AND loses information about its inputs."],
  ],
  "single-qubit-gates": [
    ["What does the Z gate do to |1⟩?", ["Gives |0⟩", "Gives −|1⟩", "Gives |+⟩", "Leaves it as |1⟩ with no change"], 1, "Z|1⟩ = −|1⟩, and Z|0⟩ = |0⟩."],
    ["Which gate equals T applied twice?", ["Z", "H", "S", "X"], 2, "T is a 45° phase rotation, so T² is the 90° rotation S."],
    ["What does H do to |−⟩?", ["|0⟩", "|1⟩", "|+⟩", "|−⟩"], 1, "H is its own inverse and H|1⟩ = |−⟩, so H|−⟩ = |1⟩."],
  ],
  "multi-qubit-systems": [
    ["How many basis states does a 5-qubit system have?", ["10", "25", "32", "5"], 2, "2⁵ = 32."],
    ["What is the product state |+⟩ ⊗ |0⟩?", ["(|00⟩ + |10⟩)/√2", "(|00⟩ + |01⟩)/√2", "(|00⟩ + |11⟩)/√2", "|10⟩"], 0, "Expand (|0⟩ + |1⟩)/√2 ⊗ |0⟩, with the first qubit on the left."],
    ["When does a CNOT gate change its target?", ["Always", "When the control is |1⟩", "When the control is |0⟩", "Only after a measurement"], 1, "The target flips on the part of the state where the control is |1⟩."],
  ],
  "entanglement": [
    ["For α|00⟩ + β|01⟩ + γ|10⟩ + δ|11⟩, which condition means it is a product state?", ["α + δ = 1", "αδ − βγ = 0", "αβ = γδ = 1", "α = β = γ = δ only"], 1, "The state factors exactly when αδ = βγ."],
    ["One qubit of (|01⟩ + |10⟩)/√2 is measured and gives 0. What will the other give in the same basis?", ["0", "1", "0 or 1 with equal chance", "Nothing"], 1, "Only |01⟩ remains, so the other qubit gives 1."],
    ["What do violations of Bell inequalities show?", ["Messages can travel faster than light", "Entangled results can't be explained by pre-set local values", "Measurement is perfect", "Qubits are classical"], 1, "Local hidden variables can't reproduce the observed correlations."],
  ],
  "quantum-circuits": [
    ["What is the width of a circuit?", ["Its number of layers", "Its number of qubits", "Its number of shots", "Its number of measurements"], 1, "Width counts qubits; depth counts layers of operations."],
    ["What does the no-cloning theorem forbid?", ["Running a circuit twice", "Copying an arbitrary unknown quantum state", "Measuring two qubits", "Using CNOT"], 1, "No unitary operation can copy every unknown state."],
    ["Which part of a circuit can't be reversed?", ["A Hadamard gate", "A CNOT gate", "A measurement", "A T gate"], 2, "Gates are unitary and reversible; measurement is not."],
  ],

  /* ---------------- Quantum Algorithms (draft course) ---------------- */
  "oracles-and-phase-kickback": [
    ["What does the standard oracle U_f do to |x⟩|y⟩?", ["|x⟩|y ⊕ f(x)⟩", "|f(x)⟩|y⟩", "|x⟩|f(x)⟩ for every y", "|y⟩|x⟩"], 0, "It adds f(x) to the second register modulo 2, which keeps it reversible."],
    ["Which state of the target qubit turns an oracle into a phase (−1)^f(x)?", ["|0⟩", "|1⟩", "|+⟩", "|−⟩"], 3, "X|−⟩ = −|−⟩, so a flip of the target becomes a sign on |x⟩."],
    ["What does query complexity count?", ["Qubits", "Calls to the oracle", "Measurements", "Seconds"], 1, "It counts how often the oracle is used."],
  ],
  "deutsch-jozsa-algorithm": [
    ["What is promised about f?", ["It is one-to-one", "It is constant or balanced", "It is periodic", "It has one solution"], 1, "The problem promises that f is either constant or balanced."],
    ["How many oracle calls does Deutsch–Jozsa need?", ["1", "n", "2ⁿ⁻¹ + 1", "√(2ⁿ)"], 0, "One call is enough, with certainty."],
    ["If every measured bit is 0, what is f?", ["Balanced", "Constant", "Unknown", "Invalid"], 1, "The amplitude of |0…0⟩ is ±1 for constant f and 0 for balanced f."],
  ],
  "bernstein-vazirani-algorithm": [
    ["Which function hides the string s?", ["f(x) = s·x mod 2", "f(x) = x + s", "f(x) = x²", "f(x) = s for every x"], 0, "It is the bitwise inner product with s, modulo 2."],
    ["How many classical queries are needed to find an n-bit s with certainty?", ["1", "n", "2ⁿ", "√n"], 1, "Each query gives one bit of information, and querying each unit string reads s."],
    ["What does measuring the query register give at the end?", ["A random string", "s", "f(s)", "All zeros"], 1, "The final Hadamards turn the phase pattern into exactly |s⟩."],
  ],
  "grovers-search-algorithm": [
    ["About how many oracle calls find one marked item among N?", ["log N", "√N", "N/2", "N"], 1, "Grover needs about (π/4)√N iterations."],
    ["What does the diffusion step do?", ["Measures the state", "Reflects amplitudes about their mean", "Resets the qubits", "Copies the marked item"], 1, "It is 2|s⟩⟨s| − I, a reflection about the uniform state."],
    ["What happens with far too many iterations?", ["Nothing changes", "The success probability can fall again", "It always reaches 1 and stays", "The oracle stops working"], 1, "Each iteration is a rotation, so it can rotate past the target."],
  ],
  "quantum-fourier-transform": [
    ["What does the QFT produce from |0…0⟩?", ["|1…1⟩", "The uniform superposition", "|0…0⟩ unchanged", "A random state"], 1, "All phases are 1 when j = 0."],
    ["How does the gate count of the standard QFT on n qubits grow?", ["About n²", "About 2ⁿ", "About n!", "It is constant"], 0, "It uses n Hadamards and n(n−1)/2 controlled rotations, plus swaps."],
    ["Why does the QFT not simply replace the classical FFT?", ["It is not unitary", "Its output amplitudes can't all be read out", "It needs no input", "It works only on one qubit"], 1, "Measurement samples one outcome; it doesn't list the transformed values."],
  ],
  "quantum-phase-estimation": [
    ["Which quantity does phase estimation find?", ["θ in U|u⟩ = e^(2πiθ)|u⟩", "The determinant of U", "The number of qubits in |u⟩", "The fidelity of U"], 0, "It estimates the eigenphase θ."],
    ["What does adding one more counting qubit do?", ["Halves the precision", "Adds about one bit of precision", "Removes the need for U", "Doubles the eigenvalue"], 1, "Each counting qubit gives one more binary digit of θ."],
    ["Which step turns the phases into a readable number?", ["The inverse QFT", "A SWAP", "A CNOT", "A reset"], 0, "The inverse QFT maps the phase pattern to a basis state."],
  ],
  "shors-algorithm": [
    ["Factoring N is reduced to finding what?", ["The square root of N", "The order r of a modulo N", "The largest prime below N", "The number of digits of N"], 1, "The order r is the smallest positive r with a^r ≡ 1 (mod N)."],
    ["For N = 15 and a = 7, the order is r = 4. Which gives a factor?", ["gcd(7² − 1, 15) = 3", "gcd(7, 15) = 1", "7 + 4 = 11", "15/4"], 0, "7² − 1 = 48 and gcd(48, 15) = 3."],
    ["When must a different a be tried?", ["When r is even", "When r is odd, or a^(r/2) ≡ −1 (mod N)", "When gcd(a, N) > 1", "Never"], 1, "Those cases give only trivial factors. If gcd(a, N) > 1 you already have a factor."],
  ],
  "variational-algorithms": [
    ["What does VQE minimize?", ["The circuit width", "The expected energy ⟨ψ(θ)|H|ψ(θ)⟩", "The number of shots", "The phase of |0⟩"], 1, "The variational principle makes this an upper bound on the ground energy."],
    ["Who chooses the next parameters in a variational algorithm?", ["The oracle", "A classical optimizer", "The measurement", "Nobody; they are fixed"], 1, "The quantum device estimates the cost; a classical optimizer updates θ."],
    ["What is a barren plateau?", ["A region where gradients are nearly zero", "A circuit with no gates", "A fully entangled state", "A noise-free device"], 0, "Vanishing gradients make training very hard."],
  ],
};
