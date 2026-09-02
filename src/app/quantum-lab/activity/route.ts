import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const EVENT_TYPES = new Set(["circuit_run", "measurement", "circuit_updated"]);

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json();
    if (!EVENT_TYPES.has(body.eventType)) {
      return NextResponse.json({ error: "Invalid lab event." }, { status: 400 });
    }

    const qubits = Number(body.qubits);
    const gateCount = Number(body.gateCount);
    const circuitDepth = Number(body.circuitDepth);
    const shots = Number(body.shots ?? 0);
    if (![qubits, gateCount, circuitDepth, shots].every(Number.isFinite)) {
      return NextResponse.json({ error: "Invalid lab metrics." }, { status: 400 });
    }

    const { error } = await supabase.from("quantum_lab_activity").insert({
      user_id: user.id,
      event_type: body.eventType,
      qubits: Math.max(1, Math.min(5, Math.round(qubits))),
      gate_count: Math.max(0, Math.round(gateCount)),
      circuit_depth: Math.max(0, Math.round(circuitDepth)),
      shots: Math.max(0, Math.round(shots)),
      circuit: Array.isArray(body.circuit) ? body.circuit : [],
      probabilities: Array.isArray(body.probabilities) ? body.probabilities : [],
      results: Array.isArray(body.results) ? body.results : [],
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quantum lab activity error:", error);
    return NextResponse.json({ error: "Unable to save lab activity." }, { status: 500 });
  }
}
