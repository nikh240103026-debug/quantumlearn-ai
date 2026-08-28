import {
  FileText,
  BookOpen,
  Code2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const resources = [
  {
    type: "Research",
    title: "Quantum Computing Research",
    description:
      "Explore selected research papers and technical material to understand current developments in quantum computing.",
    icon: FileText,
    meta: "Research papers",
  },
  {
    type: "Learning",
    title: "Quantum Computing Tutorials",
    description:
      "Follow carefully organized tutorials that connect theoretical concepts with practical examples.",
    icon: BookOpen,
    meta: "Guided tutorials",
  },
  {
    type: "Development",
    title: "Qiskit Documentation",
    description:
      "Learn how to translate quantum concepts into working Python programs and executable circuits.",
    icon: Code2,
    meta: "Developer resources",
  },
];

export function ResourcesSection() {
  return (
    <section
        id="resources" 
        className="bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Resources
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Everything You Need to Go Deeper.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Move beyond the lessons with curated research,
              tutorials, documentation, and practical development
              resources.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Explore all resources
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Resource cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <article
                key={resource.title}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Icon size={22} strokeWidth={1.7} />
                </div>

                {/* Type */}
                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {resource.type}
                </p>

                {/* Title */}
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {resource.title}
                </h3>

                {/* Description */}
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    {resource.meta}
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all group-hover:border-blue-200 group-hover:text-blue-600">
                    <ExternalLink size={14} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}