import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // This repository contains a separate Python quantum API/engine and local
  // virtual environments. ESLint is intentionally scoped to the Next.js
  // application source via package.json ("eslint src"), and these paths are
  // ignored as an additional safety boundary.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".venv/**",
    "**/.venv/**",
    "venv/**",
    "**/venv/**",
    "quantum-api/**",
    "quantum-engine/**",
    "**/*.backup.*",
    "coverage/**",
    "dist/**",
    ".git/**",
    "tsconfig.tsbuildinfo",
  ]),

  // React 19's set-state-in-effect rule is intentionally disabled for this
  // application. Data-fetching effects and browser-initialization effects
  // legitimately update local UI state from asynchronous callbacks.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
