export type GlossaryTerm = {
  slug: string;
  term: string;
  /** One sentence, used in search results. */
  short: string;
  detail: string;
  related: string[];
};

const t = (slug: string, term: string, short: string, detail: string, related: string[] = []): GlossaryTerm => ({
  slug, term, short, detail, related,
});

export const GLOSSARY: GlossaryTerm[] = [
  t("amplitude", "Amplitude", "A complex number attached to each basis state of a quantum state.", "The squared magnitude of an amplitude is the probability of measuring its basis state. Unlike probabilities, amplitudes can be negative or complex, so they can cancel.", ["born-rule", "interference", "superposition"]),
  t("ansatz", "Ansatz", "A circuit with adjustable parameters used in variational algorithms.", "The parameters are tuned by a classical optimizer. A good ansatz can represent the answer while staying short enough to run on noisy hardware.", ["vqe", "qaoa", "barren-plateau"]),
  t("barren-plateau", "Barren plateau", "A region of a variational problem where gradients are almost zero.", "On a barren plateau the optimizer gets no useful direction. Gradients can shrink exponentially as qubits are added.", ["ansatz", "vqe"]),
  t("bell-state", "Bell state", "One of four maximally entangled states of two qubits.", "An example is (|00⟩ + |11⟩)/√2. Each qubit alone gives random results, but the two results are perfectly related.", ["entanglement", "cnot", "quantum-teleportation"]),
  t("bloch-sphere", "Bloch sphere", "A sphere whose points represent the states of one qubit.", "Pure states lie on the surface, with |0⟩ at the north pole and |1⟩ at the south pole. Mixed states lie inside. Single-qubit gates act as rotations.", ["qubit", "quantum-gate", "mixed-state"]),
  t("born-rule", "Born rule", "The rule that turns amplitudes into measurement probabilities.", "The probability of an outcome is the squared magnitude of its amplitude. For α|0⟩ + β|1⟩, the chance of measuring 1 is |β|².", ["amplitude", "measurement"]),
  t("cnot", "CNOT gate", "A two-qubit gate that flips the target when the control is |1⟩.", "Also called CX. Together with single-qubit gates it can build any quantum circuit. Applied after a Hadamard on the control, it creates a Bell state.", ["bell-state", "quantum-gate", "toffoli-gate"]),
  t("circuit-depth", "Circuit depth", "The number of layers of operations in a quantum circuit.", "Gates on different qubits can share a layer. Deeper circuits take longer and collect more noise.", ["quantum-circuit", "decoherence"]),
  t("coherence-time", "Coherence time", "How long a qubit keeps its quantum state.", "T1 describes energy loss and T2 the loss of phase. A computation has to finish well within these times or use error correction.", ["decoherence", "quantum-error-correction"]),
  t("decoherence", "Decoherence", "Loss of quantum behaviour through contact with the environment.", "Decoherence destroys relative phases and entanglement, which is a main reason quantum computers are hard to build.", ["coherence-time", "noise"]),
  t("density-matrix", "Density matrix", "A matrix that describes pure and mixed quantum states.", "For a pure state it is |ψ⟩⟨ψ|. It has trace 1 and no negative eigenvalues. It is used when a state is noisy or part of a larger system.", ["mixed-state", "entanglement"]),
  t("deutsch-jozsa", "Deutsch–Jozsa algorithm", "Tells a constant function from a balanced one with one query.", "It was one of the first algorithms to show an exact quantum advantage in queries. Randomized classical methods do nearly as well, so its value is mainly educational.", ["oracle", "interference"]),
  t("entanglement", "Entanglement", "A link between qubits that cannot be described one qubit at a time.", "Measuring entangled qubits gives related results that no pre-set local values can explain. It cannot be used to send messages faster than light.", ["bell-state", "quantum-teleportation", "density-matrix"]),
  t("fidelity", "Fidelity", "A measure of how close two quantum states or operations are.", "Fidelity 1 means identical. Hardware makers quote gate fidelities such as 99.9% to describe quality.", ["noise", "quantum-gate"]),
  t("global-phase", "Global phase", "A phase multiplying the whole state, with no observable effect.", "|ψ⟩ and e^(iγ)|ψ⟩ give the same results in every measurement. Relative phase, in contrast, matters.", ["relative-phase"]),
  t("grovers-algorithm", "Grover's algorithm", "Searches N unstructured items in about √N steps.", "It repeats an oracle, which marks the answer with a minus sign, and a reflection that increases its amplitude. The quadratic speedup is the best possible for this problem.", ["oracle", "amplitude"]),
  t("hadamard-gate", "Hadamard gate", "A gate that turns |0⟩ into an equal superposition.", "H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ − |1⟩)/√2. Applying it twice does nothing.", ["superposition", "quantum-gate"]),
  t("hamiltonian", "Hamiltonian", "The operator that describes the energy of a quantum system.", "Its eigenvalues are the possible energies, and it controls how the state changes in time.", ["vqe", "quantum-simulation"]),
  t("interference", "Interference", "Amplitudes adding up or cancelling out.", "Quantum algorithms arrange interference so that wrong answers cancel and right answers grow.", ["amplitude", "relative-phase"]),
  t("measurement", "Measurement", "Reading a qubit, which gives a classical result.", "The result is random with probabilities set by the Born rule. Measurement generally changes the state, and it cannot be undone.", ["born-rule", "shots"]),
  t("mixed-state", "Mixed state", "A state that is a statistical mixture of pure states.", "Noise produces mixed states, and so does looking at only one part of an entangled system. They are described by density matrices.", ["density-matrix", "bloch-sphere"]),
  t("nisq", "NISQ", "Noisy intermediate-scale quantum: today's kind of device.", "NISQ devices have tens to thousands of qubits but too much noise for long computations without error correction.", ["noise", "vqe", "quantum-error-correction"]),
  t("no-cloning-theorem", "No-cloning theorem", "An unknown quantum state cannot be copied.", "No unitary operation copies every state. This makes quantum error correction less obvious and quantum key distribution possible.", ["quantum-error-correction"]),
  t("noise", "Noise", "Unwanted disturbance of qubits and gates.", "Sources include control errors, stray fields and measurement mistakes. Noise limits how long a useful circuit can be.", ["decoherence", "fidelity"]),
  t("oracle", "Oracle", "A circuit that gives an algorithm access to a function.", "The usual form maps |x⟩|y⟩ to |x⟩|y ⊕ f(x)⟩, which keeps it reversible. Algorithms are often compared by how many oracle calls they need.", ["phase-kickback", "grovers-algorithm"]),
  t("pauli-gates", "Pauli gates", "The single-qubit gates X, Y and Z.", "X flips |0⟩ and |1⟩, Z changes the sign of |1⟩, and Y does both up to a phase. Each undoes itself.", ["quantum-gate", "bloch-sphere"]),
  t("phase-kickback", "Phase kickback", "A controlled operation putting a phase on its control qubit.", "When the target is an eigenstate, the eigenvalue appears as a phase on the control. Many algorithms rely on it.", ["oracle", "quantum-phase-estimation"]),
  t("post-quantum-cryptography", "Post-quantum cryptography", "Classical cryptography designed to resist quantum attacks.", "It runs on ordinary computers and replaces methods such as RSA that a large quantum computer could break.", ["shors-algorithm"]),
  t("qaoa", "QAOA", "A variational algorithm for optimization problems.", "It alternates cost and mixer layers with adjustable angles. Whether it beats the best classical methods in general is still open.", ["ansatz", "vqe"]),
  t("qiskit", "Qiskit", "An open-source Python toolkit for quantum computing started by IBM.", "It is used to build circuits, simulate them and run them on hardware. PennyLane and Cirq are other popular toolkits.", ["quantum-circuit"]),
  t("quantum-advantage", "Quantum advantage", "A quantum computer doing something better than classical ones can.", "Claims depend on the task and on the best known classical method, which can improve.", ["nisq", "shors-algorithm"]),
  t("quantum-circuit", "Quantum circuit", "A sequence of gates and measurements on qubits.", "Circuits are drawn with one line per qubit and time running from left to right.", ["quantum-gate", "circuit-depth"]),
  t("quantum-error-correction", "Quantum error correction", "Protecting information by spreading it over many qubits.", "Errors are found by measuring combinations of qubits without reading the stored data. One reliable logical qubit can need many physical qubits.", ["noise", "no-cloning-theorem"]),
  t("quantum-fourier-transform", "Quantum Fourier transform", "The Fourier transform of a quantum state's amplitudes.", "It needs about n² gates on n qubits, but its output cannot be read out in full. It helps to find hidden periods.", ["shors-algorithm", "quantum-phase-estimation"]),
  t("quantum-gate", "Quantum gate", "A reversible operation on one or more qubits.", "Gates are unitary matrices, so they keep total probability equal to 1 and always have an inverse.", ["unitary", "pauli-gates", "cnot"]),
  t("quantum-key-distribution", "Quantum key distribution", "Sharing a secret key using quantum states.", "Measuring the states disturbs them, so eavesdropping can be detected. It also needs an authenticated classical channel.", ["no-cloning-theorem", "measurement"]),
  t("quantum-phase-estimation", "Quantum phase estimation", "Finds the phase of an eigenvalue of a unitary operation.", "Each extra counting qubit adds about one binary digit. It is the core of Shor's algorithm.", ["phase-kickback", "quantum-fourier-transform"]),
  t("quantum-simulation", "Quantum simulation", "Using a quantum computer to study quantum systems.", "Molecules and materials are promising targets, because they are hard to simulate classically.", ["hamiltonian", "vqe"]),
  t("quantum-teleportation", "Quantum teleportation", "Moving a quantum state using entanglement and two classical bits.", "The original is destroyed, so nothing is copied, and the classical bits keep it no faster than light.", ["entanglement", "bell-state"]),
  t("qubit", "Qubit", "The basic unit of quantum information.", "A qubit's state is α|0⟩ + β|1⟩ with |α|² + |β|² = 1. It can be made from superconducting circuits, trapped ions, photons and more.", ["superposition", "bloch-sphere"]),
  t("relative-phase", "Relative phase", "The phase between parts of a superposition.", "|+⟩ and |−⟩ differ only by relative phase, yet a Hadamard gate turns them into different results.", ["global-phase", "interference"]),
  t("shors-algorithm", "Shor's algorithm", "Factors whole numbers efficiently on a quantum computer.", "It finds the order of a number using phase estimation. A large error-corrected machine could break RSA; today's are far too small for key sizes in use.", ["quantum-fourier-transform", "post-quantum-cryptography"]),
  t("shots", "Shots", "Repeated runs of the same circuit.", "One shot gives one outcome per qubit. The statistical error shrinks with the square root of the number of shots.", ["measurement"]),
  t("superdense-coding", "Superdense coding", "Sending two classical bits with one qubit and shared entanglement.", "The sender applies one of four operations to their half of a Bell pair and sends that qubit.", ["bell-state", "entanglement"]),
  t("superposition", "Superposition", "A combination of basis states.", "A qubit in superposition is not simply 0 and 1 at once: it has an amplitude for each, and a measurement gives one result.", ["amplitude", "qubit"]),
  t("toffoli-gate", "Toffoli gate", "A three-qubit gate that flips the target when both controls are |1⟩.", "Also called CCX. It can compute any classical logic reversibly.", ["cnot"]),
  t("unitary", "Unitary operation", "An operation U with U†U equal to the identity.", "Unitary operations keep the length of state vectors and can be reversed. Every quantum gate is unitary.", ["quantum-gate"]),
  t("vqe", "VQE", "A variational algorithm that looks for the lowest energy of a system.", "The variational quantum eigensolver measures energies on a quantum device while a classical optimizer adjusts the circuit. The result is never below the true ground energy, apart from noise and sampling error.", ["ansatz", "hamiltonian", "quantum-simulation"]),
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((term) => term.slug === slug);
}
