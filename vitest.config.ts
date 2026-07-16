import { defineConfig } from "vitest/config";

/** Shared test-runner defaults. Feature suites are added in later implementation phases. */
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node" }
});
