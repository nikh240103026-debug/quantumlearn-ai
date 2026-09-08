import type {
  CurriculumModule,
  CurriculumTopic,
} from "@/types/curriculum";

export const curriculumModules: CurriculumModule[] = [
  {
    id: "module-1",
    moduleNumber: 1,
    slug: "foundations",
    title: "Mathematical & Conceptual Foundations",
    description:
      "Build the mathematical, physical and conceptual foundation required to understand quantum computing.",
    weight: 20,
    chapterNumbers: [1, 2, 3],
    topics: [
      {
        id: "complex-numbers",
        slug: "complex-numbers",
        title: "Complex Numbers",
        description:
          "Complex numbers, amplitudes, modulus, phase and their role in quantum states.",
        moduleId: "module-1",
        chapterNumbers: [1],
        keywords: [
          "complex",
          "imaginary",
          "amplitude",
          "phase",
        ],
      },
      {
        id: "linear-algebra",
        slug: "linear-algebra",
        title: "Linear Algebra",
        description:
          "Vectors, matrices, inner products, eigenvalues, eigenvectors and operators.",
        moduleId: "module-1",
        chapterNumbers: [1],
        keywords: [
          "linear algebra",
          "vector",
          "matrix",
          "eigenvalue",
          "eigenvector",
          "inner product",
        ],
      },
      {
        id: "probability",
        slug: "probability",
        title: "Probability & Measurement",
        description:
          "Probability distributions, amplitudes and probabilistic measurement outcomes.",
        moduleId: "module-1",
        chapterNumbers: [1, 3],
        keywords: [
          "probability",
          "probability distribution",
          "measurement",
        ],
      },
      {
        id: "quantum-mechanics",
        slug: "quantum-mechanics",
        title: "Quantum Mechanics Foundations",
        description:
          "Quantum states, observables, operators, Schrödinger dynamics, spin and quantum postulates.",
        moduleId: "module-1",
        chapterNumbers: [2],
        keywords: [
          "quantum mechanics",
          "schrodinger",
          "schrödinger",
          "spin",
          "observable",
          "postulate",
        ],
      },
      {
        id: "qubits",
        slug: "qubits",
        title: "Qubits & Quantum States",
        description:
          "Understand qubits, computational basis states, superposition and state vectors.",
        moduleId: "module-1",
        chapterNumbers: [3],
        keywords: [
          "qubit",
          "state",
          "superposition",
          "basis",
          "state vector",
        ],
      },
    ],
  },

  {
    id: "module-2",
    moduleNumber: 2,
    slug: "algorithms-complexity",
    title: "Quantum Algorithms & Computational Complexity",
    description:
      "Learn the computational model of quantum computing and the major quantum algorithms.",
    weight: 20,
    chapterNumbers: [5, 6],
    topics: [
      {
        id: "quantum-circuits",
        slug: "quantum-circuits",
        title: "Quantum Circuits",
        description:
          "Construct and reason about quantum circuits, gates, depth and controlled operations.",
        moduleId: "module-2",
        chapterNumbers: [5],
        keywords: [
          "circuit",
          "quantum circuit",
          "gate",
          "controlled",
          "depth",
          "universal",
        ],
      },
      {
        id: "deutsch-jozsa",
        slug: "deutsch-jozsa",
        title: "Deutsch-Jozsa Algorithm",
        description:
          "Understand the Deutsch-Jozsa algorithm and its quantum query advantage.",
        moduleId: "module-2",
        chapterNumbers: [6],
        keywords: [
          "deutsch",
          "deutsch-jozsa",
          "balanced",
          "constant",
        ],
      },
      {
        id: "grover",
        slug: "grover",
        title: "Grover's Algorithm",
        description:
          "Learn amplitude amplification and quantum search.",
        moduleId: "module-2",
        chapterNumbers: [6],
        keywords: [
          "grover",
          "search",
          "amplitude amplification",
        ],
      },
      {
        id: "qft",
        slug: "qft",
        title: "Quantum Fourier Transform",
        description:
          "Understand the Quantum Fourier Transform and its role in quantum algorithms.",
        moduleId: "module-2",
        chapterNumbers: [6],
        keywords: [
          "qft",
          "fourier",
          "quantum fourier",
        ],
      },
      {
        id: "phase-estimation",
        slug: "phase-estimation",
        title: "Quantum Phase Estimation",
        description:
          "Learn phase estimation and its importance in quantum algorithm design.",
        moduleId: "module-2",
        chapterNumbers: [6],
        keywords: [
          "phase estimation",
          "eigenphase",
        ],
      },
      {
        id: "shor",
        slug: "shor",
        title: "Shor's Algorithm",
        description:
          "Understand quantum period finding and its application to integer factorization.",
        moduleId: "module-2",
        chapterNumbers: [6],
        keywords: [
          "shor",
          "factorization",
          "period finding",
        ],
      },
    ],
  },

  {
    id: "module-3",
    moduleNumber: 3,
    slug: "architecture-hardware-compilers",
    title: "Quantum Computer Architecture, Compilers & Hardware",
    description:
      "Understand how physical quantum computers work and how quantum programs reach hardware.",
    weight: 15,
    chapterNumbers: [8, 10],
    topics: [
      {
        id: "quantum-hardware",
        slug: "quantum-hardware",
        title: "Quantum Hardware",
        description:
          "Explore major physical implementations of quantum computers.",
        moduleId: "module-3",
        chapterNumbers: [8],
        keywords: [
          "hardware",
          "superconducting",
          "trapped ion",
          "trapped-ion",
          "photonic",
          "spin",
        ],
      },
      {
        id: "quantum-noise",
        slug: "quantum-noise",
        title: "Noise & Decoherence",
        description:
          "Understand physical noise, decoherence and limitations of quantum hardware.",
        moduleId: "module-3",
        chapterNumbers: [9],
        keywords: [
          "noise",
          "decoherence",
          "relaxation",
          "coherence",
          "error",
        ],
      },
      {
        id: "compilation",
        slug: "compilation",
        title: "Quantum Compilation & Transpilation",
        description:
          "Learn how abstract circuits are transformed into hardware-compatible operations.",
        moduleId: "module-3",
        chapterNumbers: [10],
        keywords: [
          "compiler",
          "compilation",
          "transpilation",
          "routing",
          "optimization",
        ],
      },
      {
        id: "hardware-constraints",
        slug: "hardware-constraints",
        title: "Hardware Constraints",
        description:
          "Understand connectivity, gate fidelity, coherence times and hardware limitations.",
        moduleId: "module-3",
        chapterNumbers: [8, 10],
        keywords: [
          "connectivity",
          "fidelity",
          "t1",
          "t2",
          "hardware constraint",
        ],
      },
    ],
  },

  {
    id: "module-4",
    moduleNumber: 4,
    slug: "nisq-variational-qml",
    title: "NISQ, Variational Algorithms & Quantum Machine Learning",
    description:
      "Learn practical quantum computing techniques designed for noisy intermediate-scale quantum systems.",
    weight: 15,
    chapterNumbers: [6, 10],
    topics: [
      {
        id: "nisq",
        slug: "nisq",
        title: "NISQ Computing",
        description:
          "Understand noisy intermediate-scale quantum computing and its practical limitations.",
        moduleId: "module-4",
        chapterNumbers: [8, 9, 10],
        keywords: [
          "nisq",
          "noisy",
          "intermediate scale",
        ],
      },
      {
        id: "vqe",
        slug: "vqe",
        title: "Variational Quantum Eigensolver",
        description:
          "Learn the hybrid quantum-classical VQE workflow.",
        moduleId: "module-4",
        chapterNumbers: [6, 10],
        keywords: [
          "vqe",
          "variational eigensolver",
          "eigensolver",
        ],
      },
      {
        id: "qaoa",
        slug: "qaoa",
        title: "QAOA",
        description:
          "Understand the Quantum Approximate Optimization Algorithm and hybrid optimization.",
        moduleId: "module-4",
        chapterNumbers: [6, 10],
        keywords: [
          "qaoa",
          "optimization",
          "approximate optimization",
        ],
      },
      {
        id: "quantum-machine-learning",
        slug: "quantum-machine-learning",
        title: "Quantum Machine Learning",
        description:
          "Explore quantum-enhanced machine learning and hybrid quantum-classical models.",
        moduleId: "module-4",
        chapterNumbers: [10],
        keywords: [
          "quantum machine learning",
          "qml",
          "machine learning",
          "variational circuit",
        ],
      },
      {
        id: "hybrid-computing",
        slug: "hybrid-computing",
        title: "Hybrid Quantum-Classical Computing",
        description:
          "Combine classical optimization and quantum computation in practical workflows.",
        moduleId: "module-4",
        chapterNumbers: [6, 10],
        keywords: [
          "hybrid",
          "classical",
          "optimizer",
        ],
      },
    ],
  },

  {
    id: "module-5",
    moduleNumber: 5,
    slug: "information-cryptography-error-correction",
    title: "Quantum Information, Cryptography & Fault-Tolerant Error Correction",
    description:
      "Study quantum information theory, communication, cryptography, error correction and fault tolerance.",
    weight: 15,
    chapterNumbers: [4, 7, 9],
    topics: [
      {
        id: "quantum-information",
        slug: "quantum-information",
        title: "Quantum Information",
        description:
          "Learn how information is represented, processed and transmitted using quantum systems.",
        moduleId: "module-5",
        chapterNumbers: [4, 7],
        keywords: [
          "quantum information",
          "information",
          "entropy",
          "channel",
        ],
      },
      {
        id: "entanglement",
        slug: "entanglement",
        title: "Entanglement",
        description:
          "Understand Bell states, entanglement and non-classical correlations.",
        moduleId: "module-5",
        chapterNumbers: [4, 7],
        keywords: [
          "entanglement",
          "bell state",
          "bell",
          "correlation",
        ],
      },
      {
        id: "teleportation",
        slug: "teleportation",
        title: "Quantum Teleportation",
        description:
          "Understand quantum teleportation and the role of entanglement and classical communication.",
        moduleId: "module-5",
        chapterNumbers: [7],
        keywords: [
          "teleportation",
          "quantum teleportation",
        ],
      },
      {
        id: "quantum-cryptography",
        slug: "quantum-cryptography",
        title: "Quantum Cryptography & QKD",
        description:
          "Learn quantum key distribution and the foundations of quantum cryptography.",
        moduleId: "module-5",
        chapterNumbers: [7],
        keywords: [
          "cryptography",
          "qkd",
          "bb84",
          "key distribution",
        ],
      },
      {
        id: "quantum-error-correction",
        slug: "quantum-error-correction",
        title: "Quantum Error Correction",
        description:
          "Learn how quantum information can be protected from noise and errors.",
        moduleId: "module-5",
        chapterNumbers: [9],
        keywords: [
          "error correction",
          "quantum error correction",
          "stabilizer",
          "shor code",
          "steane",
        ],
      },
      {
        id: "fault-tolerance",
        slug: "fault-tolerance",
        title: "Fault-Tolerant Quantum Computing",
        description:
          "Understand logical qubits, fault tolerance and the requirements for reliable quantum computation.",
        moduleId: "module-5",
        chapterNumbers: [9],
        keywords: [
          "fault tolerance",
          "fault-tolerant",
          "logical qubit",
          "logical gate",
        ],
      },
    ],
  },

  {
    id: "module-6",
    moduleNumber: 6,
    slug: "practical-quantum-laboratory",
    title: "Practical Quantum Laboratory, Simulation & Hardware Execution",
    description:
      "Apply quantum concepts through programming, simulation, visualization and real or cloud quantum hardware.",
    weight: 15,
    chapterNumbers: [5, 6, 10],
    topics: [
      {
        id: "qiskit",
        slug: "qiskit",
        title: "Qiskit",
        description:
          "Build and execute quantum circuits using Qiskit.",
        moduleId: "module-6",
        chapterNumbers: [10],
        keywords: [
          "qiskit",
          "qiskit aer",
        ],
      },
      {
        id: "cirq",
        slug: "cirq",
        title: "Cirq",
        description:
          "Build and simulate quantum circuits using Cirq.",
        moduleId: "module-6",
        chapterNumbers: [10],
        keywords: [
          "cirq",
        ],
      },
      {
        id: "pennylane",
        slug: "pennylane",
        title: "PennyLane",
        description:
          "Use PennyLane for quantum programming, simulation and hybrid workflows.",
        moduleId: "module-6",
        chapterNumbers: [10],
        keywords: [
          "pennylane",
        ],
      },
      {
        id: "quantum-programming",
        slug: "quantum-programming",
        title: "Quantum Programming",
        description:
          "Write quantum programs and translate algorithms into executable circuits.",
        moduleId: "module-6",
        chapterNumbers: [5, 10],
        keywords: [
          "programming",
          "python",
          "sdk",
          "quantum code",
        ],
      },
      {
        id: "simulation",
        slug: "simulation",
        title: "Quantum Simulation",
        description:
          "Execute circuits on simulators and interpret simulation results.",
        moduleId: "module-6",
        chapterNumbers: [5, 6, 10],
        keywords: [
          "simulation",
          "simulator",
          "backend",
          "shots",
        ],
      },
      {
        id: "hardware-execution",
        slug: "hardware-execution",
        title: "Quantum Hardware Execution",
        description:
          "Understand execution on real quantum hardware and interpret noisy results.",
        moduleId: "module-6",
        chapterNumbers: [8, 10],
        keywords: [
          "hardware execution",
          "real hardware",
          "qbraid",
          "backend",
        ],
      },
      {
        id: "capstone",
        slug: "capstone",
        title: "Quantum Computing Capstone",
        description:
          "Combine theory, programming, simulation and analysis into practical quantum projects.",
        moduleId: "module-6",
        chapterNumbers: [6, 10],
        keywords: [
          "capstone",
          "project",
          "algorithm",
          "implementation",
        ],
      },
    ],
  },
];

export const curriculumTopics: CurriculumTopic[] =
  curriculumModules.flatMap(
    (module) => module.topics,
  );

export function getCurriculumModule(
  moduleId: string,
): CurriculumModule | undefined {
  return curriculumModules.find(
    (module) => module.id === moduleId,
  );
}

export function getCurriculumTopic(
  topicId: string,
): CurriculumTopic | undefined {
  return curriculumTopics.find(
    (topic) => topic.id === topicId,
  );
}