import { test, expect } from '@playwright/test';

test.describe('Statistics Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display statistics page with initial state', async ({ page }) => {
    // Navigate to stats
    await page.getByRole('link', { name: 'Stats' }).click();
    
    // Check page title
    await expect(page.getByRole('heading', { name: /Your Progress/ })).toBeVisible();
    
    // Check overall stats section
    await expect(page.getByText('Overall Statistics')).toBeVisible();
    await expect(page.getByText('Questions')).toBeVisible();
    
    // Initial stats should be 0
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible();
  });

  test('should update statistics after completing a practice session', async ({ page }) => {
    // Start a practice session
    await page.goto('/');
    await page.getByRole('button', { name: /Addition/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Answer all 3 questions correctly
    for (let i = 0; i < 3; i++) {
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      
      if (i < 2) {
        await page.waitForTimeout(500);
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Go to stats
    await page.getByRole('button', { name: /View All Stats/i }).click();
    
    // Check that stats are updated (check for stat values, there will be multiple "3"s)
    await expect(page.locator('.stat-value').first()).toContainText('3');
  });

  test('should display per-operation statistics', async ({ page }) => {
    // Navigate to stats
    await page.getByRole('link', { name: 'Stats' }).click();
    
    // Check operation stats section
    await expect(page.getByRole('heading', { name: 'Performance by Operation' })).toBeVisible();
    
    // Should show all 4 operations (in the operations grid)
    await expect(page.locator('.operations-grid')).toBeVisible();
    
    // Check that operations are shown in the grid
    const operationsGrid = page.locator('.operations-grid');
    await expect(operationsGrid).toContainText('addition');
    await expect(operationsGrid).toContainText('subtraction');
    await expect(operationsGrid).toContainText('multiplication');
    await expect(operationsGrid).toContainText('division');
  });

  test('should show action buttons', async ({ page }) => {
    await page.getByRole('link', { name: 'Stats' }).click();
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: /Back to Home/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start New Session/i })).toBeVisible();
  });

  test('should navigate to home when Back to Home clicked', async ({ page }) => {
    await page.getByRole('link', { name: 'Stats' }).click();
    await page.getByRole('button', { name: /Back to Home/i }).click();
    
    await expect(page).toHaveURL('/');
  });
});

