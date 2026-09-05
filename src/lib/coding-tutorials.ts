export type TutorialFramework = "Qiskit" | "Cirq" | "PennyLane";
export type TutorialLevel = "Beginner" | "Intermediate" | "Advanced";

export interface TutorialStep {
  title: string;
  explanation: string;
  code: string;
  expectedOutput: string;
  checkpoint: string;
}

export interface CodingTutorial {
  id: string;
  title: string;
  description: string;
  framework: TutorialFramework;
  level: TutorialLevel;
  duration: string;
  steps: TutorialStep[];
}

export const codingTutorials: CodingTutorial[] = [
  {
    id: "qiskit-first-qubit",
    title: "Your First Qubit",
    description: "Create and inspect your first quantum circuit.",
    framework: "Qiskit",
    level: "Beginner",
    duration: "10 min",
    steps: [
      {
        title: "Import QuantumCircuit",
        explanation: "QuantumCircuit is the main Qiskit class used to construct quantum circuits.",
        code: `from qiskit import QuantumCircuit

print("QuantumCircuit imported successfully.")`,
        expectedOutput: "QuantumCircuit imported successfully.",
        checkpoint: "QuantumCircuit imported.",
      },
      {
        title: "Create a Qubit",
        explanation: "Create a quantum circuit containing one qubit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

print(qc)`,
        expectedOutput: "Circuit created with 1 qubit.",
        checkpoint: "Your circuit contains one qubit.",
      },
      {
        title: "Apply a Gate",
        explanation: "The Pauli-X gate changes the qubit from |0⟩ to |1⟩.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.x(0)

print(qc)`,
        expectedOutput: "Pauli-X gate applied to qubit 0.",
        checkpoint: "You applied your first quantum gate.",
      },
    ],
  },
  {
    id: "qiskit-superposition",
    title: "Create Superposition",
    description: "Use the Hadamard gate to create quantum superposition.",
    framework: "Qiskit",
    level: "Beginner",
    duration: "15 min",
    steps: [
      {
        title: "Create the Circuit",
        explanation: "Start with one qubit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

print(qc)`,
        expectedOutput: "Circuit created with 1 qubit.",
        checkpoint: "One qubit is ready.",
      },
      {
        title: "Apply Hadamard",
        explanation: "Hadamard transforms |0⟩ into (|0⟩ + |1⟩)/√2.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0)

print(qc)`,
        expectedOutput: "Hadamard gate applied to qubit 0.",
        checkpoint: "Qubit 0 is in superposition.",
      },
      {
        title: "Inspect the Circuit",
        explanation: "Print the circuit to inspect the H gate.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0)

print(qc)`,
        expectedOutput: "H gate visible in the circuit.",
        checkpoint: "Superposition circuit completed.",
      },
    ],
  },
  {
    id: "qiskit-bell-state",
    title: "Build a Bell State",
    description: "Create entanglement using H and CX gates.",
    framework: "Qiskit",
    level: "Intermediate",
    duration: "20 min",
    steps: [
      {
        title: "Create Two Qubits",
        explanation: "A Bell state requires two qubits.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

print(qc)`,
        expectedOutput: "Circuit created with 2 qubits.",
        checkpoint: "Two qubits are available.",
      },
      {
        title: "Create Superposition",
        explanation: "Apply Hadamard to the first qubit.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)

print(qc)`,
        expectedOutput: "Hadamard applied to q0.",
        checkpoint: "Qubit 0 is in superposition.",
      },
      {
        title: "Entangle the Qubits",
        explanation: "Use CX to correlate q0 and q1.",
        code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

print(qc)`,
        expectedOutput: "Bell state circuit created.",
        checkpoint: "Two qubits are entangled.",
      },
    ],
  },

  {
    id: "cirq-first-circuit",
    title: "Your First Cirq Circuit",
    description: "Create a quantum circuit using Google's Cirq framework.",
    framework: "Cirq",
    level: "Beginner",
    duration: "10 min",
    steps: [
      {
        title: "Import Cirq",
        explanation: "Cirq is a Python framework for building and simulating quantum circuits.",
        code: `import cirq

print("Cirq imported successfully.")`,
        expectedOutput: "Cirq imported successfully.",
        checkpoint: "Cirq is ready.",
      },
      {
        title: "Create a Qubit",
        explanation: "LineQubit represents a qubit on a one-dimensional line.",
        code: `import cirq

q = cirq.LineQubit(0)

print(q)`,
        expectedOutput: "q(0)",
        checkpoint: "You created your first Cirq qubit.",
      },
      {
        title: "Create a Circuit",
        explanation: "A Cirq Circuit stores quantum operations.",
        code: `import cirq

q = cirq.LineQubit(0)

circuit = cirq.Circuit(
    cirq.X(q)
)

print(circuit)`,
        expectedOutput: "0: ───X───",
        checkpoint: "Your first Cirq circuit is complete.",
      },
    ],
  },
  {
    id: "cirq-superposition",
    title: "Superposition with Cirq",
    description: "Apply a Hadamard gate using Cirq.",
    framework: "Cirq",
    level: "Beginner",
    duration: "15 min",
    steps: [
      {
        title: "Create a Qubit",
        explanation: "Create a line qubit at position zero.",
        code: `import cirq

q = cirq.LineQubit(0)

print(q)`,
        expectedOutput: "q(0)",
        checkpoint: "Qubit created.",
      },
      {
        title: "Apply Hadamard",
        explanation: "Cirq provides cirq.H for the Hadamard gate.",
        code: `import cirq

q = cirq.LineQubit(0)

circuit = cirq.Circuit(
    cirq.H(q)
)

print(circuit)`,
        expectedOutput: "0: ───H───",
        checkpoint: "Hadamard applied.",
      },
      {
        title: "Simulate",
        explanation: "Cirq's Simulator can simulate the circuit state.",
        code: `import cirq

q = cirq.LineQubit(0)

circuit = cirq.Circuit(
    cirq.H(q)
)

simulator = cirq.Simulator()
result = simulator.simulate(circuit)

print(result.final_state_vector)`,
        expectedOutput: "State vector approximately [0.707, 0.707].",
        checkpoint: "You simulated a superposition.",
      },
    ],
  },
  {
    id: "cirq-entanglement",
    title: "Create Entanglement",
    description: "Build a Bell state using Cirq.",
    framework: "Cirq",
    level: "Intermediate",
    duration: "20 min",
    steps: [
      {
        title: "Create Two Qubits",
        explanation: "Use two LineQubits for the entanglement circuit.",
        code: `import cirq

q0 = cirq.LineQubit(0)
q1 = cirq.LineQubit(1)

print(q0, q1)`,
        expectedOutput: "q(0) q(1)",
        checkpoint: "Two qubits created.",
      },
      {
        title: "Apply Hadamard",
        explanation: "Put q0 into superposition.",
        code: `import cirq

q0 = cirq.LineQubit(0)
q1 = cirq.LineQubit(1)

circuit = cirq.Circuit(
    cirq.H(q0)
)

print(circuit)`,
        expectedOutput: "Hadamard applied to q0.",
        checkpoint: "q0 is in superposition.",
      },
      {
        title: "Apply CNOT",
        explanation: "CNOT correlates the two qubits.",
        code: `import cirq

q0 = cirq.LineQubit(0)
q1 = cirq.LineQubit(1)

circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1)
)

print(circuit)`,
        expectedOutput: "Bell-state circuit created.",
        checkpoint: "Two qubits are entangled.",
      },
    ],
  },

  {
    id: "pennylane-first-qubit",
    title: "Your First PennyLane Circuit",
    description: "Create your first quantum node using PennyLane.",
    framework: "PennyLane",
    level: "Beginner",
    duration: "10 min",
    steps: [
      {
        title: "Import PennyLane",
        explanation: "PennyLane provides a Python interface for quantum machine learning and quantum circuits.",
        code: `import pennylane as qml

print("PennyLane imported successfully.")`,
        expectedOutput: "PennyLane imported successfully.",
        checkpoint: "PennyLane imported.",
      },
      {
        title: "Create a Device",
        explanation: "A PennyLane device defines where the circuit is executed.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

print(dev)`,
        expectedOutput: "Default qubit device created.",
        checkpoint: "Quantum device created.",
      },
      {
        title: "Create a QNode",
        explanation: "A QNode connects a Python quantum function to a device.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    return qml.expval(qml.PauliZ(0))

print(circuit())`,
        expectedOutput: "1.0",
        checkpoint: "Your first PennyLane QNode works.",
      },
    ],
  },
  {
    id: "pennylane-superposition",
    title: "Superposition with PennyLane",
    description: "Use the Hadamard operation in PennyLane.",
    framework: "PennyLane",
    level: "Beginner",
    duration: "15 min",
    steps: [
      {
        title: "Create the Device",
        explanation: "Use the default.qubit simulator with one wire.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

print("Device ready.")`,
        expectedOutput: "Device ready.",
        checkpoint: "Device initialized.",
      },
      {
        title: "Apply Hadamard",
        explanation: "The Hadamard operation creates equal probability amplitudes.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    return qml.probs(wires=0)

print(circuit())`,
        expectedOutput: "[0.5 0.5]",
        checkpoint: "Superposition created.",
      },
      {
        title: "Inspect Probabilities",
        explanation: "The resulting probabilities show equal probability of measuring 0 or 1.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    return qml.probs(wires=0)

probabilities = circuit()

print(probabilities)`,
        expectedOutput: "[0.5 0.5]",
        checkpoint: "The qubit has equal measurement probabilities.",
      },
    ],
  },
  {
    id: "pennylane-bell-state",
    title: "Build a Bell State",
    description: "Create entanglement using PennyLane.",
    framework: "PennyLane",
    level: "Intermediate",
    duration: "20 min",
    steps: [
      {
        title: "Create Two-Wire Device",
        explanation: "Use two wires for the Bell-state circuit.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=2)

print("Two-wire device ready.")`,
        expectedOutput: "Two-wire device ready.",
        checkpoint: "Two wires are available.",
      },
      {
        title: "Create Superposition",
        explanation: "Apply Hadamard to the first wire.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    return qml.state()

print(circuit())`,
        expectedOutput: "Two-qubit state after Hadamard.",
        checkpoint: "First qubit is in superposition.",
      },
      {
        title: "Entangle",
        explanation: "Apply CNOT between the two wires.",
        code: `import pennylane as qml

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=[0, 1])

print(circuit())`,
        expectedOutput: "[0.5 0.0 0.0 0.5]",
        checkpoint: "Bell state created successfully.",
      },
    ],
  },
];

export const tutorialFrameworks: TutorialFramework[] = [
  "Qiskit",
  "Cirq",
  "PennyLane",
];