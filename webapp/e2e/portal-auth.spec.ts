import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers";

test.describe("portal auth + permissions", () => {
  test("president sees every tab", async ({ page }) => {
    await signInAs(page, "u_pres");
    const nav = page.getByRole("navigation", { name: "Portal navigation" });
    for (const label of ["Dashboard", "Performance Management", "Lessons Management", "Contacts", "Members", "Webmaster", "Settings"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("member has a restricted sidebar and is blocked from officer tabs", async ({ page }) => {
    await signInAs(page, "u_mem");
    const nav = page.getByRole("navigation", { name: "Portal navigation" });
    await expect(nav.getByRole("link", { name: "Move Library" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Performance Management" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Contacts" })).toHaveCount(0);
    // Direct navigation is blocked too.
    await page.goto("/portal/performance-management");
    await expect(page.getByRole("heading", { name: /no access/i })).toBeVisible();
  });

  test("alumni only get the alumni directory", async ({ page }) => {
    await signInAs(page, "u_alum");
    const nav = page.getByRole("navigation", { name: "Portal navigation" });
    await expect(nav.getByRole("link", { name: "Alumni Directory" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Members" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Webmaster" })).toHaveCount(0);
  });

  test("magic-link flow signs in a known email", async ({ page }) => {
    await page.goto("/portal");
    await page.getByRole("button", { name: /sign in with magic link/i }).click();
    await page.getByLabel(/email on file/i).fill("elena.cruz@tamu.edu");
    await page.getByRole("button", { name: /email me a sign-in link/i }).click();
    await page.getByTestId("open-magic-link").click();
    await page.waitForURL("**/portal/dashboard**");
    await expect(page.getByRole("heading", { name: /welcome back, elena/i })).toBeVisible();
  });

  test("magic-link flow rejects an unknown email", async ({ page }) => {
    await page.goto("/portal");
    await page.getByRole("button", { name: /sign in with magic link/i }).click();
    await page.getByLabel(/email on file/i).fill("stranger@example.com");
    await page.getByRole("button", { name: /email me a sign-in link/i }).click();
    await expect(page.getByText(/no account with that email/i)).toBeVisible();
  });

  test("sign out returns to the sign-in screen", async ({ page }) => {
    await signInAs(page, "u_pres");
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL("**/portal**");
    await expect(page.getByRole("button", { name: /sign in with magic link/i })).toBeVisible();
  });

  test("permissions matrix edit takes effect immediately", async ({ page }) => {
    await signInAs(page, "u_pres");
    await page.goto("/portal/settings");
    // Revoke the Team Member status's Move Library access and confirm it takes effect.
    const select = page.locator('select[aria-label="Team Member access to Move Library"]');
    await select.selectOption("none");
    await page.getByTestId("save-permissions").click();
    // Sign in as member in the same browser (shared store) and verify tab disappeared.
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.getByTestId("demo-role-signin").click();
    await page.getByTestId("signin-u_mem").click();
    await page.waitForURL("**/portal/dashboard**");
    const nav = page.getByRole("navigation", { name: "Portal navigation" });
    await expect(nav.getByRole("link", { name: "Move Library" })).toHaveCount(0);
  });
});
