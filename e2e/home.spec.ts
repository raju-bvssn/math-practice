import { test, expect } from '@playwright/test';

test.describe('Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home screen with all sections', async ({ page }) => {
    // Check welcome message
    await expect(page.getByRole('heading', { name: 'Welcome to Math Practice!' })).toBeVisible();
    
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Stats' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Review' })).toBeVisible();
    
    // Check sections
    await expect(page.getByText('Select Operations')).toBeVisible();
    await expect(page.getByText('Select Difficulty')).toBeVisible();
    await expect(page.getByText('Session Length')).toBeVisible();
  });

  test('should allow selecting operations', async ({ page }) => {
    // Note: Addition and Multiplication are selected by default
    // Click Subtraction to select it
    await page.getByRole('button', { name: /Subtraction/ }).click();
    
    // Verify it's selected (should have selected state)
    const subtractionButton = page.getByRole('button', { name: /Subtraction/ });
    await expect(subtractionButton).toHaveClass(/selected/);
    
    // Click it again to deselect
    await subtractionButton.click();
    await expect(subtractionButton).not.toHaveClass(/selected/);
  });

  test('should allow selecting difficulty', async ({ page }) => {
    // Click Medium difficulty
    await page.getByRole('button', { name: 'Medium' }).click();
    
    // Verify it's selected
    const mediumButton = page.getByRole('button', { name: 'Medium' });
    await expect(mediumButton).toHaveClass(/selected/);
  });

  test('should allow changing session length', async ({ page }) => {
    // Find the session length input
    const sessionInput = page.getByRole('spinbutton', { name: 'Session length' });
    
    // Clear and type new value
    await sessionInput.fill('10');
    
    // Verify the value
    await expect(sessionInput).toHaveValue('10');
  });

  test('should navigate to practice screen when Start Practice is clicked', async ({ page }) => {
    // Select an operation
    await page.getByRole('button', { name: /Addition/ }).click();
    
    // Click Start Practice
    await page.getByRole('button', { name: 'Start Practice' }).click();
    
    // Verify navigation to practice screen
    await expect(page).toHaveURL(/.*practice/);
    await expect(page.getByText(/Question 1 of/)).toBeVisible();
  });

  test('should show alert when starting practice without selecting an operation', async ({ page }) => {
    // First, deselect all default operations (addition and multiplication)
    await page.getByRole('button', { name: /Addition/ }).click();
    await page.getByRole('button', { name: /Multiplication/ }).click();
    
    // Set up dialog handler to capture alert BEFORE clicking
    let dialogShown = false;
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Please select at least one operation');
      dialogShown = true;
      await dialog.accept();
    });
    
    // Try to click Start Practice without selecting operation
    const startButton = page.getByRole('button', { name: 'Start Practice' });
    await startButton.click();
    
    // Wait a bit for dialog
    await page.waitForTimeout(100);
    
    // Verify dialog was shown and still on home page
    expect(dialogShown).toBe(true);
    await expect(page).toHaveURL('/');
  });
});

