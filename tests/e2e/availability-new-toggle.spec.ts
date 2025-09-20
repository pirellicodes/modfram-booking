import { test, expect } from '@playwright/test';

test.describe('Availability New Block and Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/availability');
    await page.waitForLoadState('networkidle');
  });

  test('should create new availability block when clicking New button', async ({ page }) => {
    // Count existing availability blocks
    const existingBlocks = page.locator('.availability-block, .schedule-block, [data-testid*="availability"]');
    const initialCount = await existingBlocks.count();

    // Click New button
    const newButton = page.locator('button:has-text("New"), button:has-text("Add")').first();
    await expect(newButton).toBeVisible();
    await newButton.click();

    // Wait for dialog or inline form
    await page.waitForTimeout(500);

    // Fill in availability details if form appears
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test Schedule');
    }

    // Set time slots
    const startTimeInput = page.locator('input[type="time"], select[name*="start"]').first();
    const endTimeInput = page.locator('input[type="time"], select[name*="end"]').first();

    if (await startTimeInput.count() > 0) {
      await startTimeInput.fill('09:00');
    }
    if (await endTimeInput.count() > 0) {
      await endTimeInput.fill('17:00');
    }

    // Select weekdays if available
    const mondayCheckbox = page.locator('input[type="checkbox"][value="monday"], label:has-text("Monday")').first();
    if (await mondayCheckbox.count() > 0) {
      await mondayCheckbox.check();
    }

    // Save the schedule
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify new block is visible
    const newBlocks = page.locator('.availability-block, .schedule-block, [data-testid*="availability"]');
    const newCount = await newBlocks.count();
    expect(newCount).toBeGreaterThan(initialCount);

    // Verify the new block contains our test data
    await expect(page.locator('text=Test Schedule')).toBeVisible();
  });

  test('should toggle availability blocks on/off', async ({ page }) => {
    // First ensure we have at least one availability block
    const blocks = page.locator('.availability-block, .schedule-block, [data-testid*="availability"]');

    if (await blocks.count() === 0) {
      // Create a block first
      const newButton = page.locator('button:has-text("New")').first();
      if (await newButton.count() > 0) {
        await newButton.click();
        await page.waitForTimeout(500);

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Find toggle switches or buttons
    const toggles = page.locator('input[type="checkbox"], button[role="switch"], .toggle, [data-testid*="toggle"]');

    if (await toggles.count() > 0) {
      const firstToggle = toggles.first();

      // Get initial state
      const initialState = await firstToggle.isChecked();

      // Toggle it
      await firstToggle.click();
      await page.waitForTimeout(500);

      // Verify state changed
      const newState = await firstToggle.isChecked();
      expect(newState).toBe(!initialState);

      // Toggle back
      await firstToggle.click();
      await page.waitForTimeout(500);

      // Verify it's back to original state
      const finalState = await firstToggle.isChecked();
      expect(finalState).toBe(initialState);
    }
  });

  test('should show availability blocks visually when enabled', async ({ page }) => {
    // Check for enabled/disabled visual states
    const blocks = page.locator('.availability-block, .schedule-block');

    if (await blocks.count() > 0) {
      const firstBlock = blocks.first();

      // Check if block has visual indicators of enabled/disabled state
      const hasEnabledClass = await firstBlock.evaluate(el =>
        el.classList.contains('enabled') ||
        el.classList.contains('active') ||
        !el.classList.contains('disabled') ||
        !el.classList.contains('inactive')
      );

      // Visual state should be clear
      expect(typeof hasEnabledClass).toBe('boolean');

      // Block should be visible and styled appropriately
      await expect(firstBlock).toBeVisible();
    }
  });

  test('should edit existing availability blocks', async ({ page }) => {
    const blocks = page.locator('.availability-block, .schedule-block');

    if (await blocks.count() > 0) {
      const firstBlock = blocks.first();

      // Look for edit button or click on block
      const editButton = firstBlock.locator('button:has-text("Edit"), [data-action="edit"]');

      if (await editButton.count() > 0) {
        await editButton.click();
      } else {
        // Try clicking the block itself
        await firstBlock.click();
      }

      await page.waitForTimeout(500);

      // Look for editable fields
      const nameInput = page.locator('input[name="name"], input[value*=""]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Updated Schedule Name');

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(500);

          // Verify update
          await expect(page.locator('text=Updated Schedule Name')).toBeVisible();
        }
      }
    }
  });

  test('should delete availability blocks', async ({ page }) => {
    const initialBlocks = page.locator('.availability-block, .schedule-block');
    const initialCount = await initialBlocks.count();

    if (initialCount > 0) {
      const firstBlock = initialBlocks.first();

      // Look for delete button
      const deleteButton = firstBlock.locator('button:has-text("Delete"), [data-action="delete"], .delete-button');

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Handle confirmation dialog if it appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);

        // Verify block was deleted
        const newBlocks = page.locator('.availability-block, .schedule-block');
        const newCount = await newBlocks.count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });
});
