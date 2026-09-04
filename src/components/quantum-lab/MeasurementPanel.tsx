"use client";

interface MeasurementPanelProps {
  result: string | null;
  onMeasure: () => void;
}

export default function MeasurementPanel({
  result,
  onMeasure,
}: MeasurementPanelProps) {
  return (
    <section className="border border-slate-800 bg-black p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Quantum Measurement
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Measure the current state
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Measurement samples one computational-basis state according to the current probability distribution.
          </p>

        </div>

        <button
          type="button"
          onClick={onMeasure}
          className="border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Measure
        </button>

      </div>

      {result !== null && (
        <div className="mt-6 border border-blue-900 bg-slate-950 p-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Latest measurement
          </p>

          <div className="mt-3 flex items-center justify-between">

            <span className="font-mono text-3xl font-bold text-white">
              |{result}⟩
            </span>

            <span className="font-mono text-xs text-slate-500">
              computational basis
            </span>

          </div>

        </div>
      )}

    </section>
  );
}