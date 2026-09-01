import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const {
      question,
      qubits,
      circuit,
      state,
      probabilities,
    } = body;

    if (
      !question ||
      typeof question !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Question is required.",
        },
        { status: 400 },
      );
    }

    const response = await openai.responses.create({
      model:
        process.env.OPENAI_QUANTUM_TUTOR_MODEL ??
        "gpt-5.6-luna",

      instructions: `
You are QuantumLearn AI's Quantum Tutor.

Your job is to teach quantum computing to students.

Explain concepts clearly and progressively.

The student is using an educational quantum circuit
simulator.

When explaining a circuit:

1. Identify the gates.
2. Explain what each gate does.
3. Explain the state transformation.
4. Explain probabilities when relevant.
5. Explain measurement results.
6. Use equations when useful.
7. Do not pretend that unsupported simulator features exist.
8. Prefer intuitive explanations before advanced mathematics.
9. If the student asks something unrelated to quantum
   computing, politely redirect them toward the Quantum Lab.

Keep explanations educational and concise.
      `,

      input: `
Student question:

${question}

Current quantum lab state:

Qubits:
${qubits}

Circuit:
${JSON.stringify(circuit, null, 2)}

State vector:
${JSON.stringify(state, null, 2)}

Probabilities:
${JSON.stringify(probabilities, null, 2)}
      `,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(
      "Quantum tutor API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to contact the quantum tutor.",
      },
      { status: 500 },
    );
  }
}