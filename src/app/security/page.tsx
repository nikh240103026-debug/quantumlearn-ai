import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security",
  description: `How ${site.name} protects your account and data, and how to report a vulnerability.`,
};

const SECTIONS = [
  { id: "approach", title: "Our approach" },
  { id: "accounts", title: "Account security" },
  { id: "data", title: "Data protection" },
  { id: "execution", title: "Code execution" },
  { id: "assessments", title: "Assessment integrity" },
  { id: "you", title: "Keeping your account safe" },
  { id: "disclosure", title: "Report a vulnerability" },
];

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Trust center"
      title="Security at QuantumLearn"
      sections={SECTIONS}
      summary="An overview of how we protect your account and learning data — and how to tell us if you find a problem."
    >
      <h2 id="approach">Our approach</h2>
      <p>
        We keep the attack surface small: secrets stay on the server, the
        browser only receives what it needs to render your experience, and
        sensitive operations are checked server-side on every request.
      </p>

      <h2 id="accounts">Account security</h2>
      <ul>
        <li>Authentication is handled by <strong>Supabase Auth</strong>. Passwords are never stored in plain text.</li>
        <li>New accounts verify their email address; password resets use single-use, time-limited links.</li>
        <li>Sessions use short-lived access tokens that refresh automatically, and are served only over HTTPS.</li>
        <li>Sensitive actions such as account deletion require explicit confirmation and are rate-limited.</li>
      </ul>

      <h2 id="data">Data protection</h2>
      <ul>
        <li>All traffic is encrypted in transit with HTTPS/TLS.</li>
        <li>Server routes verify who you are before reading or changing your data; administrative keys never leave the server.</li>
        <li>Profiles are private by default, and privacy settings are enforced on the server before profiles are shown to others.</li>
        <li>We work only with established infrastructure providers — see the <Link href="/privacy#sharing">list in our Privacy Policy</Link>.</li>
      </ul>

      <h2 id="execution">Code execution</h2>
      <p>
        Code you run in the coding workspace executes in a separate service,
        isolated from the web application and the database, and every run is
        time-limited. Circuits in the Quantum Lab are simulated locally in
        your browser by default.
      </p>

      <h2 id="assessments">Assessment integrity</h2>
      <p>
        Correct answers for practice and assessments are kept on the server
        and are never sent to the browser. Submissions are graded server-side,
        so scores cannot be manipulated from the client.
      </p>

      <h2 id="you">Keeping your account safe</h2>
      <ul>
        <li>Use a unique password you don&apos;t use on other sites.</li>
        <li>We will never ask for your password by email or chat.</li>
        <li>Sign out on shared devices, and review your details in <Link href="/settings">Settings → Security</Link>.</li>
      </ul>

      <h2 id="disclosure">Report a vulnerability</h2>
      <p>
        If you believe you have found a security issue, please email{" "}
        <a href={`mailto:${site.securityEmail}`}>{site.securityEmail}</a> with
        steps to reproduce. We will acknowledge your report, keep you
        updated, and credit you if you would like.
      </p>
      <p>
        Please act in good faith: avoid accessing other users&apos; data,
        degrading the service, or publicly disclosing the issue before we
        have had a reasonable chance to fix it.
      </p>
    </LegalPage>
  );
}
