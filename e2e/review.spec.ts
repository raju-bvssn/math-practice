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
    
    // Deselect Multiplication to keep only Addition (both are selected by default)
    await page.getByRole('button', { name: /Multiplication/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Get the question text and calculate correct answer
    const questionText = await page.locator('.question-text').textContent();
    const match = questionText?.match(/(\d+)\s*\+\s*(\d+)\s*=/);
    const correctAnswer = match ? parseInt(match[1]) + parseInt(match[2]) : -1;
    
    // Select a WRONG answer (not the correct one)
    // Button text includes key hint (e.g., "1 43"), so use aria-label to get actual value
    const allChoices = await page.locator('.choice-button').all();
    for (const choice of allChoices) {
      const ariaLabel = await choice.getAttribute('aria-label');
      // aria-label format: "Answer choice 1: 43. Press 1 on keyboard to select."
      const choiceMatch = ariaLabel?.match(/Answer choice \d+: (\d+)\./);
      const choiceValue = choiceMatch ? parseInt(choiceMatch[1]) : -1;
      if (choiceValue !== correctAnswer && choiceValue !== -1) {
        await choice.click();
        break;
      }
    }
    
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I missed it/i }).click();
    await page.waitForTimeout(500);
    
    // Answer remaining 2 questions CORRECTLY
    for (let i = 0; i < 2; i++) {
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
    
    // Deselect Multiplication to keep only Addition (both are selected by default)
    await page.getByRole('button', { name: /Multiplication/ }).click();
    
    // Set session length to 3
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    await sessionInput.fill('3');
    
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Get the question text and calculate correct answer
    const questionText = await page.locator('.question-text').textContent();
    const match = questionText?.match(/(\d+)\s*\+\s*(\d+)\s*=/);
    const correctAnswer = match ? parseInt(match[1]) + parseInt(match[2]) : -1;
    
    // Select a WRONG answer (not the correct one)
    // Button text includes key hint, so use aria-label to get actual value
    const allChoices = await page.locator('.choice-button').all();
    for (const choice of allChoices) {
      const ariaLabel = await choice.getAttribute('aria-label');
      const choiceMatch = ariaLabel?.match(/Answer choice \d+: (\d+)\./);
      const choiceValue = choiceMatch ? parseInt(choiceMatch[1]) : -1;
      if (choiceValue !== correctAnswer && choiceValue !== -1) {
        await choice.click();
        break;
      }
    }
    
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I missed it/i }).click();
    await page.waitForTimeout(500);
    
    // Answer remaining 2 questions CORRECTLY
    for (let i = 0; i < 2; i++) {
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
      if (i < 1) await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(1000);
    
    // Go to review
    await page.getByRole('link', { name: 'Review' }).click();
    
    // Answer the missed question CORRECTLY this time
    const reviewQuestionText = await page.locator('.question-text').textContent();
    const reviewMatch = reviewQuestionText?.match(/(\d+)\s*\+\s*(\d+)\s*=/);
    const reviewCorrectAnswer = reviewMatch ? parseInt(reviewMatch[1]) + parseInt(reviewMatch[2]) : -1;
    
    // Find and click the CORRECT answer (use aria-label to get actual value)
    const reviewChoices = await page.locator('.choice-button').all();
    for (const choice of reviewChoices) {
      const ariaLabel = await choice.getAttribute('aria-label');
      const choiceMatch = ariaLabel?.match(/Answer choice \d+: (\d+)\./);
      const choiceValue = choiceMatch ? parseInt(choiceMatch[1]) : -1;
      if (choiceValue === reviewCorrectAnswer && choiceValue !== -1) {
        await choice.click();
        break;
      }
    }
    
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /I got it/i }).click();
    await page.waitForTimeout(1000);
    
    // Should show review complete or empty state
    const completeHeading = page.getByRole('heading', { name: /Review Complete|Great Job/i });
    await expect(completeHeading).toBeVisible();
  });
});

