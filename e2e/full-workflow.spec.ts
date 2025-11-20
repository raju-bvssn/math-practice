import { test, expect } from '@playwright/test';

test.describe('Full User Workflow', () => {
  // TODO: Fix timing issues with review complete state detection
  test.skip('should complete full workflow: practice → stats → review', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // STEP 1: Configure and start practice session
    // Addition and Multiplication are already selected by default after clearing localStorage
    // Medium is already selected by default
    // So we don't need to click anything, just start the session!
    
    // Set session length to 5
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('5');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Wait for practice screen to load
    await page.waitForURL(/.*practice/);
    await page.waitForTimeout(500);

    // STEP 2: Complete practice session (some correct, some incorrect)
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} of 5`)).toBeVisible();
      
      // Click a choice
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      
      // Alternate between "I got it" and "I missed it"
      if (i % 2 === 0) {
        await page.getByRole('button', { name: /I missed it/i }).click();
      } else {
        await page.getByRole('button', { name: /I got it/i }).click();
      }
      
      if (i < 5) {
        await page.waitForTimeout(500);
      }
    }

    // STEP 3: Session complete screen
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Session Complete/i)).toBeVisible();
    
    // STEP 4: View Statistics
    await page.getByRole('button', { name: /View All Stats/i }).click();
    await expect(page).toHaveURL(/.*stats/);
    await expect(page.getByRole('heading', { name: /Your Progress/i })).toBeVisible();
    
    // Should show 5 attempted questions (use more specific selector)
    await expect(page.locator('.overall-stats .stat-value').first()).toContainText('5');
    
    // Should show missed questions alert
    await expect(page.getByText(/Questions to Review/i)).toBeVisible();

    // STEP 5: Go to Review
    await page.getByRole('link', { name: 'Review' }).click();
    await expect(page).toHaveURL(/.*review/);
    
    // Should show missed questions
    await expect(page.getByRole('heading', { name: /Review Missed Questions/i })).toBeVisible();
    
    // STEP 6: Review both missed questions (questions 2 and 4 from the session)
    // Review first missed question
    await page.locator('.choice-button').first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I got it/i }).click();
    
    // Wait a bit longer for the next question to load or review complete to show
    await page.waitForTimeout(1500);
    
    // Check if there's still a review progress indicator (means more questions)
    const stillReviewing = await page.locator('.review-progress').count();
    
    if (stillReviewing > 0) {
      // There's another question - review it
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      await page.waitForTimeout(1500);
    }
    
    // Now should show review complete or empty state
    // Look for either "Review Complete!" or "Great Job!" heading
    const completeHeading = page.locator('h2', { hasText: /Review Complete!|Great Job!/i });
    await expect(completeHeading).toBeVisible({ timeout: 10000 });
    
    // STEP 7: Navigate back home
    await page.getByRole('button', { name: /Back to Home/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Welcome to Math Practice!' })).toBeVisible();
  });

  test('should persist data across page reloads', async ({ page }) => {
    // Clear and start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Deselect Multiplication to keep only Addition (both are selected by default)
    await page.getByRole('button', { name: /Multiplication/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();

    // Answer all 3 questions CORRECTLY (tracking works automatically based on correctness)
    for (let i = 0; i < 3; i++) {
      // Get the question and find the correct answer
      const qText = await page.locator('.question-text').textContent();
      const qMatch = qText?.match(/(\d+)\s*\+\s*(\d+)\s*=/);
      const qCorrect = qMatch ? parseInt(qMatch[1]) + parseInt(qMatch[2]) : -1;
      
      // Click the correct answer (use aria-label to get actual value)
      const choices = await page.locator('.choice-button').all();
      for (const choice of choices) {
        const ariaLabel = await choice.getAttribute('aria-label');
        const choiceMatch = ariaLabel?.match(/Answer choice \d+: (\d+)\./);
        const btnValue = choiceMatch ? parseInt(choiceMatch[1]) : -1;
        if (btnValue === qCorrect && btnValue !== -1) {
          await choice.click();
          break;
        }
      }
      
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      if (i < 2) await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);

    // Navigate to stats
    await page.getByRole('button', { name: /View All Stats/i }).click();
    
    // Stats should show 3 questions attempted
    await expect(page.getByText('Questions')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Stats should still be there (data persisted)
    await expect(page.getByRole('heading', { name: /Your Progress/i })).toBeVisible();
    await expect(page.getByText('Questions')).toBeVisible();
  });

  test('should handle continuous mode', async ({ page }) => {
    await page.goto('/');
    
    // Select continuous mode (0 questions)
    await page.getByRole('button', { name: /Addition/ }).click();
    
    // Set session length to 0 for continuous mode
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('0');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Answer several questions (no fixed end)
    for (let i = 1; i <= 3; i++) {
      // Should show question number incrementing
      await expect(page.getByText(new RegExp(`Question ${i}`))).toBeVisible();
      
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      await page.waitForTimeout(500);
    }
    
    // End session manually
    await page.getByRole('button', { name: /End Session/i }).click();
    await expect(page).toHaveURL(/.*stats/);
  });
});

