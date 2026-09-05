import json
import sys
import traceback
from collections import Counter
from typing import NoReturn

import numpy as np


SUPPORTED_BACKENDS = [
    "local",
    "qiskit-aer",
    "pennylane",
    "cirq",
]


# ============================================================
# ERROR HANDLING
# ============================================================

def fail(message, code=400) -> NoReturn:
    print(
        json.dumps(
            {
                "success": False,
                "error": message,
                "code": code,
            }
        )
    )
    sys.exit(0)


# ============================================================
# COMPLEX / RESULT HELPERS
# ============================================================

def clean_complex(value):
    return {
        "re": float(np.real(value)),
        "im": float(np.imag(value)),
    }


def normalize_probabilities(probabilities):
    return [
        float(max(0.0, probability))
        for probability in probabilities
    ]


def state_to_result(state, qubits):
    state = np.asarray(
        state,
        dtype=complex,
    )

    probabilities = np.abs(state) ** 2

    total = float(
        np.sum(probabilities)
    )

    if total > 0:
        probabilities = (
            probabilities / total
        )

    statevector = [
        clean_complex(value)
        for value in state
    ]

    probability_map = {}

    for index, probability in enumerate(
        probabilities
    ):
        probability_map[
            format(
                index,
                f"0{qubits}b",
            )
        ] = float(probability)

    return {
        "statevector": statevector,
        "probabilities": normalize_probabilities(
            probabilities
        ),
        "probabilityMap": probability_map,
    }


def sample_measurements(
    probabilities,
    shots,
):
    probabilities = np.asarray(
        probabilities,
        dtype=float,
    )

    total = probabilities.sum()

    if total <= 0:
        raise ValueError(
            "Cannot sample from zero probabilities."
        )

    probabilities = (
        probabilities / total
    )

    samples = np.random.choice(
        len(probabilities),
        size=shots,
        p=probabilities,
    )

    qubits = int(
        np.log2(
            len(probabilities)
        )
    )

    counts = Counter(
        format(
            index,
            f"0{qubits}b",
        )
        for index in samples
    )

    return dict(
        sorted(
            counts.items(),
            key=lambda item: item[0],
        )
    )


# ============================================================
# QUBIT ORDER NORMALIZATION
# ============================================================
#
# QuantumLearn uses:
#
#   q0 = left-most / most-significant bit
#
# Example for 2 qubits:
#
#   |q0 q1>
#   00
#   01
#   10
#   11
#
# Qiskit and Cirq internally use q0 as the
# least-significant qubit in their statevector
# representation.
#
# These helpers convert framework output into
# QuantumLearn's common representation.
# ============================================================

def reverse_bitstring(bitstring):
    return bitstring[::-1]


def reverse_statevector_qubit_order(
    state,
    qubits,
):
    state = np.asarray(
        state,
        dtype=complex,
    )

    if qubits <= 1:
        return state

    reordered = np.zeros_like(
        state,
        dtype=complex,
    )

    for old_index, value in enumerate(state):
        old_bits = format(
            old_index,
            f"0{qubits}b",
        )

        new_bits = old_bits[::-1]

        new_index = int(
            new_bits,
            2,
        )

        reordered[new_index] = value

    return reordered


def normalize_counts_bit_order(counts):
    normalized = {}

    for bitstring, count in counts.items():
        normalized[
            reverse_bitstring(
                str(bitstring)
            )
        ] = int(count)

    return dict(
        sorted(
            normalized.items()
        )
    )


# ============================================================
# QISKIT
# ============================================================

def apply_operations_qiskit(
    circuit,
    qubits,
):
    from qiskit import QuantumCircuit

    qc = QuantumCircuit(qubits)

    sorted_circuit = sorted(
        circuit,
        key=lambda item: (
            item.get("column", 0),
            item.get("qubit", 0),
        ),
    )

    for operation in sorted_circuit:
        gate = operation["gate"]

        target = int(
            operation["qubit"]
        )

        control = operation.get(
            "controlQubit"
        )

        if gate == "I":
            qc.id(target)

        elif gate == "X":
            qc.x(target)

        elif gate == "Y":
            qc.y(target)

        elif gate == "Z":
            qc.z(target)

        elif gate == "H":
            qc.h(target)

        elif gate == "S":
            qc.s(target)

        elif gate == "T":
            qc.t(target)

        elif gate == "CNOT":
            if control is None:
                raise ValueError(
                    "CNOT requires controlQubit."
                )

            qc.cx(
                int(control),
                target,
            )

        elif gate == "CZ":
            if control is None:
                raise ValueError(
                    "CZ requires controlQubit."
                )

            qc.cz(
                int(control),
                target,
            )

        elif gate == "SWAP":
            if control is None:
                raise ValueError(
                    "SWAP requires controlQubit."
                )

            qc.swap(
                int(control),
                target,
            )

        elif gate == "M":
            # Measurement is intentionally
            # handled separately.
            continue

        else:
            raise ValueError(
                f"Unsupported gate: {gate}"
            )

    return qc


def run_qiskit(
    circuit,
    qubits,
    shots,
):
    from qiskit.quantum_info import Statevector
    from qiskit_aer import AerSimulator

    qc = apply_operations_qiskit(
        circuit,
        qubits,
    )

    # --------------------------------------------------------
    # Statevector
    # --------------------------------------------------------

    statevector_obj = (
        Statevector.from_instruction(
            qc
        )
    )

    state = np.asarray(
        statevector_obj.data,
        dtype=complex,
    )

    # Convert Qiskit's q0-LSB ordering
    # into QuantumLearn's q0-MSB ordering.
    state = reverse_statevector_qubit_order(
        state,
        qubits,
    )

    base_result = state_to_result(
        state,
        qubits,
    )

    # --------------------------------------------------------
    # Measurement / Shots
    # --------------------------------------------------------

    measurement_qc = qc.copy()

    measurement_qc.measure_all()

    simulator = AerSimulator()

    measurement_job = simulator.run(
        measurement_qc,
        shots=shots,
    )

    measurement_result = (
        measurement_job.result()
    )

    raw_counts = (
        measurement_result.get_counts()
    )

    counts = normalize_counts_bit_order(
        raw_counts
    )

    return {
        **base_result,
        "counts": counts,
        "backend": "qiskit-aer",
    }


# ============================================================
# PENNYLANE
# ============================================================

def apply_operations_pennylane(
    circuit,
):
    import pennylane as qml

    sorted_circuit = sorted(
        circuit,
        key=lambda item: (
            item.get("column", 0),
            item.get("qubit", 0),
        ),
    )

    for operation in sorted_circuit:
        gate = operation["gate"]

        target = int(
            operation["qubit"]
        )

        control = operation.get(
            "controlQubit"
        )

        if gate == "I":
            qml.Identity(
                wires=target
            )

        elif gate == "X":
            qml.PauliX(
                wires=target
            )

        elif gate == "Y":
            qml.PauliY(
                wires=target
            )

        elif gate == "Z":
            qml.PauliZ(
                wires=target
            )

        elif gate == "H":
            qml.Hadamard(
                wires=target
            )

        elif gate == "S":
            qml.S(
                wires=target
            )

        elif gate == "T":
            qml.T(
                wires=target
            )

        elif gate == "CNOT":
            if control is None:
                raise ValueError(
                    "CNOT requires controlQubit."
                )

            qml.CNOT(
                wires=[
                    int(control),
                    target,
                ]
            )

        elif gate == "CZ":
            if control is None:
                raise ValueError(
                    "CZ requires controlQubit."
                )

            qml.CZ(
                wires=[
                    int(control),
                    target,
                ]
            )

        elif gate == "SWAP":
            if control is None:
                raise ValueError(
                    "SWAP requires controlQubit."
                )

            qml.SWAP(
                wires=[
                    int(control),
                    target,
                ]
            )

        elif gate == "M":
            # Measurement is handled separately.
            continue

        else:
            raise ValueError(
                f"Unsupported gate: {gate}"
            )


def run_pennylane(
    circuit,
    qubits,
    shots,
):
    import pennylane as qml

    # --------------------------------------------------------
    # Statevector
    # --------------------------------------------------------

    state_device = qml.device(
        "default.qubit",
        wires=qubits,
    )

    @qml.qnode(state_device)
    def state_circuit():
        apply_operations_pennylane(
            circuit
        )

        return qml.state()

    state = np.asarray(
        state_circuit(),
        dtype=complex,
    )

    base_result = state_to_result(
        state,
        qubits,
    )

    # --------------------------------------------------------
    # Measurement / Shots
    # --------------------------------------------------------

    measurement_device = qml.device(
        "default.qubit",
        wires=qubits,
        shots=shots,
    )

    @qml.qnode(measurement_device)
    def measurement_circuit():
        apply_operations_pennylane(
            circuit
        )

        return qml.sample(
            qml.PauliZ(
                wires=0
            )
        )

    # Use computational-basis samples
    # through a separate QNode.
    @qml.qnode(measurement_device)
    def basis_measurement_circuit():
        apply_operations_pennylane(
            circuit
        )

        return qml.sample()

    samples = np.asarray(
        basis_measurement_circuit()
    )

    counts = Counter()

    if samples.ndim == 1:
        for value in samples:
            counts[
                format(
                    int(value),
                    f"0{qubits}b",
                )
            ] += 1

    else:
        for sample in samples:
            bitstring = "".join(
                str(int(bit))
                for bit in sample
            )

            counts[bitstring] += 1

    return {
        **base_result,
        "counts": dict(
            sorted(
                counts.items()
            )
        ),
        "backend": "pennylane",
    }


# ============================================================
# CIRQ
# ============================================================

def apply_operations_cirq(
    circuit,
    qubits,
):
    import cirq

    q = [
        cirq.LineQubit(index)
        for index in range(qubits)
    ]

    operations = []

    sorted_circuit = sorted(
        circuit,
        key=lambda item: (
            item.get("column", 0),
            item.get("qubit", 0),
        ),
    )

    for operation in sorted_circuit:
        gate = operation["gate"]

        target = int(
            operation["qubit"]
        )

        control = operation.get(
            "controlQubit"
        )

        if gate == "I":
            operations.append(
                cirq.I(
                    q[target]
                )
            )

        elif gate == "X":
            operations.append(
                cirq.X(
                    q[target]
                )
            )

        elif gate == "Y":
            operations.append(
                cirq.Y(
                    q[target]
                )
            )

        elif gate == "Z":
            operations.append(
                cirq.Z(
                    q[target]
                )
            )

        elif gate == "H":
            operations.append(
                cirq.H(
                    q[target]
                )
            )

        elif gate == "S":
            operations.append(
                cirq.S(
                    q[target]
                )
            )

        elif gate == "T":
            operations.append(
                cirq.T(
                    q[target]
                )
            )

        elif gate == "CNOT":
            if control is None:
                raise ValueError(
                    "CNOT requires controlQubit."
                )

            operations.append(
                cirq.CNOT(
                    q[int(control)],
                    q[target],
                )
            )

        elif gate == "CZ":
            if control is None:
                raise ValueError(
                    "CZ requires controlQubit."
                )

            operations.append(
                cirq.CZ(
                    q[int(control)],
                    q[target],
                )
            )

        elif gate == "SWAP":
            if control is None:
                raise ValueError(
                    "SWAP requires controlQubit."
                )

            operations.append(
                cirq.SWAP(
                    q[int(control)],
                    q[target],
                )
            )

        elif gate == "M":
            # Measurement is handled separately.
            continue

        else:
            raise ValueError(
                f"Unsupported gate: {gate}"
            )

    return q, operations


def run_cirq(
    circuit,
    qubits,
    shots,
):
    import cirq

    q, operations = (
        apply_operations_cirq(
            circuit,
            qubits,
        )
    )

    simulator = cirq.Simulator()

    # --------------------------------------------------------
    # Statevector
    # --------------------------------------------------------

    state_result = simulator.simulate(
        cirq.Circuit(
            operations
        ),
        qubit_order=q,
    )

    state = np.asarray(
        state_result.final_state_vector,
        dtype=complex,
    )

    # Convert Cirq's qubit ordering
    # into QuantumLearn's q0-MSB ordering.
    state = reverse_statevector_qubit_order(
        state,
        qubits,
    )

    base_result = state_to_result(
        state,
        qubits,
    )

    # --------------------------------------------------------
    # Measurement / Shots
    # --------------------------------------------------------

    measurement_circuit = cirq.Circuit(
        operations
    )

    measurement_circuit.append(
        cirq.measure(
            *q,
            key="result",
        )
    )

    result = simulator.run(
        measurement_circuit,
        repetitions=shots,
    )

    raw = result.measurements[
        "result"
    ]

    counts = Counter()

    for sample in raw:
        bitstring = "".join(
            str(int(bit))
            for bit in sample
        )

        # Cirq returns q0 as the first
        # measured bit, while QuantumLearn
        # uses q0 as the left-most bit.
        #
        # Measurement ordering therefore
        # already matches our UI convention.
        counts[bitstring] += 1

    return {
        **base_result,
        "counts": dict(
            sorted(
                counts.items()
            )
        ),
        "backend": "cirq",
    }


# ============================================================
# LOCAL BACKEND
# ============================================================

def run_local(
    circuit,
    qubits,
    shots,
):
    raise ValueError(
        "The local backend must be executed by the existing QuantumLearn TypeScript simulator."
    )


# ============================================================
# MAIN EXECUTION DISPATCHER
# ============================================================

def execute(payload):
    if not isinstance(
        payload,
        dict,
    ):
        fail(
            "Invalid execution payload."
        )

    backend = payload.get(
        "backend",
        "qiskit-aer",
    )

    qubits = int(
        payload.get(
            "qubits",
            1,
        )
    )

    shots = int(
        payload.get(
            "shots",
            1024,
        )
    )

    circuit = payload.get(
        "circuit",
        [],
    )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    if qubits < 1 or qubits > 20:
        fail(
            "Qubit count must be between 1 and 20."
        )

    if shots < 1 or shots > 100000:
        fail(
            "Shots must be between 1 and 100000."
        )

    if not isinstance(
        circuit,
        list,
    ):
        fail(
            "Circuit must be an array."
        )

    # --------------------------------------------------------
    # Backend dispatch
    # --------------------------------------------------------

    if backend == "local":
        fail(
            "Local backend is handled by QuantumLearn's existing TypeScript simulator."
        )

    if backend == "qiskit-aer":
        return run_qiskit(
            circuit,
            qubits,
            shots,
        )

    if backend == "pennylane":
        return run_pennylane(
            circuit,
            qubits,
            shots,
        )

    if backend == "cirq":
        return run_cirq(
            circuit,
            qubits,
            shots,
        )

    if backend == "qbraid":
        fail(
            "qBraid backend will be added in the qBraid integration phase."
        )

    fail(
        f"Unsupported backend: {backend}"
    )


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

def main():
    try:
        raw = sys.stdin.read()

        if not raw.strip():
            fail(
                "No execution payload supplied."
            )

        payload = json.loads(
            raw
        )

        result = execute(
            payload
        )

        print(
            json.dumps(
                {
                    "success": True,
                    **result,
                }
            )
        )

    except Exception as error:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": str(error),
                    "trace": traceback.format_exc(),
                }
            )
        )


if __name__ == "__main__":
    main()