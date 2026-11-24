import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your information.`,
};

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "collect", title: "Information we collect" },
  { id: "use", title: "How we use it" },
  { id: "ai", title: "AI features" },
  { id: "sharing", title: "Service providers" },
  { id: "visibility", title: "What others can see" },
  { id: "cookies", title: "Cookies & local storage" },
  { id: "retention", title: "Retention & deletion" },
  { id: "rights", title: "Your rights" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated={site.policiesUpdated}
      sections={SECTIONS}
      summary={
        <>
          The short version: we collect what we need to run your learning
          account, we never sell your data, and you can delete your account
          yourself at any time.
        </>
      }
    >
      <h2 id="overview">Overview</h2>
      <p>
        This policy explains what information {site.name} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects when you use our website and learning
        platform, why we collect it, and the choices you have. By using the
        platform you agree to the practices described here.
      </p>

      <h2 id="collect">Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li><strong>Account details</strong> — your name, email address, username and password (stored as a secure hash by our authentication provider).</li>
        <li><strong>Profile details</strong> — optional information such as bio, institute, branch, learning level and prior quantum experience.</li>
        <li><strong>Content you create</strong> — community questions and answers, feedback, reports, saved circuits and code you write.</li>
        <li><strong>AI tutor conversations</strong> — the messages you send to the AI tutor and its replies, so you can return to them later.</li>
      </ul>
      <h3>Information generated as you learn</h3>
      <ul>
        <li>Lesson progress, practice results, assessment attempts and scores.</li>
        <li>Quantum Lab and coding activity, such as circuits you run and execution history.</li>
        <li>Notification and preference settings.</li>
      </ul>
      <h3>Technical information</h3>
      <p>
        Like most websites, our hosting providers automatically process
        technical data such as IP address, browser type and request logs to
        deliver pages, prevent abuse and diagnose errors.
      </p>

      <h2 id="use">How we use it</h2>
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To save your progress and personalise recommendations, your roadmap and your dashboard.</li>
        <li>To grade practice and assessments, and to power AI explanations.</li>
        <li>To send service messages such as email verification and password reset links.</li>
        <li>To moderate community content, respond to feedback and keep the platform safe.</li>
        <li>To understand and improve how the platform performs.</li>
      </ul>
      <p>
        <strong>We do not sell your personal information, and we do not use it
        for third-party advertising.</strong>
      </p>

      <h2 id="ai">AI features</h2>
      <p>
        When you use the AI tutor, lesson summaries or AI code analysis, the
        text you submit — together with the relevant lesson or circuit
        context — is sent to our AI provider (Google&apos;s Gemini API) to
        generate a response. Please don&apos;t include sensitive personal
        information in prompts. AI responses can be inaccurate; verify
        important results.
      </p>

      <h2 id="sharing">Service providers</h2>
      <p>We share data only with providers that help us run the platform, under their own privacy and security terms:</p>
      <ul>
        <li><strong>Supabase</strong> — authentication and database hosting.</li>
        <li><strong>Vercel</strong> — website hosting and delivery.</li>
        <li><strong>Render</strong> — hosting for our quantum code-execution service.</li>
        <li><strong>YouTube (Google)</strong> — hosts the introduction video on our home page, embedded in privacy-enhanced mode. Your browser connects to YouTube when that page loads.</li>
        <li><strong>Google (Gemini API)</strong> — AI tutor and AI analysis features.</li>
        <li><strong>qBraid</strong> — only when you choose the qBraid simulator backend; your circuit is sent for execution.</li>
      </ul>
      <p>
        We may also disclose information if required by law or to protect
        the rights, safety and security of our users and platform.
      </p>

      <h2 id="visibility">What other learners can see</h2>
      <p>
        Your profile is <strong>private by default</strong>. On community
        posts, other learners see your name, username, avatar and role.
        Bio, institute, branch and learning level are only shown if you set
        your profile to public in{" "}
        <Link href="/settings">Settings → Privacy</Link>.
      </p>

      <h2 id="cookies">Cookies &amp; local storage</h2>
      <p>
        We use <strong>strictly necessary cookies</strong> to keep you signed
        in securely. We also use your browser&apos;s local storage to remember
        things like coding drafts, editor preferences and whether you have
        dismissed this notice. We do not use advertising or cross-site
        tracking cookies. Because these cookies are essential to the service,
        they cannot be switched off without signing out; you can clear them
        at any time in your browser settings.
      </p>

      <h2 id="retention">Retention &amp; deletion</h2>
      <p>
        We keep your information while your account is active. You can
        delete your account at any time from{" "}
        <Link href="/settings">Settings → Delete Account</Link>; this removes
        your login immediately. Associated personal data is deleted or
        anonymised, except where we must keep limited records for legal,
        security or abuse-prevention reasons. Content you posted publicly in
        the community may remain in anonymised form so discussions stay
        readable.
      </p>

      <h2 id="rights">Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access,
        correct, export or delete your personal data, to object to or
        restrict certain processing, and to withdraw consent. You can update
        most information yourself in Settings. For anything else, email{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> and we
        will respond within 30 days. You also have the right to lodge a
        complaint with your local data protection authority.
      </p>

      <h2 id="children">Children</h2>
      <p>
        The platform is intended for learners aged 13 and over. If you
        believe a child under 13 has created an account, contact us and we
        will remove it.
      </p>

      <h2 id="changes">Changes to this policy</h2>
      <p>
        We will update this page when our practices change and revise the
        &ldquo;last updated&rdquo; date above. For significant changes we will
        notify signed-in users in the app.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> or use
        our <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
