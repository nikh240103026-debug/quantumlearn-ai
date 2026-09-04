"use client";

import {
  useRef,
} from "react";

import type {
  CircuitGate,
} from "@/lib/quantum/types";

interface CircuitStorageProps {
  qubits: number;
  circuit: CircuitGate[];
  onLoad: (
    qubits: number,
    circuit: CircuitGate[],
  ) => void;
}

type SavedCircuit = {
  version: 1;
  type: "QuantumLearn Circuit";
  qubits: number;
  circuit: CircuitGate[];
};

export default function CircuitStorage({
  qubits,
  circuit,
  onLoad,
}: CircuitStorageProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  function saveCircuit() {
    const data: SavedCircuit = {
      version: 1,
      type: "QuantumLearn Circuit",
      qubits,
      circuit,
    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2,
          ),
        ],
        {
          type: "application/json",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;
    anchor.download =
      "quantumlearn-circuit.json";

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  function openFile() {
    inputRef.current?.click();
  }

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text =
        await file.text();

      const parsed =
        JSON.parse(
          text,
        ) as Partial<SavedCircuit>;

      if (
        parsed.type !==
          "QuantumLearn Circuit" ||
        parsed.version !== 1 ||
        typeof parsed.qubits !==
          "number" ||
        !Array.isArray(
          parsed.circuit,
        )
      ) {
        throw new Error(
          "Invalid QuantumLearn circuit file.",
        );
      }

      onLoad(
        parsed.qubits,
        parsed.circuit,
      );
    } catch {
      window.alert(
        "Unable to load this circuit file.",
      );
    }

    event.target.value = "";
  }

  return (
    <section className="border border-slate-800 bg-black p-6">

      <div>

        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Circuit Files
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Save or load your work
        </h2>

      </div>

      <div className="mt-5 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={
            saveCircuit
          }
          className="border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Save Circuit
        </button>

        <button
          type="button"
          onClick={
            openFile
          }
          className="border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 hover:border-blue-600"
        >
          Load Circuit
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          onChange={
            handleFile
          }
          className="hidden"
        />

      </div>

    </section>
  );
}