import type { Page } from "@playwright/test";

/** Sign in via the demo role picker. userId is one of the seeded users (u_pres, u_mem, ...). */
export async function signInAs(page: Page, userId: string) {
  await page.goto("/portal");
  await page.getByTestId("demo-role-signin").click();
  await page.getByTestId(`signin-${userId}`).click();
  await page.waitForURL("**/portal/dashboard**");
}
