export type CertificateKind = "course" | "assessment";

export interface CertificateRecord {
  id: string;
  kind: CertificateKind;
  courseId: string | null;
  assessmentId: string | null;
  /** Course or assessment title, snapshotted at issue time. */
  title: string;
  recipientName: string;
  certificateNumber: string;
  verificationToken: string;
  status: "issued" | "revoked";
  issuedAt: string;
  revokedAt: string | null;
  /** Percentage, assessment certificates only. */
  score: number | null;
  level: string | null;
  lessonCount: number | null;
  passMark: number | null;
}

export interface CertificateProgram {
  kind: CertificateKind;
  /** course id or assessment id */
  refId: string;
  title: string;
  level: string | null;
  description: string;
  requirement: string;
  /** Lessons completed / total (course). */
  done: number | null;
  total: number | null;
  /** Best percentage so far / pass mark (assessment). */
  bestScore: number | null;
  passMark: number | null;
  eligible: boolean;
  href: string;
  certificate: CertificateRecord | null;
}

export interface CertificateOverview {
  recipientName: string | null;
  programs: CertificateProgram[];
  earned: CertificateRecord[];
  /** The certificates table couldn't be read (e.g. migration not run). */
  unavailable: boolean;
}
