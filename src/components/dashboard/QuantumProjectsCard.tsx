import Link from "next/link";
import { ArrowRight, Cpu, Plus } from "lucide-react";

import type { DashboardLabProject } from "@/types/personal-dashboard";

interface Props {
  projects: DashboardLabProject[];
}

export function QuantumLabProjectsCard({ projects }: Props) {
  return (
    <section className="border border-black/10 bg-white p-8 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Quantum Lab
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
            Your projects
          </h2>
        </div>

        <Link
          href="/quantum-lab"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          Open Lab
          <ArrowRight size={15} />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 border-y border-dashed border-black/15 py-12">
          <div className="flex h-11 w-11 items-center justify-center bg-black/5">
            <Cpu size={19} className="text-black/35" />
          </div>

          <p className="mt-5 text-sm font-semibold">
            No saved Lab projects yet.
          </p>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
            Create and save your first quantum circuit project in
            Quantum Lab.
          </p>

          <Link
            href="/quantum-lab"
            className="mt-6 inline-flex items-center gap-2 bg-[#090c11] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            <Plus size={15} />
            Create project
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className="group border border-black/10 p-5 transition-colors hover:border-blue-600/40"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h3 className="font-semibold transition-colors group-hover:text-blue-600">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-xs text-black/45">
                    {project.description ??
                      "Quantum circuit project"}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </div>

              <div className="mt-5 flex gap-5 text-[10px] uppercase tracking-[0.14em] text-black/30">
                <span>{project.qubits} qubits</span>
                <span>
                  Updated {formatDate(project.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}