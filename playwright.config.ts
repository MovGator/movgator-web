import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" },
  // Uses the locally installed Chrome channel (no separate browser download).
  projects: [{ name: "chrome", use: { channel: "chrome" } }],
  webServer: undefined, // CI starts frontend + backend explicitly (see docs)
});
