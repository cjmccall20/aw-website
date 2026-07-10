import { test, expect } from "@playwright/test";

test.describe("public site", () => {
  test("homepage renders hero, CTAs, lessons strip, sponsors", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/high flyin/i);
    await expect(page.getByRole("link", { name: /sign up for public lessons/i })).toBeVisible();
    await expect(page.getByText("Next public class")).toBeVisible();
    await expect(page.getByText("Proudly supported by")).toBeVisible();
  });

  test("nav reaches lessons page; pricing and partner info shown", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Lessons" }).click();
    await expect(page).toHaveURL(/public-lessons/);
    await expect(page.getByTestId("lesson-card").first()).toContainText("$60");
    await expect(page.getByRole("heading", { name: /need a partner/i })).toBeVisible();
  });

  test("footer links to a real privacy page and contact page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /how we handle your information/i })).toBeVisible();
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /get in touch/i })).toBeVisible();
  });

  test("notify-list signup succeeds and persists a subscriber", async ({ page }) => {
    await page.goto("/public-lessons");
    await page.getByLabel(/email/i).first().fill("e2e-notify@example.com");
    await page.getByRole("button", { name: /notify me/i }).click();
    await expect(page.getByText(/you're on the list/i)).toBeVisible();
  });

  test("performance request form submits and shows confirmation", async ({ page }) => {
    await page.goto("/performance-request");
    await page.locator('input[name="first_name"]').fill("Testy");
    await page.locator('input[name="last_name"]').fill("McTester");
    await page.locator('input[name="email"]').fill("testy@example.com");
    await page.locator('input[name="phone"]').fill("555-0100");
    await page.locator('input[name="event_date"]').fill("2026-11-14");
    await page.locator('input[name="start_time"]').fill("19:00");
    await page.locator('input[name="end_time"]').fill("19:30");
    await page.locator('input[name="venue_name"]').fill("E2E Test Hall");
    await page.locator('input[name="venue_address"]').fill("123 Test St, Austin, TX");
    await page.locator('input[name="audience_size"]').fill("150");
    await page.locator('select[name="performance_type"]').selectOption("Wedding reception");
    await page.getByRole("button", { name: /submit performance request/i }).click();
    await expect(page.getByText(/request received/i)).toBeVisible();
  });

  test("contact form submits", async ({ page }) => {
    await page.goto("/contact");
    await page.locator('input[name="first_name"]').fill("Curious");
    await page.locator('input[name="last_name"]').fill("Visitor");
    await page.locator('input[name="email"]').fill("visitor@example.com");
    await page.locator('input[name="subject"]').fill("Press question");
    await page.locator('textarea[name="message"]').fill("Do you have a media kit?");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/message sent/i)).toBeVisible();
  });

  test("legacy URLs redirect", async ({ page }) => {
    await page.goto("/our-building");
    await page.waitForURL(u => !u.pathname.includes("our-building"));
    await page.goto("/current-team");
    await page.waitForURL(/meet-the-team/);
  });
});
