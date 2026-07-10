import { defineConfig, devices } from "@playwright/test";

// E2E suite runs against the dev server (no basePath), exercising the same
// client-side store + flows the static export ships.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:3199",
    trace: "retain-on-failure",
    // Pre-unlock the preview passphrase gate for every test.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3199",
          localStorage: [{ name: "aw.preview.access", value: "true" }],
        },
      ],
    },
    // Use the environment's preinstalled Chromium when present (avoids a
    // browser download and version-mismatch with PLAYWRIGHT_BROWSERS_PATH).
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH || require("fs").existsSync("/opt/pw-browsers/chromium")
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" } }
      : {}),
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 3199",
    url: "http://localhost:3199",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
