import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Flat config (ESLint 9). Mirrors the frontend config's philosophy so both
// packages lint consistently; the shared Prettier config at the repo root is the
// single source of truth for formatting, and `eslint-config-prettier` (applied
// last) disables every rule that would fight it.
export default [
  { ignores: ["node_modules/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Unused vars are errors, but allow deliberately-ignored args/vars prefixed with `_`.
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      // Console logging is intentional operational logging today (server startup, DB connect).
      // It is replaced by structured pino logging in Phase 2, at which point this rule is enabled.
      "no-console": "off",
    },
  },
  prettier,
];
