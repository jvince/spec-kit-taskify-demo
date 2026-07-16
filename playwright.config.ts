import { defineConfig } from "@playwright/test";

/** Browser-test defaults for the local Next.js user-flow suite. */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3001" },
  webServer: {
    command: "npx next dev apps/web --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: false
  }
});
