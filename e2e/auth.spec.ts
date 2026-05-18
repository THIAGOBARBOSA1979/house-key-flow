
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login as admin and then logout', async ({ page }) => {
    await page.goto('/login');

    // Wait for the login page to load
    await expect(page.locator('h1')).toContainText('A2 Incorporadora');

    // Fill login form
    // Note: Adjust selectors based on actual login page markup
    await page.getByPlaceholder('seu@email.com').fill('admin@exemplo.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    
    // Select Admin tab if needed (assuming Tabs component is used)
    await page.getByRole('tab', { name: 'Área Administrativa' }).click();
    
    await page.getByRole('button', { name: 'Entrar no Portal' }).click();

    // Verify redirected to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1')).toContainText('Olá, Administrador');

    // Logout
    await page.getByRole('button', { name: 'Administrador' }).click(); // User dropdown
    await page.getByText('Sair com segurança').click();

    // Verify back to home or login
    await expect(page).toHaveURL('/');
  });
});
