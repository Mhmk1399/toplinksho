import { defineConfig } from "@playwright/test";
import { randomBytes, scryptSync } from "node:crypto";

process.env.TOPLINKSHO_E2E_PASSWORD ||= randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(process.env.TOPLINKSHO_E2E_PASSWORD, salt, 64).toString("hex")}`;
const baseURL = "http://127.0.0.1:3196";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["json", { outputFile: "artifacts/browser-results.json" }]],
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", viewport: { width: 1440, height: 1000 }, locale: "fa-IR", timezoneId: "Asia/Tehran", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: baseURL,
    timeout: 120000,
    reuseExistingServer: false,
    env: { APP_URL: baseURL, ADMIN_EMAIL: "admin@toplinksho.invalid", ADMIN_PASSWORD_HASH: hash, SITE_INDEXABLE: "false", TRUST_PROXY: "true", SMTP_HOST: "", SMTP_USER: "", SMTP_PASS: "", SMTP_FROM: "", LEADS_EMAIL: "" },
  },
});
