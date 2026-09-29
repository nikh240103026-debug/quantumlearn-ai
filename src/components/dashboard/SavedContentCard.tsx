import Link from "next/link";
import { ArrowUpRight, Bookmark, FileText } from "lucide-react";

import type { DashboardSavedContent } from "@/types/personal-dashboard";

interface Props {
  items: DashboardSavedContent[];
}

export function SavedContentCard({ items }: Props) {
  return (
    <section className="border border-black/10 bg-white p-8 sm:p-10">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Saved content
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
            Your library
          </h2>
        </div>

        <Bookmark size={20} className="text-black/25" />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 border-y border-dashed border-black/15 py-12">
          <p className="text-sm font-semibold">
            Nothing saved yet.
          </p>

          <p className="mt-2 text-sm leading-6 text-black/45">
            Save useful resources and they will appear here.
          </p>

          <Link
            href="/resources"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            Browse resources
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 border-t border-black/10">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-start justify-between gap-5 border-b border-black/10 py-5"
            >
              <div className="flex gap-4">
                <FileText
                  size={17}
                  className="mt-1 shrink-0 text-black/25"
                />

                <div>
                  <h3 className="text-sm font-semibold transition-colors group-hover:text-blue-600">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/45">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-black/25 transition-colors group-hover:text-blue-600"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}