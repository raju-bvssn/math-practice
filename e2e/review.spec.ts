import { test, expect } from '@playwright/test';

test.describe('Review Missed Questions', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show empty state when no missed questions', async ({ page }) => {
    // Navigate to review
    await page.getByRole('link', { name: 'Review' }).click();
    
    // Check empty state message
    await expect(page.getByRole('heading', { name: /Great Job!/i })).toBeVisible();
    await expect(page.getByText(/You don't have any missed questions/i)).toBeVisible();
    
    // Check action buttons
    await expect(page.getByRole('button', { name: /Start New Practice/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Home/i })).toBeVisible();
  });

  test('should show missed questions after marking some as incorrect', async ({ page }) => {
    // Start a practice session
    await page.goto('/');
    await page.getByRole('button', { name: /Addition/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Answer first question and mark as missed
    await page.locator('.choice-button').first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I missed it/i }).click();
    await page.waitForTimeout(500);
    
    // Answer remaining questions correctly
    for (let i = 0; i < 2; i++) {
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      
      if (i < 1) {
        await page.waitForTimeout(500);
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Navigate to review page
    await page.getByRole('link', { name: 'Review' }).click();
    
    // Should show the missed question
    await expect(page.getByRole('heading', { name: /Review Missed Questions/i })).toBeVisible();
    await expect(page.locator('.review-progress')).toContainText('Question 1 of 1');
  });

  test('should remove question from review after answering correctly', async ({ page }) => {
    // Create a missed question (same as above)
    await page.goto('/');
    await page.getByRole('button', { name: /Addition/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    await page.locator('.choice-button').first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I missed it/i }).click();
    await page.waitForTimeout(500);
    
    for (let i = 0; i < 2; i++) {
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      if (i < 1) await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
    
    // Go to review
    await page.getByRole('link', { name: 'Review' }).click();
    
    // Answer the missed question correctly
    await page.locator('.choice-button').first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I got it/i }).click();
    await page.waitForTimeout(1000);
    
    // Should show review complete or empty state
    const completeHeading = page.getByRole('heading', { name: /Review Complete|Great Job/i });
    await expect(completeHeading).toBeVisible();
  });
});

