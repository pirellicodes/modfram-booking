import { test, expect } from "@playwright/test";

test.describe("Select Infinite Loop Prevention", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/calendar");
    await page.waitForLoadState("networkidle");
  });

  test("should not cause infinite re-renders when changing filters", async ({
    page,
  }) => {
    // Monitor console for React warnings about maximum update depth
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        msg.text().includes("Maximum update depth exceeded")
      ) {
        consoleErrors.push(msg.text());
      }
    });

    // Test categories filter
    await page.click('button:has-text("Categories")');
    await page.waitForSelector(
      '[data-testid="categories-popover"], .popover-content',
      { state: "visible" }
    );

    // Click the same option multiple times rapidly
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    if ((await firstCheckbox.count()) > 0) {
      for (let i = 0; i < 5; i++) {
        await firstCheckbox.click();
        await page.waitForTimeout(100);
      }
    }

    // Test colors filter
    await page.click('button:has-text("Colors")');
    await page.waitForSelector(
      '[data-testid="colors-popover"], .popover-content',
      { state: "visible" }
    );

    const colorCheckbox = page.locator('input[type="checkbox"]').first();
    if ((await colorCheckbox.count()) > 0) {
      for (let i = 0; i < 5; i++) {
        await colorCheckbox.click();
        await page.waitForTimeout(100);
      }
    }

    // Verify no infinite loop errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test("should handle rapid filter changes without crashing", async ({
    page,
  }) => {
    let crashed = false;
    page.on("crash", () => {
      crashed = true;
    });

    // Rapid filter changes
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Categories")');
      await page.waitForTimeout(50);

      const checkbox = page.locator('input[type="checkbox"]').first();
      if ((await checkbox.count()) > 0) {
        await checkbox.click();
      }

      // Click outside to close popover
      await page.click("body");
      await page.waitForTimeout(50);
    }

    expect(crashed).toBeFalsy();
  });

  test("should maintain filter state correctly during rapid changes", async ({
    page,
  }) => {
    // Open categories filter
    await page.click('button:has-text("Categories")');

    // Check first category if available
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    if ((await firstCheckbox.count()) > 0) {
      await firstCheckbox.check();

      // Verify badge shows count
      const badge = page.locator(
        'button:has-text("Categories") .badge, button:has-text("Categories") [class*="badge"]'
      );
      if ((await badge.count()) > 0) {
        await expect(badge).toContainText("1");
      }

      // Uncheck and verify badge disappears or shows 0
      await firstCheckbox.uncheck();
      await page.waitForTimeout(100);

      // Badge should either not exist or show different count
      const badgeAfter = page.locator(
        'button:has-text("Categories") .badge, button:has-text("Categories") [class*="badge"]'
      );
      if ((await badgeAfter.count()) > 0) {
        await expect(badgeAfter).not.toContainText("1");
      }
    }
  });
});
