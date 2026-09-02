import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_ACTIVITY_TYPES = [
  "circuit_run",
  "measurement",
  "circuit_reset",
  "template_loaded",
] as const;

type ActivityType = (typeof ALLOWED_ACTIVITY_TYPES)[number];

type QuantumLabActivityPayload = {
  activityType?: ActivityType;
  qubits?: number | null;
  gateCount?: number | null;
  circuitDepth?: number | null;
  shots?: number | null;
  measurementResult?: string | null;
  gates?: unknown[];
  circuit?: unknown[];
  sourcePage?: string | null;
  metadata?: Record<string, unknown>;
};

function isValidActivityType(
  value: unknown,
): value is ActivityType {
  return (
    typeof value === "string" &&
    ALLOWED_ACTIVITY_TYPES.includes(
      value as ActivityType,
    )
  );
}

function sanitizeInteger(
  value: unknown,
  min = 0,
  max = 1000000,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || !Number.isInteger(number)) {
    return null;
  }

  return Math.min(Math.max(number, min), max);
}

function sanitizeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.slice(0, 1000) : [];
}

function sanitizeMetadata(
  value: unknown,
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).slice(
      0,
      50,
    ),
  );
}

function sanitizeText(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed
    ? trimmed.slice(0, maxLength)
    : null;
}

export async function POST(request: Request) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    let body: QuantumLabActivityPayload;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    if (!isValidActivityType(body.activityType)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Quantum Lab activity type.",
        },
        { status: 400 },
      );
    }

    const activity = {
      user_id: user.id,
      activity_type: body.activityType,

      qubits: sanitizeInteger(body.qubits, 1, 32),
      gate_count: sanitizeInteger(
        body.gateCount,
        0,
        10000,
      ),
      circuit_depth: sanitizeInteger(
        body.circuitDepth,
        0,
        10000,
      ),
      shots: sanitizeInteger(
        body.shots,
        1,
        1000000,
      ),

      measurement_result: sanitizeText(
        body.measurementResult,
        10000,
      ),

      gates: sanitizeArray(body.gates),
      circuit: sanitizeArray(body.circuit),

      source_page: sanitizeText(
        body.sourcePage,
        500,
      ),

      metadata: sanitizeMetadata(body.metadata),
    };

    const { data, error } = await supabase
      .from("quantum_lab_activity")
      .insert(activity)
      .select(
        "id, activity_type, qubits, gate_count, circuit_depth, shots, measurement_result, source_page, created_at",
      )
      .single();

    if (error) {
      console.error(
        "Quantum Lab activity insert error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save Quantum Lab activity.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        activity: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Quantum Lab activity API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "An unexpected error occurred while saving Quantum Lab activity.",
      },
      { status: 500 },
    );
  }
}