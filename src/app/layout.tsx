import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { PageLoadingBar } from "@/components/layout/PageLoadingBar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { CookieNotice } from "@/components/layout/CookieNotice";
import FloatingAITutor from "@/components/ai/FloatingAITutor";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Printed-paper serif for exam and practice question stems.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "quantum computing",
    "learn quantum computing",
    "quantum circuit simulator",
    "Qiskit",
    "PennyLane",
    "Cirq",
    "AI tutor",
    "qubits",
    "quantum algorithms",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
    images: [{ url: "/images/quantumlearn-logo.png", alt: site.name }],
  },
  twitter: {
    card: "summary",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/images/quantumlearn-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/quantumlearn-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        id="top"
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
        >
          Skip to content
        </a>

        <PageLoadingBar />

        <Navbar />

        <div id="main-content">{children}</div>

        <CommandPalette />
        <CookieNotice />
        <FloatingAITutor />
      </body>
    </html>
  );
}
