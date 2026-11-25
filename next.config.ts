import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

function origin(value: string | undefined): string[] {
  try {
    return value ? [new URL(value).origin] : [];
  } catch {
    return [];
  }
}

const supabase = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const services = [
  ...supabase,
  ...supabase.map((url) => url.replace(/^http/, "ws")),
  ...origin(process.env.NEXT_PUBLIC_QUANTUM_API_URL),
];

// Inline scripts stay allowed: Next.js uses them to start each page, and
// static pages can't carry a per-request nonce.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://va.vercel-scripts.com${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${services.join(" ")}${dev ? " ws: http://localhost:*" : ""}`,
  "media-src 'self' blob: https:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
