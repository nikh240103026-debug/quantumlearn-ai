import {
  NextResponse,
} from "next/server";

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
} from "@/lib/quantum/types";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function POST(
  request: Request,
) {
  try {
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

    const qubits =
      Number(
        body.qubits,
      );

    const shots =
      Number(
        body.shots ?? 1024,
      );

    const circuit =
      body.circuit;

    if (
      !Number.isInteger(
        qubits,
      ) ||
      qubits < 1 ||
      qubits > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Qubit count must be between 1 and 20.",
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
        circuit,
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

    if (
      backend ===
      "local"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Local simulation remains handled by the existing QuantumLearn simulator.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      backend ===
      "qbraid"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "qBraid integration is not enabled yet.",
        },
        {
          status: 501,
        },
      );
    }

    const result =
      await runPythonQuantumBackend(
        {
          backend,
          qubits,
          shots,
          circuit:
            circuit as CircuitGate[],
        },
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