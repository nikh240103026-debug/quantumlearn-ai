/**
 * Single source of truth for brand, contact and legal details shown
 * across the marketing site, footer and policy pages.
 *
 * Before launch, confirm every value here is real: the mailboxes must
 * exist and be monitored, and the legal entity / jurisdiction must
 * match how the business is actually registered.
 */
export const site = {
  name: "QuantumLearn AI",
  shortName: "QuantumLearn",
  tagline: "Learn quantum computing by building it.",
  description:
    "An AI-powered platform for learning quantum computing through structured lessons, a live circuit simulator, multi-SDK coding and an AI tutor.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://quantumlearnai.vercel.app",

  // Contact mailboxes
  supportEmail: "support@quantumlearn.ai",
  privacyEmail: "privacy@quantumlearn.ai",
  securityEmail: "security@quantumlearn.ai",

  // Legal
  legalName: "QuantumLearn AI",
  policiesUpdated: "November 22, 2026",
} as const;
