import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers";

// The marquee end-to-end path: a public visitor requests a performance;
// the officer polls the team; a member responds; the officer confirms;
// the performance lands on the calendar, roster, and stats.
test("performance request lifecycle: public form → poll → respond → confirm", async ({ page }) => {
  // 1. Public visitor submits the form.
  await page.goto("/performance-request");
  await page.locator('input[name="first_name"]').fill("Wanda");
  await page.locator('input[name="last_name"]').fill("Workflow");
  await page.locator('input[name="email"]').fill("wanda@example.com");
  await page.locator('input[name="phone"]').fill("555-0142");
  await page.locator('input[name="event_date"]').fill("2026-12-05");
  await page.locator('input[name="start_time"]').fill("20:00");
  await page.locator('input[name="end_time"]').fill("20:30");
  await page.locator('input[name="venue_name"]').fill("Lifecycle Ballroom");
  await page.locator('input[name="venue_address"]').fill("500 Workflow Way, Waco, TX");
  await page.locator('input[name="audience_size"]').fill("200");
  await page.locator('select[name="performance_type"]').selectOption("Fundraiser / gala");
  await page.getByRole("button", { name: /submit performance request/i }).click();
  await expect(page.getByText(/request received/i)).toBeVisible();

  // 2. Officer finds it in the inbox.
  await signInAs(page, "u_pres");
  await page.goto("/portal/performance-management");
  await expect(page.getByRole("cell", { name: /Lifecycle Ballroom|Wanda Workflow/ }).first()).toBeVisible();
  await page.getByRole("row", { name: /Wanda Workflow/ }).getByRole("link", { name: /view/i }).click();
  await expect(page.getByTestId("request-status")).toHaveText("New");

  // 3. Approve → poll.
  await page.getByTestId("approve-to-poll").click();
  await expect(page.getByTestId("request-status")).toHaveText("Ready to poll");
  await page.getByTestId("send-survey").click();
  await expect(page.getByTestId("request-status")).toHaveText("Polling");

  // 4. Member responds in Surveys (president is linked to member m_001).
  await page.goto("/portal/surveys");
  const item = page.getByTestId("survey-item").filter({ hasText: "Lifecycle Ballroom" });
  await item.getByTestId("respond-yes").click();
  await expect(item.getByText(/responded: yes/i)).toBeVisible();

  // 5. Officer closes polling and sees the response breakdown.
  await page.goto("/portal/performance-management");
  await page.getByRole("row", { name: /Wanda Workflow/ }).getByRole("link", { name: /view/i }).click();
  await page.getByTestId("close-polling").click();
  await expect(page.getByTestId("request-status")).toContainText("Polling closed");
  await expect(page.getByTestId("responses-card")).toContainText("Elena Cruz".split(" ")[0]);

  // 6. Confirm — creates the calendar event + roster.
  await page.getByTestId("confirm-performance").click();
  await expect(page.getByTestId("request-status")).toHaveText("Confirmed");
  await expect(page.getByTestId("roster-card")).toContainText("Elena");

  // 7. Shows up on the team calendar and stats rosters.
  await page.goto("/portal/team-calendar");
  await expect(page.getByText(/Fundraiser \/ gala · Workflow/)).toBeVisible();
  await page.goto("/portal/performance-stats");
  await expect(page.getByText("Lifecycle Ballroom")).toBeVisible();

  // 8. CRM: the requester now exists as a contact with an auto-reply thread.
  await page.goto("/portal/contacts");
  await page.locator('input[placeholder*="Search"]').fill("Wanda");
  await page.getByRole("link", { name: /Wanda Workflow/ }).click();
  await expect(page.getByText(/Performance request received — Lifecycle Ballroom/).first()).toBeVisible();
});

test("CMS edit shows up on the public homepage", async ({ page }) => {
  await signInAs(page, "u_pres");
  await page.goto("/portal/webmaster");
  await page.getByTestId("announcement-text").fill("E2E: Fall lessons open Aug 15!");
  // Enable the announcement (checkbox near the input).
  await page.getByLabel(/announcement active|show announcement/i).check();
  await page.getByTestId("save-homepage").click();
  await page.goto("/");
  await expect(page.getByTestId("announcement-banner")).toContainText("E2E: Fall lessons open Aug 15!");
});

test("lessons coordinator can create a public session that appears on the public page", async ({ page }) => {
  await signInAs(page, "u_less");
  await page.goto("/portal/lessons-management");
  await page.getByTestId("new-session").click();
  await page.getByLabel("Class name").fill("E2E Waltz Workshop");
  await page.getByLabel("Level").fill("All Levels");
  await page.getByLabel("Dates").fill("2026-10-11, 2026-10-18");
  await page.getByLabel("Visible on the public site").check();
  await page.getByRole("button", { name: "Create session" }).click();
  await expect(page.getByText("E2E Waltz Workshop")).toBeVisible();
  // And it's live on the public lessons page (same browser storage).
  await page.goto("/public-lessons");
  await expect(page.getByTestId("lesson-card").filter({ hasText: "E2E Waltz Workshop" })).toBeVisible();
});
