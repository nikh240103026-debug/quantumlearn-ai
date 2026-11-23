import "server-only";

import { cache } from "react";
import { randomBytes, randomInt } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  getAllAssessments,
  getAssessmentById,
} from "@/lib/assessment/assessmentService";
import type { AssessmentGrade } from "@/lib/assessment/gradingService";
import type {
  CertificateKind,
  CertificateOverview,
  CertificateProgram,
  CertificateRecord,
} from "./types";

/*
 * Certificates are issued ONLY here, with the service-role client, after
 * eligibility has been recomputed from data the learner cannot forge:
 *   - course:     every published lesson of the course is completed;
 *   - assessment: a passed attempt recorded by /api/assessment/.../submit.
 * See supabase/migrations/20261124000000_certificates.sql.
 */

type Row = Record<string, unknown>;

const CERTIFICATE_COLUMNS =
  "id, kind, course_id, assessment_id, title, recipient_name, certificate_number, verification_token, status, issued_at, revoked_at, score, metadata";

// No 0/O/1/I, so a number read off paper can be typed back reliably.
const NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCertificateNumber(date = new Date()) {
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += NUMBER_ALPHABET[randomInt(NUMBER_ALPHABET.length)];
  }
  return `QL-${date.getUTCFullYear()}-${suffix.slice(0, 4)}-${suffix.slice(4)}`;
}

function generateVerificationToken() {
  return randomBytes(18).toString("base64url");
}

export function normaliseCertificateNumber(input: string) {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = /^QL(\d{4})([A-Z0-9]{4})([A-Z0-9]{4})$/.exec(compact);
  return match ? `QL-${match[1]}-${match[2]}-${match[3]}` : null;
}

export function isValidVerificationToken(token: string) {
  return /^[A-Za-z0-9_-]{16,64}$/.test(token);
}

function toRecord(row: Row): CertificateRecord {
  const metadata =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};
  const kind: CertificateKind =
    row.kind === "assessment" ? "assessment" : "course";

  return {
    id: String(row.id),
    kind,
    courseId: row.course_id ? String(row.course_id) : null,
    assessmentId: row.assessment_id ? String(row.assessment_id) : null,
    title: String(row.title ?? "QuantumLearn AI Certificate"),
    recipientName: String(row.recipient_name ?? "QuantumLearn learner"),
    certificateNumber: String(row.certificate_number ?? ""),
    verificationToken: String(row.verification_token ?? ""),
    status: row.status === "revoked" ? "revoked" : "issued",
    issuedAt: String(row.issued_at ?? new Date().toISOString()),
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    level: typeof metadata.level === "string" ? metadata.level : null,
    lessonCount:
      typeof metadata.lessonCount === "number" ? metadata.lessonCount : null,
    passMark:
      typeof metadata.passMark === "number" ? metadata.passMark : null,
  };
}

// ---------------------------------------------------------------------------
// Recipient name
// ---------------------------------------------------------------------------

export async function getRecipientName(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const fromProfile =
    typeof profile?.full_name === "string" ? profile.full_name.trim() : "";
  const meta = user.user_metadata ?? {};
  const fromMeta =
    typeof meta.full_name === "string" ? meta.full_name.trim() : "";

  const name = (fromProfile || fromMeta).replace(/\s+/g, " ").slice(0, 80);

  // A username-like value ("qubit_fan42") shouldn't be printed as a name.
  return name.length >= 2 ? name : null;
}

// ---------------------------------------------------------------------------
// Overview: what the learner has earned, can claim, and is working toward
// ---------------------------------------------------------------------------

export async function getCertificateOverview(
  supabase: SupabaseClient,
  user: User,
): Promise<CertificateOverview> {
  const [courses, lessons, progress, attempts, certificates, recipientName] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, title, description, level")
        .eq("is_published", true),
      supabase.from("lessons").select("id, course_id").eq("is_published", true),
      supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true),
      supabase
        .from("assessment_attempts")
        .select("assessment_id, percentage, passed")
        .eq("user_id", user.id),
      supabase
        .from("certificates")
        .select(CERTIFICATE_COLUMNS)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false }),
      getRecipientName(supabase, user),
    ]);

  if (certificates.error) {
    console.error("[CERTIFICATES] overview certificates:", certificates.error);
  }
  if (attempts.error) {
    console.error("[CERTIFICATES] overview attempts:", attempts.error);
  }

  const earned = ((certificates.data ?? []) as Row[]).map(toRecord);
  const completed = new Set(
    (progress.data ?? []).map((row) => String(row.lesson_id)),
  );

  const programs: CertificateProgram[] = [];

  for (const course of (courses.data ?? []) as Row[]) {
    const courseId = String(course.id);
    const lessonIds = (lessons.data ?? [])
      .filter((lesson) => String(lesson.course_id) === courseId)
      .map((lesson) => String(lesson.id));
    if (lessonIds.length === 0) continue;

    const done = lessonIds.filter((id) => completed.has(id)).length;

    programs.push({
      kind: "course",
      refId: courseId,
      title: String(course.title ?? "Course"),
      level: typeof course.level === "string" ? course.level : null,
      description: String(course.description ?? ""),
      requirement: `Complete all ${lessonIds.length} lessons`,
      done,
      total: lessonIds.length,
      bestScore: null,
      passMark: null,
      eligible: done === lessonIds.length,
      href: "/dashboard",
      certificate:
        earned.find((c) => c.kind === "course" && c.courseId === courseId) ??
        null,
    });
  }

  for (const assessment of getAllAssessments()) {
    const mine = (attempts.data ?? []).filter(
      (attempt) => attempt.assessment_id === assessment.id,
    );
    const best = mine.length
      ? Math.max(...mine.map((attempt) => Number(attempt.percentage) || 0))
      : null;

    programs.push({
      kind: "assessment",
      refId: assessment.id,
      title: assessment.title,
      level: assessment.difficulty,
      description: assessment.description,
      requirement: `Score ${assessment.passingMarks}% or more`,
      done: null,
      total: null,
      bestScore: best,
      passMark: assessment.passingMarks,
      eligible: mine.some((attempt) => attempt.passed === true),
      href: `/practice/assessment/${assessment.id}`,
      certificate:
        earned.find(
          (c) => c.kind === "assessment" && c.assessmentId === assessment.id,
        ) ?? null,
    });
  }

  return {
    recipientName,
    programs,
    earned,
    unavailable: Boolean(certificates.error),
  };
}

// ---------------------------------------------------------------------------
// Issue (claim)
// ---------------------------------------------------------------------------

export class CertificateError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function issueCertificate({
  supabase,
  user,
  kind,
  refId,
}: {
  supabase: SupabaseClient;
  user: User;
  kind: CertificateKind;
  refId: string;
}): Promise<{ certificate: CertificateRecord; created: boolean }> {
  const overview = await getCertificateOverview(supabase, user);

  if (overview.unavailable) {
    throw new CertificateError(
      "Certificates are temporarily unavailable. Please try again later.",
      503,
    );
  }

  const program = overview.programs.find(
    (p) => p.kind === kind && p.refId === refId,
  );

  if (!program) {
    throw new CertificateError("Certificate program not found.", 404);
  }

  if (program.certificate) {
    return { certificate: program.certificate, created: false };
  }

  if (!program.eligible) {
    throw new CertificateError(
      kind === "course"
        ? "Complete every lesson in this course to earn the certificate."
        : "Pass this assessment to earn the certificate.",
      403,
    );
  }

  if (!overview.recipientName) {
    throw new CertificateError(
      "Add your full name in Settings → Profile first. It is printed on the certificate.",
      422,
    );
  }

  const admin = createSupabaseAdminClient();

  let score: number | null = null;
  const metadata: Record<string, unknown> = { level: program.level };

  if (kind === "course") {
    metadata.lessonCount = program.total;
  } else {
    // Best passing attempt, read with the service role (the source of truth).
    const { data: best, error } = await admin
      .from("assessment_attempts")
      .select("id, percentage, score, total_marks")
      .eq("user_id", user.id)
      .eq("assessment_id", refId)
      .eq("passed", true)
      .order("percentage", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !best) {
      throw new CertificateError("Pass this assessment to earn the certificate.", 403);
    }

    score = Math.round(Number(best.percentage));
    metadata.passMark = program.passMark;
    metadata.attemptId = best.id;
    metadata.marks = `${best.score}/${best.total_marks}`;
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await admin
      .from("certificates")
      .insert({
        user_id: user.id,
        kind,
        course_id: kind === "course" ? refId : null,
        assessment_id: kind === "assessment" ? refId : null,
        title: program.title,
        recipient_name: overview.recipientName,
        score,
        status: "issued",
        certificate_number: generateCertificateNumber(),
        verification_token: generateVerificationToken(),
        issued_at: new Date().toISOString(),
        metadata,
      })
      .select(CERTIFICATE_COLUMNS)
      .single();

    if (!error && data) {
      return { certificate: toRecord(data as Row), created: true };
    }

    if (error?.code !== "23505") {
      console.error("[CERTIFICATES] issue:", error);
      throw new CertificateError("Unable to issue the certificate.", 500);
    }

    // Unique violation: either a double-click already issued it, or a
    // (very unlikely) number/token collision — check, then retry.
    const existing = await admin
      .from("certificates")
      .select(CERTIFICATE_COLUMNS)
      .eq("user_id", user.id)
      .eq("kind", kind)
      .eq(kind === "course" ? "course_id" : "assessment_id", refId)
      .maybeSingle();

    if (existing.data) {
      return { certificate: toRecord(existing.data as Row), created: false };
    }
  }

  throw new CertificateError("Unable to issue the certificate.", 500);
}

// ---------------------------------------------------------------------------
// Public verification
// ---------------------------------------------------------------------------

export const getPublicCertificate = cache(
  async (token: string): Promise<CertificateRecord | null> => {
    if (!isValidVerificationToken(token)) return null;

    const { data, error } = await createSupabaseAdminClient()
      .from("certificates")
      .select(CERTIFICATE_COLUMNS)
      .eq("verification_token", token)
      .maybeSingle();

    if (error) {
      console.error("[CERTIFICATES] verify:", error);
      return null;
    }

    return data ? toRecord(data as Row) : null;
  },
);

export async function getOwnerId(token: string): Promise<string | null> {
  if (!isValidVerificationToken(token)) return null;
  const { data } = await createSupabaseAdminClient()
    .from("certificates")
    .select("user_id")
    .eq("verification_token", token)
    .maybeSingle();
  return data?.user_id ? String(data.user_id) : null;
}

export async function findTokenByNumber(number: string): Promise<string | null> {
  const normalised = normaliseCertificateNumber(number);
  if (!normalised) return null;

  const { data } = await createSupabaseAdminClient()
    .from("certificates")
    .select("verification_token")
    .eq("certificate_number", normalised)
    .maybeSingle();

  return data?.verification_token ? String(data.verification_token) : null;
}

// ---------------------------------------------------------------------------
// Assessment attempts
// ---------------------------------------------------------------------------

/** Records a server-graded attempt. Never throws: grading must still work. */
export async function recordAssessmentAttempt(
  userId: string,
  assessmentId: string,
  grade: AssessmentGrade,
  durationSeconds: number | null,
): Promise<string | null> {
  if (!getAssessmentById(assessmentId)) return null;

  try {
    const percentage =
      grade.totalMarks > 0
        ? Math.round((grade.score / grade.totalMarks) * 10000) / 100
        : 0;

    const { data, error } = await createSupabaseAdminClient()
      .from("assessment_attempts")
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        score: grade.score,
        total_marks: grade.totalMarks,
        percentage,
        passed: grade.passed,
        correct_answers: grade.correctAnswers,
        wrong_answers: grade.wrongAnswers,
        skipped_answers: grade.skippedAnswers,
        duration_seconds: durationSeconds,
      })
      .select("id")
      .single();

    if (error) throw error;
    return String(data.id);
  } catch (error) {
    console.error("[CERTIFICATES] record attempt:", error);
    return null;
  }
}
