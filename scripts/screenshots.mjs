// Captures README screenshots: `npm run screenshots` (client on :3000, API + seeded DB running).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = resolve(process.env.OUT_DIR ?? "../docs/screenshots");
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@doctortracker.dev";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@12345";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function session(viewport, scheme = "light") {
  const ctx = await browser.newContext({
    viewport,
    colorScheme: scheme,
    deviceScaleFactor: viewport.width < 600 ? 2 : 1,
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(900); // chart animations
}

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log("saved", name);
}

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.locator("input[name=email]").fill(EMAIL);
  await page.locator("input[name=password]").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

for (const [suffix, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  // login page (signed out)
  {
    const { ctx, page } = await session(viewport);
    await page.goto(`${BASE}/login`);
    await settle(page);
    await shoot(page, `login-${suffix}`);
    await ctx.close();
  }

  const { ctx, page } = await session(viewport);
  await login(page);
  await settle(page);
  await shoot(page, `dashboard-${suffix}`);

  await page.goto(`${BASE}/doctors`);
  await page.getByRole("searchbox").waitFor();
  await settle(page);
  await shoot(page, `doctors-${suffix}`);

  // doctor detail: open the busiest doctor from the dashboard chart data
  await page.goto(`${BASE}/doctors?sort=-patientCount`);
  await settle(page);
  const first = page
    .locator(suffix === "desktop" ? "tbody tr" : "ul[aria-label=Doctors] li a")
    .first();
  await first.click();
  await page.waitForURL(/\/doctors\/[a-f0-9]{24}/);
  await settle(page);
  await shoot(page, `doctor-detail-${suffix}`);

  await page.goto(`${BASE}/patients`);
  await page.getByRole("searchbox").waitFor();
  await settle(page);
  await shoot(page, `patients-${suffix}`);

  // patient form (create) on desktop and mobile
  await page
    .getByRole("button", { name: /add patient/i })
    .first()
    .click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(500);
  await shoot(page, `patient-form-${suffix}`);
  await ctx.close();
}

// dark mode dashboard
{
  const { ctx, page } = await session({ width: 1440, height: 900 }, "dark");
  await login(page);
  await settle(page);
  await shoot(page, "dashboard-dark-desktop");
  await ctx.close();
}

await browser.close();
