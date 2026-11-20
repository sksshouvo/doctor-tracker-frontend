import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: [["list"]],
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Expects the seeded API (`npm run seed` + `npm run dev` in ../server). Reuses servers that are already running.
  webServer: [
    { command: "npm run dev --prefix ../server", url: "http://localhost:5001/api/v1/health", reuseExistingServer: true, timeout: 60_000 },
    { command: "npm run dev", url: "http://localhost:3000/login", reuseExistingServer: true, timeout: 60_000 },
  ],
});
