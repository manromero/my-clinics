import { defineConfig, devices } from "@playwright/test";
import { appOrigin, verifyConfiguration } from "./e2e/hosted-activity/config";

// Validate before Playwright launches the server, browser, or tests.
verifyConfiguration();

export default defineConfig({
  testDir: "./e2e/hosted-activity",
  testMatch: "**/*.spec.ts",
  outputDir: "hosted-activity-results/internal",
  reporter: "./e2e/hosted-activity/reporter.ts",
  retries: 0,
  timeout: 90_000,
  forbidOnly: true,
  use: {
    baseURL: appOrigin,
    browserName: "chromium",
    channel: "chrome",
    trace: "off",
    video: "off",
    screenshot: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "pnpm start --hostname 127.0.0.1 --port 3205",
    url: `${appOrigin}/login`,
    reuseExistingServer: false,
    env: Object.fromEntries(
      ["DESKTOP", "MOBILE"].flatMap((project) =>
        ["EMAIL", "PASSWORD", "USER_ID", "CLINIC_ID"].map((setting) => [
          `ACTIVITY_${project}_${setting}`,
          "",
        ]),
      ),
    ),
    stdout: "ignore",
    stderr: "ignore",
  },
});
