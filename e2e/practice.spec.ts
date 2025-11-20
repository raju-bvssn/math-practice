import { test, expect } from '@playwright/test';

test.describe('Practice Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and start a practice session
    await page.goto('/');
    
    // Ensure only Addition is selected (deselect multiplication which is selected by default)
    await page.getByRole('button', { name: /Multiplication/ }).click();
    // Addition is already selected by default, so we're good
    
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Set session length to 5
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('5');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Wait for practice screen to load
    await expect(page.getByText('Question 1 of 5')).toBeVisible();
  });

  test('should display question with 4 choices', async ({ page }) => {
    // Check question progress
    await expect(page.getByText('Question 1 of 5')).toBeVisible();
    
    // Check operation badge (using specific selector)
    await expect(page.locator('.operation-badge')).toBeVisible();
    await expect(page.locator('.operation-text')).toContainText('addition');
    
    // Check difficulty badge (using specific selector)
    await expect(page.locator('.difficulty-badge')).toBeVisible();
    await expect(page.locator('.difficulty-badge')).toContainText('easy');
    
    // Check question text contains numbers and operator
    const questionText = page.locator('.question-text');
    await expect(questionText).toBeVisible();
    await expect(questionText).toContainText('+');
    await expect(questionText).toContainText('?');
    
    // Check 4 choice buttons exist
    const choices = page.locator('.choice-button');
    await expect(choices).toHaveCount(4);
  });

  test('should flip card when answer is selected', async ({ page }) => {
    // Click a choice
    const firstChoice = page.locator('.choice-button').first();
    await firstChoice.click();
    
    // Wait for card flip animation
    await page.waitForTimeout(700);
    
    // Check that result is shown (either correct or incorrect icon)
    const cardBack = page.locator('.card-back');
    await expect(cardBack).toBeVisible();
    
    // Check for result buttons
    await expect(page.getByRole('button', { name: /I got it/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /I missed it/i })).toBeVisible();
  });

  test('should progress to next question after marking answer', async ({ page }) => {
    // Answer first question
    await page.locator('.choice-button').first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I got it/i }).click();
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    // Check question 2 is displayed
    await expect(page.getByText('Question 2 of 5')).toBeVisible();
  });

  test('should track session progress', async ({ page }) => {
    // Get the question text and calculate correct answer
    const questionText = await page.locator('.question-text').textContent();
    const match = questionText?.match(/(\d+)\s*\+\s*(\d+)\s*=/);
    const correctAnswer = match ? parseInt(match[1]) + parseInt(match[2]) : -1;
    
    // Find and click the CORRECT answer (use aria-label to get actual value)
    const allChoices = await page.locator('.choice-button').all();
    for (const choice of allChoices) {
      const ariaLabel = await choice.getAttribute('aria-label');
      const choiceMatch = ariaLabel?.match(/Answer choice \d+: (\d+)\./);
      const choiceValue = choiceMatch ? parseInt(choiceMatch[1]) : -1;
      if (choiceValue === correctAnswer && choiceValue !== -1) {
        await choice.click();
        break;
      }
    }
    
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I got it/i }).click();
    await page.waitForTimeout(500);
    
    // Check session progress is updated
    await expect(page.getByText(/Session Progress: 1\/1 correct/)).toBeVisible();
  });

  test('should complete session after answering all questions', async ({ page }) => {
    // Answer all 5 questions
    for (let i = 1; i <= 5; i++) {
      await page.locator('.choice-button').first().click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: /I got it/i }).click();
      
      if (i < 5) {
        await page.waitForTimeout(500);
      }
    }
    
    // Wait for session complete screen
    await page.waitForTimeout(1000);
    
    // Check session complete message
    await expect(page.getByRole('heading', { name: /Session Complete/i })).toBeVisible();
    await expect(page.getByText('Questions')).toBeVisible();
    await expect(page.getByText('Correct')).toBeVisible();
    
    // Check action buttons
    await expect(page.getByRole('button', { name: /View All Stats/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start New Session/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Home/i })).toBeVisible();
  });

  test('should allow ending session early', async ({ page }) => {
    // Click End Session button
    await page.getByRole('button', { name: /End Session/i }).click();
    
    // Should navigate to stats page
    await expect(page).toHaveURL(/.*stats/);
  });
});

