import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${site.name}.`,
};

const SECTIONS = [
  { id: "agreement", title: "Agreement" },
  { id: "accounts", title: "Your account" },
  { id: "use", title: "Acceptable use" },
  { id: "content", title: "Your content" },
  { id: "ai", title: "AI-generated content" },
  { id: "academic", title: "Assessments & integrity" },
  { id: "ip", title: "Our content" },
  { id: "availability", title: "Availability" },
  { id: "disclaimer", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "termination", title: "Termination" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated={site.policiesUpdated}
      sections={SECTIONS}
      summary="Plain-language rules for using QuantumLearn: be honest, be respectful, and use the platform to learn."
    >
      <h2 id="agreement">Agreement</h2>
      <p>
        These terms govern your access to and use of {site.name}. By creating
        an account or using the platform you agree to them and to our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
        please do not use the platform.
      </p>

      <h2 id="accounts">Your account</h2>
      <ul>
        <li>You must be at least 13 years old to create an account.</li>
        <li>Provide accurate information and keep your password confidential.</li>
        <li>You are responsible for activity on your account. Tell us promptly at <a href={`mailto:${site.securityEmail}`}>{site.securityEmail}</a> if you suspect unauthorised access.</li>
      </ul>

      <h2 id="use">Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Harass, abuse or impersonate others, or post unlawful, hateful or sexually explicit content.</li>
        <li>Attempt to access other users&apos; accounts or data, probe or bypass our security, or disrupt the service.</li>
        <li>Use the code-execution or simulation services for anything other than learning and experimentation — including crypto-mining, network scanning or attacking other systems.</li>
        <li>Scrape the platform or use automated means to access it in ways that place unreasonable load on it.</li>
        <li>Resell or redistribute the platform or its lessons without our written permission.</li>
      </ul>

      <h2 id="content">Your content</h2>
      <p>
        You keep ownership of the questions, answers, code and circuits you
        create. By posting content to community areas you grant us a
        non-exclusive, worldwide licence to host, display and distribute it
        within the platform. You are responsible for making sure you have the
        right to share what you post. We may remove content that breaks these
        terms.
      </p>

      <h2 id="ai">AI-generated content</h2>
      <p>
        The AI tutor, summaries and analysis features use machine-learning
        models and may produce incorrect or incomplete output. They are
        study aids, not authoritative sources. Verify important results
        and do not rely on AI output for decisions with real-world
        consequences.
      </p>

      <h2 id="academic">Assessments &amp; academic integrity</h2>
      <p>
        Practice sets and assessments exist to help you measure your own
        understanding. Do not attempt to extract answer keys, share
        assessment content, or misrepresent results. If you are using the
        platform as part of a course, follow your institution&apos;s rules on
        AI assistance.
      </p>

      <h2 id="ip">Our content</h2>
      <p>
        Lessons, curriculum, exercises, software and branding on the platform
        are owned by {site.legalName} or its licensors and are provided for
        your personal, non-commercial learning. Code generated for your own
        circuits is yours to use freely.
      </p>

      <h2 id="availability">Availability &amp; changes to the service</h2>
      <p>
        We work to keep the platform available and secure, but we may change,
        suspend or discontinue features, and the service may occasionally be
        unavailable for maintenance or reasons outside our control.
      </p>

      <h2 id="disclaimer">Disclaimers</h2>
      <p>
        The platform is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, without warranties of any kind, to the fullest
        extent permitted by law. Simulation results are mathematical models
        and may differ from behaviour on physical quantum hardware.
      </p>

      <h2 id="liability">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {site.legalName} will not be
        liable for indirect, incidental, special or consequential damages,
        or for loss of data or profits, arising from your use of the
        platform. Nothing in these terms limits liability that cannot be
        limited by law.
      </p>

      <h2 id="termination">Termination</h2>
      <p>
        You can stop using the platform and delete your account at any time
        from <Link href="/settings">Settings</Link>. We may suspend or close
        accounts that break these terms or put other users or the service at
        risk.
      </p>

      <h2 id="changes">Changes to these terms</h2>
      <p>
        We may update these terms from time to time. We will revise the date
        above and, for material changes, notify signed-in users. Continuing to
        use the platform after changes take effect means you accept them.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
