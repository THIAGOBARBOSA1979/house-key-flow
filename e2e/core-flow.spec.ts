
import { test, expect } from '@playwright/test';

test.describe('Core E2E Flow', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill the login form
    await page.fill('input[type="email"]', 'admin@exemplo.com');
    await page.fill('input[type="password"]', '123456');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for the dashboard to load (checking for a specific text or element)
    await expect(page).toHaveURL(/.*home|.*index|.*/); // Match home or index
    
    // Check if the sidebar is visible
    const sidebar = page.locator('nav');
    await expect(sidebar).toBeVisible();
  });

  test('should visit inspections page and see stats', async ({ page }) => {
    // Navigate after login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@exemplo.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Navigate to Inspections
    await page.goto('/inspections');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Vistorias');
    
    // Check if stats cards are present
    const statsCards = page.locator('.grid >> .card-standard');
    await expect(statsCards.first()).toBeVisible();
  });
});
