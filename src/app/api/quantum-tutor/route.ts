import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be logged in to use the Quantum Tutor." }, { status: 401 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Quantum Tutor is not configured correctly." }, { status: 500 });
    const openai = new OpenAI({ apiKey });
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) return NextResponse.json({ error: "Question is required." }, { status: 400 });

    const { qubits, circuit, state, probabilities } = body;
    const response = await openai.responses.create({
      model: process.env.OPENAI_QUANTUM_TUTOR_MODEL ?? "gpt-5.6-luna",
      instructions: `You are QuantumLearn AI's Quantum Tutor. Teach quantum computing clearly and progressively. The student is using an educational quantum circuit simulator. Identify gates, explain transformations and probabilities, and explain measurement when relevant. Use only the supplied simulator state. Prefer intuition before advanced mathematics. Keep explanations concise.`,
      input: `Student question:\n${question}\n\nCurrent quantum lab state:\nQubits: ${qubits}\nCircuit: ${JSON.stringify(circuit, null, 2)}\nState vector: ${JSON.stringify(state, null, 2)}\nProbabilities: ${JSON.stringify(probabilities, null, 2)}`,
    });
    const answer = response.output_text?.trim();
    if (!answer) return NextResponse.json({ error: "Quantum Tutor returned an empty response." }, { status: 500 });

    await supabase.from("ai_activity").insert({
      user_id: user.id, activity_type: "quantum_lab_tutor", source: "quantum-lab", topic: "Quantum Lab", title: "Quantum Lab Tutor interaction",
      metadata: { qubits, gateCount: Array.isArray(circuit) ? circuit.length : 0 },
    });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Quantum tutor API error:", error);
    return NextResponse.json({ error: "Unable to contact the quantum tutor." }, { status: 500 });
  }
}
