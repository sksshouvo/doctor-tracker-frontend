import { expect, type Page } from "@playwright/test";

export const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@doctortracker.dev",
  password: process.env.ADMIN_PASSWORD ?? "Admin@12345",
};

export async function login(page: Page, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.locator("input[name=email]").fill(ADMIN.email);
  await page.locator("input[name=password]").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(next ?? /\/dashboard/);
}

export const uniq = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
