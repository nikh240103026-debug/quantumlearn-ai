import Link from "next/link";
import {
//   Github,
//   Linkedin,
//   Twitter,
  Mail,
  Atom,
} from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Quantum Lab", href: "/quantum-lab" },
    { label: "AI Tutor", href: "#ai-tutor" },
    { label: "Learning Roadmap", href: "#roadmap" },
    { label: "Progress", href: "/progress" },
  ],
  Resources: [
    { label: "Research Papers", href: "#resources" },
    { label: "Tutorials", href: "#resources" },
    { label: "Qiskit", href: "#resources" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main footer */}
        <div className="grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-16">

          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Atom size={19} strokeWidth={1.7} />
              </span>

              <span className="text-lg font-bold tracking-tight text-slate-950">
                QuantumLearn
              </span>
            </Link>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              An AI-powered learning platform designed to make
              quantum computing easier to understand, experiment
              with, and build.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-2">
              {/* <SocialLink
                href="#"
                label="GitHub"
                icon={Github}
              />

              <SocialLink
                href="#"
                label="LinkedIn"
                icon={Linkedin}
              />

              <SocialLink
                href="#"
                label="Twitter"
                icon={Twitter}
              /> */}

              <SocialLink
                href="#"
                label="Email"
                icon={Mail}
              />
            </div>
          </div>

          {/* Links */}
          <FooterColumn
            title="Platform"
            links={footerLinks.Platform}
          />

          <FooterColumn
            title="Resources"
            links={footerLinks.Resources}
          />

          <FooterColumn
            title="Company"
            links={footerLinks.Company}
          />
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} QuantumLearn. All rights reserved.
          </p>

          <p className="text-xs text-slate-400">
            Learn. Experiment. Understand.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        {title}
      </h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-slate-500 transition-colors hover:text-slate-950"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
    >
      <Icon size={16} />
    </Link>
  );
}