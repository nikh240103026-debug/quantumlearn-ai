import QuantumCircuitSimulator from "@/components/quantum-lab/QuantumCircuitSimulator";

export default function QuantumLabPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <QuantumCircuitSimulator />
      </div>
    </main>
  );
}