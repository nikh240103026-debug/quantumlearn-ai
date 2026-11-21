import json
import os
import sys
import traceback
from collections import Counter
from pathlib import Path
from typing import NoReturn

from dotenv import load_dotenv

# Load environment variables from both the project root and quantum-api directory.
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

load_dotenv(PROJECT_ROOT / ".env.local", override=False)
load_dotenv(PROJECT_ROOT / ".env", override=False)
load_dotenv(BASE_DIR / ".env.local", override=False)
load_dotenv(BASE_DIR / ".env", override=False)


QBRAID_API_KEY = os.getenv("QBRAID_API_KEY", "").strip()
QUANTUM_API_KEY = os.getenv("QUANTUM_API_KEY", "").strip()

_SERVICE_DIR = Path(__file__).resolve().parent
_PROJECT_DIR = _SERVICE_DIR.parent

# Load the project environment first.
load_dotenv(
    _PROJECT_DIR / ".env",
    override=False,
)

# .env.local contains the main project credentials.
load_dotenv(
    _PROJECT_DIR / ".env.local",
    override=True,
)

# Load service-specific variables without replacing
# the project's main credentials.
load_dotenv(
    _SERVICE_DIR / ".env",
    override=False,
)

from qbraid.runtime import QbraidProvider


def get_qbraid_device():
    if not QBRAID_API_KEY:
        raise RuntimeError(
            "QBRAID_API_KEY is not configured. "
            "Add it to the project's .env.local file."
        )

    provider = QbraidProvider(QBRAID_API_KEY)

    return provider.get_device(
        "qbraid:qbraid:sim:qir-sv"
    )

import numpy as np

SUPPORTED_BACKENDS = [
    "local",
    "qiskit-aer",
    "pennylane",
    "cirq",
    "qbraid",
]

QBRAID_DEVICE_ID = "qbraid:qbraid:sim:qir-sv"


# ============================================================
# ERROR HANDLING
# ============================================================

class EngineInputError(Exception):
    """Invalid execution request. Safe to show to the user."""

    def __init__(self, message, code=400):
        super().__init__(message)
        self.message = message
        self.code = code


def fail(message, code=400) -> NoReturn:
    # Raise instead of sys.exit(): this module is imported by the
    # FastAPI server, where SystemExit bypasses `except Exception`
    # handlers and can take down the worker.
    raise EngineInputError(
        message,
        code,
    )


# ============================================================
# RESULT HELPERS
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


def counts_to_probabilities(
    counts,
    qubits,
    shots,
):
    probabilities = [
        0.0
        for _ in range(2 ** qubits)
    ]

    if not counts:
        return probabilities

    total_shots = sum(
        int(value)
        for value in counts.values()
    )

    if total_shots <= 0:
        total_shots = shots

    for bitstring, count in counts.items():
        cleaned = str(bitstring).replace(
            " ",
            "",
        )

        try:
            index = int(
                cleaned,
                2,
            )
        except ValueError:
            continue

        if 0 <= index < len(
            probabilities
        ):
            probabilities[index] = (
                int(count) / total_shots
            )

    return probabilities


def counts_probability_map(
    counts,
    qubits,
    shots,
):
    probabilities = counts_to_probabilities(
        counts,
        qubits,
        shots,
    )

    return {
        format(
            index,
            f"0{qubits}b",
        ): float(probability)
        for index, probability in enumerate(
            probabilities
        )
    }


def counts_to_statevector(
    counts,
    qubits,
    shots,
):
    probabilities = counts_to_probabilities(
        counts,
        qubits,
        shots,
    )

    return [
        {
            "re": float(
                np.sqrt(
                    max(
                        0.0,
                        probability,
                    )
                )
            ),
            "im": 0.0,
        }
        for probability in probabilities
    ]


def normalize_counts_bit_order(
    counts,
    reverse_bits=False,
):
    """
    Normalize count keys to the app convention:
    qubit 0 is the LEFTMOST bit (matches the TS simulator,
    the probabilityMap, Cirq and PennyLane).

    Qiskit/Aer bitstrings put qubit 0 on the RIGHT,
    so callers pass reverse_bits=True for Qiskit counts.
    """
    normalized = {}

    for bitstring, count in counts.items():
        key = str(bitstring).replace(
            " ",
            "",
        )

        if reverse_bits:
            key = key[::-1]

        if key:
            normalized[key] = (
                normalized.get(key, 0)
                + int(count)
            )

    return dict(
        sorted(
            normalized.items()
        )
    )


# ============================================================
# QISKIT
# ============================================================

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


def apply_operations_qiskit(
    circuit,
    qubits,
):
    from qiskit import QuantumCircuit

    qc = QuantumCircuit(
        qubits
    )

    sorted_circuit = sorted(
        circuit,
        key=lambda item: (
            item.get(
                "column",
                0,
            ),
            item.get(
                "qubit",
                0,
            ),
        ),
    )

    for operation in sorted_circuit:
        gate = operation[
            "gate"
        ]

        target = int(
            operation[
                "qubit"
            ]
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

    statevector_obj = (
        Statevector.from_instruction(
            qc
        )
    )

    state = np.asarray(
        statevector_obj.data,
        dtype=complex,
    )

    state = reverse_statevector_qubit_order(
        state,
        qubits,
    )

    base_result = state_to_result(
        state,
        qubits,
    )

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

    # Aer puts qubit 0 rightmost; flip to the app convention.
    counts = normalize_counts_bit_order(
        raw_counts,
        reverse_bits=True,
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
            item.get(
                "column",
                0,
            ),
            item.get(
                "qubit",
                0,
            ),
        ),
    )

    for operation in sorted_circuit:
        gate = operation[
            "gate"
        ]

        target = int(
            operation[
                "qubit"
            ]
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

    measurement_device = qml.device(
        "default.qubit",
        wires=qubits,
    )

    @qml.qnode(
        measurement_device,
    )
    def measurement_circuit():
        apply_operations_pennylane(
            circuit
        )
        return qml.probs(
            wires=range(qubits)
        )

    probability_result = np.asarray(
        measurement_circuit(),
        dtype=float,
    )

    probabilities = normalize_probabilities(
        probability_result
    )

    def shot_circuit():
        apply_operations_pennylane(
            circuit
        )

        return qml.sample()

    shot_device = qml.device(
        "default.qubit",
        wires=qubits,
        shots=shots,
    )

    shot_qnode = qml.QNode(
        shot_circuit,
        shot_device,
    )

    samples = np.asarray(
        shot_qnode()
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

            counts[
                bitstring
            ] += 1

    return {
        "statevector": base_result[
            "statevector"
        ],
        "probabilities": probabilities,
        "probabilityMap": {
            format(
                index,
                f"0{qubits}b",
            ): float(probability)
            for index, probability
            in enumerate(probabilities)
        },
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
            item.get(
                "column",
                0,
            ),
            item.get(
                "qubit",
                0,
            ),
        ),
    )

    for operation in sorted_circuit:
        gate = operation[
            "gate"
        ]

        target = int(
            operation[
                "qubit"
            ]
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

    state_result = simulator.simulate(
        cirq.Circuit(
            operations
        ),
        qubit_order=q,
    )

    # Cirq's statevector already uses qubit_order=q with q[0] as the
    # most significant bit, which matches the app convention.
    # Do not reverse it (reversing made probabilities disagree with
    # the counts below and with every other backend).
    state = np.asarray(
        state_result.final_state_vector,
        dtype=complex,
    )

    base_result = state_to_result(
        state,
        qubits,
    )

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

        counts[
            bitstring
        ] += 1

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
# QASM 3 GENERATION FOR QBRAID
# ============================================================

def gate_to_qasm(
    operation,
):
    gate = operation[
        "gate"
    ]

    target = int(
        operation[
            "qubit"
        ]
    )

    control = operation.get(
        "controlQubit"
    )

    if gate == "I":
        return f"i q[{target}];"

    if gate == "X":
        return f"x q[{target}];"

    if gate == "Y":
        return f"y q[{target}];"

    if gate == "Z":
        return f"z q[{target}];"

    if gate == "H":
        return f"h q[{target}];"

    if gate == "S":
        return f"s q[{target}];"

    if gate == "T":
        return f"t q[{target}];"

    if gate == "CNOT":
        if control is None:
            raise ValueError(
                "CNOT requires controlQubit."
            )

        return (
            f"cx q[{int(control)}], "
            f"q[{target}];"
        )

    if gate == "CZ":
        if control is None:
            raise ValueError(
                "CZ requires controlQubit."
            )

        return (
            f"cz q[{int(control)}], "
            f"q[{target}];"
        )

    if gate == "SWAP":
        if control is None:
            raise ValueError(
                "SWAP requires controlQubit."
            )

        return (
            f"swap q[{int(control)}], "
            f"q[{target}];"
        )

    if gate == "M":
        return ""

    raise ValueError(
        f"Unsupported gate: {gate}"
    )


def circuit_to_qasm3(
    circuit,
    qubits,
):
    lines = [
        "OPENQASM 3.0;",
        'include "stdgates.inc";',
        "",
        f"bit[{qubits}] c;",
        f"qubit[{qubits}] q;",
        "",
    ]

    for operation in sorted(
        circuit,
        key=lambda item: (
            item.get(
                "column",
                0,
            ),
            item.get(
                "qubit",
                0,
            ),
        ),
    ):
        instruction = gate_to_qasm(
            operation
        )

        if instruction:
            lines.append(
                instruction
            )

    lines.append("")

    for index in range(qubits):
        lines.append(
            f"c[{index}] = measure q[{index}];"
        )

    return "\n".join(
        lines
    )


# ============================================================
# QBRAID
# ============================================================

def run_qbraid(
    circuit,
    qubits,
    shots,
):
    try:
        from qbraid.runtime import (
            QbraidProvider,
        )
    except ImportError as error:
        raise RuntimeError(
            "qBraid SDK is not installed in the active Python environment."
        ) from error

    api_key = os.getenv(
        "QBRAID_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "QBRAID_API_KEY is not configured."
        )

    provider = QbraidProvider(
        api_key=api_key
    )

    device = provider.get_device(
        QBRAID_DEVICE_ID
    )

    if not device.simulator:
        raise RuntimeError(
            "Configured qBraid device is not a simulator."
        )

    max_qubits = device.num_qubits

    if max_qubits is not None and qubits > int(
        max_qubits
    ):
        raise ValueError(
            f"qBraid device supports {max_qubits} qubits; requested {qubits}."
        )

    qasm = circuit_to_qasm3(
        circuit,
        qubits,
    )

    job = device.run(
        qasm,
        shots=shots,
    )

    job_item = job

    if isinstance(job_item, list):
        if not job_item:
            raise RuntimeError(
                "qBraid returned no job."
            )

        job_item = job_item[0]

    get_result = getattr(
        job_item,
        "result",
        None,
    )

    if not callable(get_result):
        raise RuntimeError(
            "qBraid returned a job without a result method."
        )

    raw_result = get_result()

    if isinstance(raw_result, list):
        if not raw_result:
            raise RuntimeError(
                "qBraid returned no result."
            )

        result = raw_result[0]
    else:
        result = raw_result

    data = getattr(
        result,
        "data",
        None,
    )

    if data is None:
        raise RuntimeError(
            "qBraid returned no result data."
        )

    get_counts = getattr(
        data,
        "get_counts",
        None,
    )

    if callable(get_counts):
        raw_counts = get_counts()
    else:
        raw_counts = getattr(
            data,
            "measurement_counts",
            None,
        )

    if raw_counts is None:
        raw_counts = {}

    counts = normalize_counts_bit_order(
        raw_counts
    )

    probabilities = counts_to_probabilities(
        counts,
        qubits,
        shots,
    )

    probability_map = counts_probability_map(
        counts,
        qubits,
        shots,
    )

    # A shot-based qBraid QIR result exposes
    # measurement counts, not an exact statevector.
    #
    # Therefore the statevector is intentionally
    # returned as None rather than pretending that
    # sqrt(probability) is a physical statevector.
    status = getattr(
        result,
        "status",
        None,
    )

    return {
        "statevector": None,
        "probabilities": probabilities,
        "probabilityMap": probability_map,
        "counts": counts,
        "backend": "qbraid",
        "device": QBRAID_DEVICE_ID,
        "jobId": getattr(
            job,
            "id",
            None,
        ),
        "shots": shots,
        "qasm": qasm,
        "qbraidStatus": getattr(
            status,
            "value",
            str(status or "COMPLETED"),
        ),
    }


# ============================================================
# LOCAL
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
# EXECUTION DISPATCH
# ============================================================

# ============================================================
# MEASUREMENT (M gate)
# ============================================================
#
# A mid-circuit measurement collapses the qubit and turns the pure
# state into a mixture. The selected library simulates the unitary
# segments between M gates; this driver tracks every collapse branch
# with its probability weight, so probabilities are exact. The
# returned statevector is one randomly chosen branch (a single run),
# and counts are sampled from the exact distribution.
#
# All states here use the app convention: qubit 0 is the leftmost bit.

MAX_MEASUREMENT_BRANCHES = 1024


def sort_operations(circuit):
    return sorted(
        circuit,
        key=lambda item: (
            item.get("column", 0),
            item.get("qubit", 0),
        ),
    )


def has_measurements(circuit):
    return any(
        operation.get("gate") == "M"
        for operation in circuit
    )


def has_mid_circuit_measurement(circuit):
    """True if some qubit is used again after being measured."""

    measured = set()

    for operation in sort_operations(circuit):
        touched = {operation.get("qubit")}

        if operation.get("controlQubit") is not None:
            touched.add(operation.get("controlQubit"))

        if operation.get("gate") == "M":
            measured.add(operation.get("qubit"))
            continue

        if touched & measured:
            return True

    return False


def project_qubit(state, qubit, qubits, outcome):
    mask = 1 << (qubits - qubit - 1)

    indices = np.arange(len(state))
    keep = ((indices & mask) != 0) == bool(outcome)

    probability = float(
        np.sum(np.abs(state[keep]) ** 2)
    )

    if probability < 1e-12:
        return 0.0, None

    projected = np.where(keep, state, 0)

    return probability, projected / np.sqrt(probability)


def merge_branches(branches):
    merged = {}

    for weight, state in branches:
        key = np.round(state, 9).tobytes()

        if key in merged:
            merged[key][0] += weight
        else:
            merged[key] = [weight, state]

    return [
        (weight, state)
        for weight, state in merged.values()
    ]


def simulate_with_measurements(
    circuit,
    qubits,
    shots,
    evolve,
    backend_name,
):
    """
    evolve(state, operations) -> state applies unitary gates with the
    chosen library, starting from `state` (app bit order).
    """

    initial = np.zeros(2 ** qubits, dtype=complex)
    initial[0] = 1.0

    branches = [(1.0, initial)]
    pending = []

    def flush():
        nonlocal branches, pending

        if pending:
            branches = [
                (weight, np.asarray(evolve(state, pending), dtype=complex))
                for weight, state in branches
            ]
            pending = []

    for operation in sort_operations(circuit):
        if operation.get("gate") != "M":
            pending.append(operation)
            continue

        flush()

        qubit = int(operation["qubit"])
        next_branches = []

        for weight, state in branches:
            for outcome in (0, 1):
                probability, projected = project_qubit(
                    state, qubit, qubits, outcome,
                )

                if projected is not None and weight * probability > 1e-12:
                    next_branches.append(
                        (weight * probability, projected)
                    )

        branches = merge_branches(next_branches)

        if len(branches) > MAX_MEASUREMENT_BRANCHES:
            fail(
                "Too many mid-circuit measurements to simulate exactly. "
                "Reduce the number of M gates."
            )

    flush()

    weights = np.array([weight for weight, _ in branches], dtype=float)
    weights = weights / weights.sum()

    probabilities = np.zeros(2 ** qubits, dtype=float)

    for weight, (_, state) in zip(weights, branches):
        probabilities += weight * (np.abs(state) ** 2)

    probabilities = probabilities / probabilities.sum()

    rng = np.random.default_rng()

    trajectory = branches[
        int(rng.choice(len(branches), p=weights))
    ][1]

    result = state_to_result(trajectory, qubits)

    sampled = rng.multinomial(shots, probabilities)

    counts = {
        format(index, f"0{qubits}b"): int(count)
        for index, count in enumerate(sampled)
        if count > 0
    }

    return {
        **result,
        "probabilities": normalize_probabilities(probabilities),
        "probabilityMap": {
            format(index, f"0{qubits}b"): float(probability)
            for index, probability in enumerate(probabilities)
        },
        "counts": counts,
        "backend": backend_name,
        "measurementCollapse": True,
    }


def evolve_qiskit(state, operations, qubits):
    from qiskit.quantum_info import Statevector

    qc = apply_operations_qiskit(operations, qubits)

    # Qiskit is little-endian (qubit 0 rightmost); convert in and out.
    evolved = Statevector(
        reverse_statevector_qubit_order(state, qubits)
    ).evolve(qc)

    return reverse_statevector_qubit_order(
        np.asarray(evolved.data, dtype=complex),
        qubits,
    )


def evolve_cirq(state, operations, qubits):
    import cirq

    q, cirq_operations = apply_operations_cirq(operations, qubits)

    result = cirq.Simulator(dtype=np.complex128).simulate(
        cirq.Circuit(cirq_operations),
        qubit_order=q,
        initial_state=np.asarray(state, dtype=np.complex128),
    )

    # Cirq already uses qubit 0 as the leftmost bit.
    return np.asarray(result.final_state_vector, dtype=complex)


def evolve_pennylane(state, operations, qubits):
    import pennylane as qml

    device = qml.device("default.qubit", wires=qubits)

    @qml.qnode(device)
    def segment():
        qml.StatePrep(state, wires=range(qubits))
        apply_operations_pennylane(operations)
        return qml.state()

    # PennyLane wire 0 is the leftmost bit, like the app.
    return np.asarray(segment(), dtype=complex)


MEASUREMENT_EVOLVERS = {
    "qiskit-aer": evolve_qiskit,
    "cirq": evolve_cirq,
    "pennylane": evolve_pennylane,
}


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

    # 2^12 amplitudes is plenty for the UI (max 5 qubits); 30 qubits
    # would need ~16 GB of statevector memory.
    if qubits < 1 or qubits > 12:
        fail(
            "Qubit count must be between 1 and 12."
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

    # Defence in depth: a negative index would silently mean
    # "last qubit" in Python, so never rely on callers alone.
    for operation in circuit:
        if not isinstance(operation, dict):
            fail("Invalid circuit operation.")

        for field in ("qubit", "controlQubit"):
            value = operation.get(field)

            if value is None and field == "controlQubit":
                continue

            if (
                isinstance(value, bool)
                or not isinstance(value, int)
                or value < 0
                or value >= qubits
            ):
                fail(f"Invalid {field} in circuit operation.")

    if backend == "local":
        return run_local(
            circuit,
            qubits,
            shots,
        )

    if (
        backend in MEASUREMENT_EVOLVERS
        and has_measurements(circuit)
    ):
        evolver = MEASUREMENT_EVOLVERS[backend]

        return simulate_with_measurements(
            circuit,
            qubits,
            shots,
            lambda state, operations: evolver(
                state,
                operations,
                qubits,
            ),
            backend,
        )

    if (
        backend == "qbraid"
        and has_mid_circuit_measurement(circuit)
    ):
        # Final M gates are fine (they are implied by the readout),
        # but mid-circuit collapse is not wired up for qBraid.
        fail(
            "The qBraid backend does not support mid-circuit measurement "
            "(an M gate followed by more gates on the same qubit). "
            "Use Qiskit, Cirq or PennyLane for this circuit."
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
        return run_qbraid(
            circuit,
            qubits,
            shots,
        )

    fail(
        f"Unsupported backend: {backend}"
    )


# ============================================================
# ENTRY POINT
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

    except EngineInputError as error:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": error.message,
                    "code": error.code,
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