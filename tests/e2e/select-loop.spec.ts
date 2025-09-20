import { test, expect } from '@playwright/test';

test.describe('Select Loop Prevention', () => {
  test('should not trigger infinite re-renders when using calendar filters', async ({ page }) => {
    // Navigate to calendar page
    await page.goto('/admin/availability');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Set up console error listener
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Set up page error listener
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // Test Select interactions that previously caused loops

    // 1. Test isRepeating Select
    const repeatSelect = page.getByRole('combobox').filter({ hasText: 'All Events' });
    if (await repeatSelect.isVisible()) {
      await repeatSelect.click();
      await page.getByRole('option', { name: 'Repeating Only' }).click();
      await page.waitForTimeout(500); // Wait for any potential loops to manifest

      // Change it back
      await repeatSelect.click();
      await page.getByRole('option', { name: 'All Events' }).click();
      await page.waitForTimeout(500);
    }

    // 2. Test color filter interactions
    const colorButton = page.getByRole('button', { name: /Colors/ });
    if (await colorButton.isVisible()) {
      await colorButton.click();
      await page.waitForTimeout(200);

      // Click a color checkbox
      const colorCheckbox = page.getByRole('checkbox').first();
      if (await colorCheckbox.isVisible()) {
        await colorCheckbox.click();
        await page.waitForTimeout(500);

        // Unclick it
        await colorCheckbox.click();
        await page.waitForTimeout(500);
      }

      // Close popover
      await page.keyboard.press('Escape');
    }

    // 3. Test category filter interactions
    const categoryButton = page.getByRole('button', { name: /Categories/ });
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(200);

      // Click a category checkbox
      const categoryCheckbox = page.getByRole('checkbox').first();
      if (await categoryCheckbox.isVisible()) {
        await categoryCheckbox.click();
        await page.waitForTimeout(500);

        // Unclick it
        await categoryCheckbox.click();
        await page.waitForTimeout(500);
      }

      // Close popover
      await page.keyboard.press('Escape');
    }

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(1000);

    // Assert no "Maximum update depth exceeded" errors
    const maxUpdateDepthErrors = consoleErrors.filter(error =>
      error.includes('Maximum update depth exceeded') ||
      error.includes('Too many re-renders')
    );

    const maxUpdatePageErrors = pageErrors.filter(error =>
      error.message.includes('Maximum update depth exceeded') ||
      error.message.includes('Too many re-renders')
    );

    expect(maxUpdateDepthErrors).toHaveLength(0);
    expect(maxUpdatePageErrors).toHaveLength(0);

    // Log any other errors for debugging (but don't fail the test)
    if (consoleErrors.length > 0) {
      console.log('Console errors detected (not related to infinite loops):', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log('Page errors detected (not related to infinite loops):', pageErrors.map(e => e.message));
    }
  });

  test('should handle rapid filter changes without loops', async ({ page }) => {
    await page.goto('/admin/availability');
    await page.waitForLoadState('networkidle');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' &&
          (msg.text().includes('Maximum update depth') ||
           msg.text().includes('Too many re-renders'))) {
        consoleErrors.push(msg.text());
      }
    });

    // Rapidly change Select values
    const repeatSelect = page.getByRole('combobox').filter({ hasText: /All Events|Repeating|Single/ });
    if (await repeatSelect.isVisible()) {
      // Rapid fire changes
      for (let i = 0; i < 5; i++) {
        await repeatSelect.click();
        await page.getByRole('option', { name: 'Repeating Only' }).click();
        await page.waitForTimeout(50);

        await repeatSelect.click();
        await page.getByRole('option', { name: 'All Events' }).click();
        await page.waitForTimeout(50);
      }
    }

    // Wait for any potential issues to manifest
    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });
});
