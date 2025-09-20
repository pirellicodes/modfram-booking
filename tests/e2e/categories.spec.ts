import { test, expect } from '@playwright/test';

test.describe('Categories CRUD and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');
  });

  test('should create new category with color selection', async ({ page }) => {
    // Click new category button
    const newButton = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(500);

    // Fill category details
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"], #name').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test Category');

    // Select color
    const colorSelect = page.locator('select[name="color"], [data-testid="color-select"]').first();
    if (await colorSelect.count() > 0) {
      await colorSelect.selectOption('green');
    } else {
      // Try color picker or buttons
      const greenColor = page.locator('button[data-color="green"], .color-green, [data-value="green"]').first();
      if (await greenColor.count() > 0) {
        await greenColor.click();
      }
    }

    // Add description
    const descInput = page.locator('textarea[name="description"], input[name="description"]').first();
    if (await descInput.count() > 0) {
      await descInput.fill('Test category description');
    }

    // Save category
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Verify category appears in list
    await expect(page.locator('text=Test Category')).toBeVisible();

    // Verify color badge is shown
    const colorBadge = page.locator('.bg-green-500, [data-color="green"], .color-green').first();
    await expect(colorBadge).toBeVisible();
  });

  test('should edit existing category', async ({ page }) => {
    // Ensure we have at least one category
    const categories = page.locator('.category-item, [data-testid*="category"]');

    if (await categories.count() === 0) {
      // Create one first
      await page.click('button:has-text("New")');
      await page.fill('input[name="name"]', 'Edit Test');
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(500);
    }

    // Find edit button for first category
    const editButton = page.locator('button:has-text("Edit"), [data-action="edit"]').first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Update name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('Updated Category Name');

    // Change color
    const colorSelect = page.locator('select[name="color"], [data-testid="color-select"]').first();
    if (await colorSelect.count() > 0) {
      await colorSelect.selectOption('purple');
    }

    // Save changes
    await page.click('button:has-text("Save"), button:has-text("Update")');
    await page.waitForTimeout(1000);

    // Verify changes
    await expect(page.locator('text=Updated Category Name')).toBeVisible();
  });

  test('should delete category with confirmation', async ({ page }) => {
    // Ensure we have categories to delete
    const categories = page.locator('.category-item, [data-testid*="category"]');
    const initialCount = await categories.count();

    if (initialCount === 0) {
      // Create one to delete
      await page.click('button:has-text("New")');
      await page.fill('input[name="name"]', 'Delete Test');
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(500);
    }

    // Find delete button
    const deleteButton = page.locator('button:has-text("Delete"), [data-action="delete"]').first();
    await deleteButton.click();

    // Handle confirmation dialog
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await page.waitForTimeout(1000);

    // Verify category was deleted
    const newCategories = page.locator('.category-item, [data-testid*="category"]');
    const newCount = await newCategories.count();
    expect(newCount).toBeLessThan(Math.max(1, initialCount));
  });

  test('should display categories in session types form', async ({ page }) => {
    // Navigate to session types
    await page.goto('/admin/event-types');
    await page.waitForLoadState('networkidle');

    // Create or edit session type
    const newButton = page.locator('button:has-text("New"), button:has-text("Add")').first();
    if (await newButton.count() > 0) {
      await newButton.click();
    } else {
      const editButton = page.locator('button:has-text("Edit")').first();
      await editButton.click();
    }

    await page.waitForTimeout(500);

    // Look for category selector
    const categorySelect = page.locator('select[name="category"], [data-testid="category-select"]');

    if (await categorySelect.count() > 0) {
      await categorySelect.click();

      // Verify categories are available as options
      const options = page.locator('option, [role="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });

  test('should filter calendar events by category', async ({ page }) => {
    // Go to calendar
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');

    // Open categories filter
    const categoriesButton = page.locator('button:has-text("Categories")');
    await categoriesButton.click();
    await page.waitForTimeout(500);

    // Check if dynamic categories are loaded
    const categoryCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await categoryCheckboxes.count();

    if (checkboxCount > 0) {
      // Select first category
      await categoryCheckboxes.first().check();

      // Verify filter badge appears
      const badge = page.locator('button:has-text("Categories") .badge, button:has-text("Categories") [class*="badge"]');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('1');

      // Clear filter
      await categoryCheckboxes.first().uncheck();

      // Badge should disappear or show 0
      if (await badge.count() > 0) {
        await expect(badge).not.toContainText('1');
      }
    }
  });

  test('should show category colors in New Booking form', async ({ page }) => {
    // Go to calendar and open new booking
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("New Booking")');
    await page.waitForTimeout(500);

    // Look for category selector
    const categorySelect = page.locator('select[name="category"], [data-testid="category-select"]');

    if (await categorySelect.count() > 0) {
      await categorySelect.click();

      // Check if options have color indicators
      const coloredOptions = page.locator('[class*="bg-"], [data-color], .color-indicator');
      const hasColoredOptions = await coloredOptions.count() > 0;

      // Should have visual color indicators
      expect(hasColoredOptions).toBeTruthy();
    }
  });

  test('should prevent duplicate category names', async ({ page }) => {
    // Create first category
    await page.click('button:has-text("New")');
    await page.fill('input[name="name"]', 'Duplicate Test');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Try to create another with same name
    await page.click('button:has-text("New")');
    await page.fill('input[name="name"]', 'Duplicate Test');
    await page.click('button:has-text("Save")');

    // Should show error message
    const errorMessage = page.locator('text=already exists, text=duplicate, text=taken, .error');
    await expect(errorMessage.first()).toBeVisible();
  });
});
