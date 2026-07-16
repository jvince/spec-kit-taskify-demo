import { defineConfig } from "@playwright/test";

/** Browser-test defaults, kept intentionally empty until user-flow tests are introduced. */
export default defineConfig({ testDir: "./tests/e2e", timeout: 30_000 });
