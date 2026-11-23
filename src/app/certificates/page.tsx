import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Lock,
  SearchCheck,
  UserRound,
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCertificateOverview } from "@/lib/certificates/certificate-service";
import {
  certificateHeading,
  formatIssueDate,
  verificationPath,
} from "@/lib/certificates/format";
import type { CertificateProgram } from "@/lib/certificates/types";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { ClaimCertificateButton } from "@/components/certificates/ClaimCertificateButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Earn, download and share verifiable QuantumLearn AI certificates.",
};

export default async function CertificatesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const overview = await getCertificateOverview(supabase, user);
  const open = overview.programs.filter((program) => !program.certificate);
  const ready = open.filter((program) => program.eligible);
  const working = open.filter((program) => !program.eligible);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="ql-grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Credentials
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Certificates
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
              Complete a course or pass an assessment to earn a certificate.
              Each one has a unique number and a public link that anyone can
              use to check it is genuine.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Stat label="Earned" value={overview.earned.filter((c) => c.status === "issued").length} />
            <Stat label="Ready to claim" value={ready.length} highlight={ready.length > 0} />
          </div>
        </header>

        {overview.unavailable && (
          <p className="mt-8 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-5 py-4 text-sm text-amber-100/90">
            Certificates are temporarily unavailable. Your progress is safe —
            please check back shortly.
          </p>
        )}

        {/* Name printed on certificates */}
        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0a0e18] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-sm text-white/70">
            <UserRound size={18} className="shrink-0 text-white/40" />
            {overview.recipientName ? (
              <span>
                New certificates will be issued to{" "}
                <span className="font-semibold text-white">{overview.recipientName}</span>.
                The name can&apos;t be changed after a certificate is issued.
              </span>
            ) : (
              <span className="text-amber-100/90">
                Add your full name to your profile before claiming. It is printed on the certificate.
              </span>
            )}
          </p>
          <Link
            href="/settings#profile"
            className="shrink-0 text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            {overview.recipientName ? "Edit name" : "Add your name"} →
          </Link>
        </div>

        {/* Ready to claim */}
        {ready.length > 0 && (
          <Section title="Ready to claim" count={ready.length}>
            <ul className="space-y-3">
              {ready.map((program) => (
                <ProgramRow key={`${program.kind}:${program.refId}`} program={program}>
                  <ClaimCertificateButton
                    kind={program.kind}
                    refId={program.refId}
                    disabled={!overview.recipientName || overview.unavailable}
                  />
                </ProgramRow>
              ))}
            </ul>
          </Section>
        )}

        {/* Earned */}
        <Section title="Your certificates" count={overview.earned.length}>
          {overview.earned.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 px-6 py-14 text-center">
              <Award size={28} className="text-white/30" />
              <p className="mt-4 font-semibold">No certificates yet</p>
              <p className="mt-1 max-w-sm text-sm text-white/50">
                Finish a course or pass an assessment below — your first
                certificate is closer than you think.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {overview.earned.map((certificate) => (
                <li key={certificate.id}>
                  <Link
                    href={verificationPath(certificate.verificationToken)}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18] transition-colors hover:border-white/25"
                  >
                    <div className="border-b border-white/[0.07] bg-[#0d1220] p-4 sm:p-5">
                      <div className="pointer-events-none overflow-hidden rounded-sm shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:-translate-y-0.5">
                        <CertificateDocument certificate={certificate} printable={false} />
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                          {certificateHeading(certificate)}
                        </p>
                        <p className="mt-1 truncate font-semibold">{certificate.title}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {formatIssueDate(certificate.issuedAt)} · {certificate.certificateNumber}
                        </p>
                      </div>
                      {certificate.status === "revoked" ? (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-300">
                          Open <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* In progress */}
        {working.length > 0 && (
          <Section title="Available to earn" count={working.length}>
            <ul className="space-y-3">
              {working.map((program) => (
                <ProgramRow key={`${program.kind}:${program.refId}`} program={program}>
                  <Link
                    href={program.href}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {program.kind === "course"
                      ? program.done
                        ? "Continue course"
                        : "Start course"
                      : program.bestScore !== null
                        ? "Try again"
                        : "Take assessment"}
                    <ArrowRight size={14} />
                  </Link>
                </ProgramRow>
              ))}
            </ul>
          </Section>
        )}

        <p className="mt-14 flex items-center gap-2 text-sm text-white/45">
          <SearchCheck size={16} />
          Someone shared a certificate with you?{" "}
          <Link href="/verify" className="font-semibold text-blue-300 hover:text-blue-200">
            Verify it here
          </Link>
        </p>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-[120px] rounded-xl border px-4 py-3 ${
        highlight ? "border-blue-400/40 bg-blue-500/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-white/45">{label}</p>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
        {title}
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-white/60">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function ProgramRow({
  program,
  children,
}: {
  program: CertificateProgram;
  children: React.ReactNode;
}) {
  const Icon = program.kind === "course" ? BookOpen : ClipboardCheck;
  const progress =
    program.kind === "course"
      ? program.total
        ? Math.round(((program.done ?? 0) / program.total) * 100)
        : 0
      : Math.min(100, Math.round(program.bestScore ?? 0));

  return (
    <li className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0a0e18] p-5 sm:flex-row sm:items-center">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          program.eligible ? "bg-blue-500/15 text-blue-300" : "bg-white/[0.05] text-white/45"
        }`}
      >
        {program.eligible ? <Icon size={20} /> : <Lock size={18} />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{program.title}</p>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/50">
            {program.kind === "course" ? "Certificate of Completion" : "Certificate of Achievement"}
          </span>
          {program.level && <span className="text-xs text-white/40">{program.level}</span>}
        </div>
        <p className="mt-1 text-sm text-white/50">
          {program.requirement}
          {program.kind === "course" && program.total
            ? ` · ${program.done}/${program.total} done`
            : program.bestScore !== null
              ? ` · best so far ${Math.round(program.bestScore)}%`
              : " · not attempted yet"}
        </p>

        <div className="relative mt-3 h-1.5 max-w-md rounded-full bg-white/[0.07]">
          <div
            className={`h-full rounded-full ${program.eligible ? "bg-emerald-400" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          />
          {program.passMark !== null && (
            <span
              className="absolute -top-1 h-3.5 w-0.5 bg-white/60"
              style={{ left: `${program.passMark}%` }}
              title={`Pass mark ${program.passMark}%`}
            />
          )}
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </li>
  );
}
