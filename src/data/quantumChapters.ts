export interface QuantumChapter {
  number: number;
  slug: string;
  title: string;
  description: string;
}

export const quantumChapters: QuantumChapter[] = [
  {
    number: 1,
    slug: "quantum-foundations-mathematics",
    title: "Quantum Foundations & Mathematics",
    description:
      "Linear algebra, complex numbers, vectors, tensor products, probability, Fourier analysis and mathematical foundations.",
  },

  {
    number: 2,
    slug: "quantum-mechanics-foundations",
    title: "Quantum Mechanics Foundations",
    description:
      "Wave mechanics, Schrödinger equation, quantum postulates, spin, angular momentum and two-level systems.",
  },

  {
    number: 3,
    slug: "qubits-states-gates",
    title: "Qubits, States & Quantum Gates",
    description:
      "Qubits, state vectors, Bloch sphere, Pauli gates, Hadamard, phase gates and multi-qubit operations.",
  },

  {
    number: 4,
    slug: "measurement-entanglement",
    title: "Quantum Measurement & Entanglement",
    description:
      "Quantum measurement, probability amplitudes, Bell states, entanglement, no-cloning and quantum information.",
  },

  {
    number: 5,
    slug: "quantum-circuits-computation",
    title: "Quantum Circuits & Computational Model",
    description:
      "Quantum circuit construction, circuit depth, universality, controlled operations and computational models.",
  },

  {
    number: 6,
    slug: "quantum-algorithms",
    title: "Quantum Algorithms",
    description:
      "Deutsch-Jozsa, Grover, QFT, phase estimation, Shor, quantum simulation and hybrid algorithms.",
  },

  {
    number: 7,
    slug: "quantum-information-communication",
    title: "Quantum Information & Communication",
    description:
      "Quantum information theory, entropy, QKD, teleportation, superdense coding and quantum channels.",
  },

  {
    number: 8,
    slug: "quantum-hardware",
    title: "Quantum Hardware & Physical Systems",
    description:
      "Superconducting, trapped-ion, photonic, spin-based and other quantum computing hardware platforms.",
  },

  {
    number: 9,
    slug: "quantum-noise-error-correction",
    title: "Quantum Noise & Error Correction",
    description:
      "Noise, decoherence, quantum error correction, stabilizer codes, Shor code, Steane code and fault tolerance.",
  },

  {
    number: 10,
    slug: "quantum-programming-advanced-computing",
    title: "Quantum Programming & Advanced Computing",
    description:
      "Qiskit, Cirq, quantum software, compilation, benchmarking, advanced simulation and emerging technologies.",
  },
];