import {
  NextResponse,
} from "next/server";

import {
  createSupabaseServerClient,
} from "@/lib/supabase-server";

import {
  isQuantumBackend,
} from "@/lib/quantum/backends";

import {
  runPythonQuantumBackend,
} from "@/lib/quantum/backends/python-runner";

import type {
  BackendExecutionRequest,
} from "@/lib/quantum/backends/types";

import type {
  CircuitGate,
  QuantumGate,
} from "@/lib/quantum/types";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const MAX_CIRCUIT_OPERATIONS = 500;

const SUPPORTED_GATES: QuantumGate[] = [
  "I",
  "X",
  "Y",
  "Z",
  "H",
  "S",
  "T",
  "CNOT",
  "CZ",
  "SWAP",
  "M",
];

function isCircuitGate(
  value: unknown,
): value is CircuitGate {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const gate =
    value as Record<string, unknown>;

  if (
    typeof gate.id !== "string" ||
    typeof gate.gate !== "string" ||
    typeof gate.qubit !== "number" ||
    typeof gate.column !== "number"
  ) {
    return false;
  }

  if (
    !Number.isInteger(gate.qubit) ||
    !Number.isInteger(gate.column)
  ) {
    return false;
  }

  if (
    !SUPPORTED_GATES.includes(
      gate.gate as QuantumGate,
    )
  ) {
    return false;
  }

  if (
    gate.controlQubit !== undefined &&
    (
      typeof gate.controlQubit !== "number" ||
      !Number.isInteger(
        gate.controlQubit,
      )
    )
  ) {
    return false;
  }

  return true;
}

export async function POST(
  request: Request,
) {
  try {
    /*
     * ================================================================
     * AUTHENTICATION
     * ================================================================
     *
     * Quantum backend execution consumes server-side resources.
     * Anonymous users must not be allowed to execute circuits.
     */
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ================================================================
     * REQUEST PARSING
     * ================================================================
     */
    const body =
      (await request.json()) as Partial<BackendExecutionRequest>;

    const backend =
      body.backend;

    if (
      !isQuantumBackend(
        backend,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid quantum backend.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ================================================================
     * BASIC RESOURCE LIMITS
     * ================================================================
     */
    const qubits =
      Number(
        body.qubits,
      );

    const shots =
      Number(
        body.shots ?? 1024,
      );

    const rawCircuit =
      body.circuit;

    if (
      !Number.isInteger(
        qubits,
      ) ||
      qubits < 1 ||
      qubits > 30
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Qubit count must be between 1 and 30.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isInteger(
        shots,
      ) ||
      shots < 1 ||
      shots > 100000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Shots must be between 1 and 100000.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Array.isArray(
        rawCircuit,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Circuit must be an array.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ================================================================
     * CIRCUIT VALIDATION
     * ================================================================
     *
     * The request body is untrusted runtime data.
     * Validate every operation before passing it to the
     * quantum execution backend.
     */
    if (
      rawCircuit.length >
      MAX_CIRCUIT_OPERATIONS
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Circuit contains too many operations. Maximum allowed is ${MAX_CIRCUIT_OPERATIONS}.`,
        },
        {
          status: 400,
        },
      );
    }

    for (
      let index = 0;
      index < rawCircuit.length;
      index++
    ) {
      const gate =
        rawCircuit[index];

      if (
        !isCircuitGate(
          gate,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Circuit operation ${index + 1} is invalid.`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        gate.qubit < 0 ||
        gate.qubit >= qubits
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Circuit operation ${index + 1} has an invalid target qubit.`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        gate.column < 0 ||
        gate.column > 10000
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Circuit operation ${index + 1} has an invalid column.`,
          },
          {
            status: 400,
          },
        );
      }

      const isControlledGate =
        gate.gate === "CNOT" ||
        gate.gate === "CZ" ||
        gate.gate === "SWAP";

      if (
        isControlledGate
      ) {
        if (
          gate.controlQubit === undefined
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Circuit operation ${index + 1} requires a control qubit.`,
            },
            {
              status: 400,
            },
          );
        }

        if (
          gate.controlQubit < 0 ||
          gate.controlQubit >= qubits
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Circuit operation ${index + 1} has an invalid control qubit.`,
            },
            {
              status: 400,
            },
          );
        }

        if (
          gate.controlQubit ===
          gate.qubit
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Circuit operation ${index + 1} cannot use the same qubit as control and target.`,
            },
            {
              status: 400,
            },
          );
        }
      }
    }

    /*
     * ================================================================
     * LOCAL BACKEND
     * ================================================================
     *
     * Local simulation is intentionally handled by the browser.
     */
    if (
      backend === "local"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Local simulation is handled by the browser simulator.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ================================================================
     * QUANTUM BACKEND EXECUTION
     * ================================================================
     *
     * At this point rawCircuit has been validated by
     * isCircuitGate(), so it can safely be treated as CircuitGate[].
     */
    const circuit =
      rawCircuit as CircuitGate[];

    const quantumRequest: BackendExecutionRequest =
      {
        backend,
        qubits,
        shots,
        circuit,
      };

    const result =
      await runPythonQuantumBackend(
        quantumRequest,
      );

    return NextResponse.json(
      result,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Quantum backend execution error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Quantum backend execution failed.",
      },
      {
        status: 500,
      },
    );
  }
}