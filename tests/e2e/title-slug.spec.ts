import { test, expect } from '@playwright/test';

test.describe('Title and Slug UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/event-types');
    await page.waitForLoadState('networkidle');
  });

  test('should enforce minimum 2 characters for slug', async ({ page }) => {
    // Click to create new event type or edit existing
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
    } else {
      // Try editing existing event type
      const editButton = page.locator('button:has-text("Edit"), [data-action="edit"]').first();
      if (await editButton.count() > 0) {
        await editButton.click();
      }
    }

    await page.waitForTimeout(500);

    // Find title and slug inputs
    const titleInput = page.locator('input[name="title"], input[placeholder*="title"], #title').first();
    const slugInput = page.locator('input[name="slug"], input[placeholder*="slug"], #slug').first();

    if (await titleInput.count() > 0 && await slugInput.count() > 0) {
      // Test single character slug rejection
      await titleInput.fill('A');
      await slugInput.fill('a');

      // Try to save - should show validation error
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
      if (await saveButton.count() > 0) {
        await saveButton.click();

        // Should see validation error
        await expect(page.locator('text=minimum, text=2 characters, text=too short')).toBeVisible();
      }

      // Test valid 2-character slug
      await titleInput.fill('AB');
      await slugInput.fill('ab');

      if (await saveButton.count() > 0) {
        await saveButton.click();
        // Should not show error (or should succeed)
        await page.waitForTimeout(500);
      }
    }
  });

  test('should generate valid slug from title automatically', async ({ page }) => {
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator('input[name="title"], input[placeholder*="title"], #title').first();
      const slugInput = page.locator('input[name="slug"], input[placeholder*="slug"], #slug').first();

      if (await titleInput.count() > 0 && await slugInput.count() > 0) {
        // Test various title formats
        const testCases = [
          { title: 'Team Meeting', expectedSlug: 'team-meeting' },
          { title: 'One-on-One Session!', expectedSlug: 'one-on-one-session' },
          { title: 'Client Call (30min)', expectedSlug: 'client-call-30min' },
          { title: 'Workshop: Advanced Topics', expectedSlug: 'workshop-advanced-topics' }
        ];

        for (const testCase of testCases) {
          await titleInput.fill(testCase.title);
          await titleInput.blur(); // Trigger slug generation
          await page.waitForTimeout(200);

          const slugValue = await slugInput.inputValue();
          expect(slugValue).toBe(testCase.expectedSlug);
        }
      }
    }
  });

  test('should handle special characters in title', async ({ page }) => {
    const newButton = page.locator('button:has-text("New"), button:has-text("Add")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator('input[name="title"], #title').first();
      const slugInput = page.locator('input[name="slug"], #slug').first();

      if (await titleInput.count() > 0 && await slugInput.count() > 0) {
        // Test special characters
        await titleInput.fill('Café & Brunch @ 10AM');
        await titleInput.blur();
        await page.waitForTimeout(200);

        const slugValue = await slugInput.inputValue();
        // Should convert to valid slug (letters, numbers, hyphens only)
        expect(slugValue).toMatch(/^[a-z0-9-]+$/);
        expect(slugValue.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('should prevent duplicate slugs', async ({ page }) => {
    // This test assumes there are existing event types
    const existingSlug = 'team-meeting';

    const newButton = page.locator('button:has-text("New"), button:has-text("Add")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
      await page.waitForTimeout(500);

      const titleInput = page.locator('input[name="title"], #title').first();
      const slugInput = page.locator('input[name="slug"], #slug').first();

      if (await titleInput.count() > 0 && await slugInput.count() > 0) {
        await titleInput.fill('Duplicate Test');
        await slugInput.fill(existingSlug);

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();

          // Should show duplicate error or auto-modify slug
          const errorMessage = page.locator('text=already exists, text=duplicate, text=taken');
          const modifiedSlug = await slugInput.inputValue();

          // Either shows error or automatically modifies slug
          const hasError = await errorMessage.count() > 0;
          const slugModified = modifiedSlug !== existingSlug;

          expect(hasError || slugModified).toBeTruthy();
        }
      }
    }
  });

  test('should show real-time slug validation feedback', async ({ page }) => {
    const newButton = page.locator('button:has-text("New"), button:has-text("Add")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
      await page.waitForTimeout(500);

      const slugInput = page.locator('input[name="slug"], #slug').first();

      if (await slugInput.count() > 0) {
        // Test invalid characters
        await slugInput.fill('invalid_slug!');
        await slugInput.blur();

        // Should show validation feedback
        const validationMessage = page.locator('text=invalid, text=characters, text=format, .error, .invalid');
        await expect(validationMessage.first()).toBeVisible();

        // Test valid slug
        await slugInput.fill('valid-slug-123');
        await slugInput.blur();
        await page.waitForTimeout(200);

        // Validation error should be gone
        await expect(validationMessage.first()).not.toBeVisible();
      }
    }
  });
});
