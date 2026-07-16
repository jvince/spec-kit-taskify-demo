import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "**/.next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "**/test-results/**",
      "package-lock.json"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended
);
