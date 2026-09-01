interface MeasurementHistogramProps {
  results: number[];
  qubits: number;
}

export default function MeasurementHistogram({
  results,
  qubits,
}: MeasurementHistogramProps) {
  const total = results.reduce(
    (sum, value) => sum + value,
    0,
  );

  if (total === 0) {
    return null;
  }

  
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-950">
          Measurement Results
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Experimental measurement distribution.
        </p>
      </div>

      <div className="space-y-4">
        {results.map((count, index) => {
          if (count === 0) {
            return null;
          }

          const percentage =
            (count / total) * 100;

          const label = index
            .toString(2)
            .padStart(qubits, "0");

          return (
            <div key={index}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-mono font-semibold">
                  |{label}⟩
                </span>

                <span>
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}