import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `How ${site.name} works toward being usable by everyone.`,
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="Trust center"
      title="Accessibility"
      sections={[
        { id: "goal", title: "Our goal" },
        { id: "limits", title: "Known limits" },
        { id: "help", title: "Get help" },
      ]}
      summary="We want everyone to be able to learn here. This page says plainly where we are."
    >
      <h2 id="goal">Our goal</h2>
      <p>
        We are working toward WCAG 2.2 level AA. We have not had an
        independent audit, so we do not claim to meet it yet.
      </p>

      <h2 id="limits">Known limits</h2>
      <ul>
        <li>The Quantum Lab circuit editor and Bloch sphere are visual and may be hard to use with a screen reader.</li>
        <li>Some text may have less contrast than the guideline asks for.</li>
        <li>Videos may rely on automatic captions.</li>
      </ul>

      <h2 id="help">Get help</h2>
      <p>
        If something stops you from learning, please{" "}
        <Link href="/contact">contact us</Link> and say which page it was. We
        will try to give you the content another way.
      </p>
    </LegalPage>
  );
}
