import { expect, test } from "@playwright/test";
import { ADMIN, login, uniq } from "./helpers";

test.describe.configure({ mode: "serial" });

test("1. login lands on the dashboard with KPIs", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Total doctors")).toBeVisible();
  await expect(page.getByText("Total patients")).toBeVisible();
  await expect(
    page
      .getByText(ADMIN.email.split("@")[0]!, { exact: false })
      .or(page.getByText("Admin"))
      .first(),
  ).toBeVisible();
});

test("wrong password shows an inline error (AC-AUTH-2)", async ({ page }) => {
  await page.goto("/login");
  await page.locator("input[name=email]").fill(ADMIN.email);
  await page.locator("input[name=password]").fill("WrongPassword!1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid email or password" }),
  ).toBeVisible();
  await expect(page.locator("input[name=password]")).toHaveValue("");
  await expect(page.locator("input[name=password]")).toBeFocused();
});

test("2. create a doctor, then find it by search", async ({ page }) => {
  const name = `Dr. Zephyr ${uniq("Q")}`;
  const email = `${uniq("zeph")}@example.com`;
  await login(page);
  await page.goto("/doctors");
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("input[name=name]").fill(name);
  await dialog.locator("input[name=specialization]").fill("Cardiology");
  await dialog.locator("input[name=hospital]").fill("Square Hospital");
  await dialog.locator("input[name=phone]").fill("+8801711223344");
  await dialog.locator("input[name=email]").fill(email);
  await dialog.getByRole("button", { name: "Add doctor" }).click();
  await expect(page.getByText("Doctor added")).toBeVisible();

  // duplicate email -> inline 409 error
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  const again = page.getByRole("dialog");
  await again.locator("input[name=name]").fill("Dr. Duplicate Person");
  await again.locator("input[name=specialization]").fill("Cardiology");
  await again.locator("input[name=hospital]").fill("Square Hospital");
  await again.locator("input[name=phone]").fill("+8801711223344");
  await again.locator("input[name=email]").fill(email);
  await again.getByRole("button", { name: "Add doctor" }).click();
  await expect(again.getByText("A doctor with this email already exists")).toBeVisible();
  await again.getByRole("button", { name: "Cancel" }).click();

  await page
    .getByRole("searchbox", { name: "Search doctors" })
    .fill(name.split(" ").slice(0, 3).join(" "));
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr").first()).toContainText(name);
});

test("3. open a doctor, add a patient, count updates, remove the patient", async ({ page }) => {
  const doctorName = `Dr. Pending ${uniq("P")}`;
  const patientName = `Testpatient ${uniq("T")}`;
  await login(page);
  await page.goto("/doctors");
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  const d = page.getByRole("dialog");
  await d.locator("input[name=name]").fill(doctorName);
  await d.locator("input[name=specialization]").fill("Neurology");
  await d.locator("input[name=hospital]").fill("United Hospital");
  await d.locator("input[name=phone]").fill("+8801799887766");
  await d.locator("input[name=email]").fill(`${uniq("p")}@example.com`);
  await d.getByRole("button", { name: "Add doctor" }).click();
  await expect(page.getByText("Doctor added")).toBeVisible();

  await page
    .getByRole("searchbox", { name: "Search doctors" })
    .fill(doctorName.split(" ").slice(0, 3).join(" "));
  await page.locator("tbody tr").first().click();
  await expect(page).toHaveURL(/\/doctors\/[a-f0-9]{24}/);
  await expect(page.getByRole("heading", { name: doctorName, level: 1 })).toBeVisible();
  await expect(page.getByText("No patients assigned to")).toBeVisible();

  await page.getByRole("button", { name: "Add patient" }).first().click();
  const sheet = page.getByRole("dialog");
  await sheet.locator("input[name=name]").fill(patientName);
  await sheet.locator("input[name=age]").fill("42");
  await sheet.getByRole("combobox", { name: /gender/i }).click();
  await page.getByRole("option", { name: "Female" }).click();
  await sheet.locator("input[name=phone]").fill("+8801811223344");
  await sheet.locator("input[name=diagnosis]").fill("Migraine");
  await sheet.getByText("Critical", { exact: true }).click();
  await sheet.getByRole("button", { name: "Add patient" }).click();
  await expect(page.getByText("Patient added")).toBeVisible();

  const row = page.locator("tbody tr", { hasText: patientName });
  await expect(row).toBeVisible();
  // stats card reflects the new patient
  await expect(
    page.locator("text=Total patients").locator("..").getByText("1", { exact: true }),
  ).toBeVisible();

  await row.getByRole("button", { name: `Actions for ${patientName}` }).click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Remove patient" }).click();
  await expect(page.locator("tbody tr", { hasText: patientName })).toHaveCount(0);
  await expect(page.getByText("No patients assigned to")).toBeVisible();
});

test("4. patients filters live in the URL and survive a reload", async ({ page }) => {
  await login(page);
  await page.goto("/patients");
  await page.getByRole("button", { name: /^Condition/ }).click();
  await page.getByRole("option", { name: "Critical" }).click();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/condition=critical/);
  await page.locator("[data-slot=popover-trigger]", { hasText: "Visit date" }).click();
  await page.getByRole("button", { name: "Last 30 days" }).click();
  await expect(page).toHaveURL(/from=\d{4}-\d{2}-\d{2}/);
  await expect(page).toHaveURL(/to=\d{4}-\d{2}-\d{2}/);
  const url = page.url();
  await expect(page.getByLabel("Active filters")).toContainText("Condition: Critical");

  await page.reload();
  await expect(page).toHaveURL(url);
  await expect(page.getByLabel("Active filters")).toContainText("Condition: Critical");
  const badges = page.locator("tbody tr").first().getByText("Critical");
  await expect(badges).toBeVisible();

  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).not.toHaveURL(/condition=/);
});

test("5. edit a patient and reassign the doctor", async ({ page }) => {
  await login(page);
  await page.goto("/patients");
  await page.locator("tbody tr").first().waitFor();
  const row = page.locator("tbody tr").first();
  const name = (await row.locator("p").first().innerText()).trim();
  await row.getByRole("button", { name: /^Actions for/ }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  const sheet = page.getByRole("dialog");
  const picker = sheet.getByRole("combobox", { name: /doctor/i });
  const currentDoctor = (await picker.innerText()).trim();
  await picker.click();
  // pick any doctor other than the current one so the form is really dirty
  const target = page.getByRole("option").filter({ hasNotText: currentDoctor }).first();
  await target.waitFor();
  const targetName = (await target.locator("span").first().innerText()).trim();
  await target.click();
  await expect(picker).toContainText(targetName);
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Patient updated")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search patients" }).fill(name);
  await expect(page.locator("tbody tr", { hasText: name }).first()).toContainText(targetName);
});

test("6. logout redirects protected routes to login", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/patients");
  await expect(page).toHaveURL(/\/login\?next=%2Fpatients/);
});

test("deleting the session cookie redirects to /login?next= and reload keeps you signed in otherwise", async ({
  page,
  context,
}) => {
  await login(page, "/patients");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Patients" })).toBeVisible(); // session restored via refresh cookie
  await context.clearCookies();
  await page.reload();
  await expect(page).toHaveURL(/\/login\?next=%2Fpatients/);
});
