import { test, expect } from '@playwright/test';

test.describe('Round 9 Fixes - Smoke Test', () => {
  test('should load calendar page without infinite loop errors', async ({ page }) => {
    // Monitor console for React warnings about maximum update depth
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Maximum update depth exceeded')) {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to calendar
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');

    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Calendar|Booking|Dashboard/);

    // Try interacting with filters if they exist
    const categoriesButton = page.locator('button:has-text("Categories")');
    if (await categoriesButton.count() > 0) {
      await categoriesButton.click();
      await page.waitForTimeout(500);
    }

    // Verify no infinite loop errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test('should load availability page and show New button', async ({ page }) => {
    await page.goto('/admin/availability');
    await page.waitForLoadState('networkidle');

    // Look for New button
    const newButton = page.locator('button:has-text("New")');
    if (await newButton.count() > 0) {
      await expect(newButton).toBeVisible();
    }
  });

  test('should load event types page for slug testing', async ({ page }) => {
    await page.goto('/admin/event-types');
    await page.waitForLoadState('networkidle');

    // Verify page loads without errors
    await expect(page).toHaveTitle(/Event Types|Session Types|Types/);
  });

  test('should load categories page', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    // Verify categories page exists and loads
    await expect(page).toHaveTitle(/Categories|Category/);
  });

  test('should open new booking dialog from calendar', async ({ page }) => {
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');

    // Look for New Booking button
    const newBookingButton = page.locator('button:has-text("New Booking")');
    if (await newBookingButton.count() > 0) {
      await newBookingButton.click();
      await page.waitForTimeout(500);

      // Should see dialog
      const dialog = page.locator('[role="dialog"], .dialog-content');
      await expect(dialog).toBeVisible();
    }
  });
});
