import { ReactNode } from "react";

export default function AssessmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </div>
    </section>
  );
}