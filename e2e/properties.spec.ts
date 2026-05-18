
import { test, expect } from '@playwright/test';

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    // Shared login for these tests
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill('admin@exemplo.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('tab', { name: 'Área Administrativa' }).click();
    await page.getByRole('button', { name: 'Entrar no Portal' }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should create a new property and delete it', async ({ page }) => {
    await page.goto('/admin/properties');

    // Create
    await page.getByRole('button', { name: 'Novo Empreendimento' }).click();
    await page.getByLabel('Nome do Empreendimento').fill('Edifício Teste Playwright');
    await page.getByLabel('Localização').fill('Rua de Teste, 123');
    await page.getByLabel('Total de Unidades').fill('50');
    await page.getByRole('button', { name: 'Salvar Empreendimento' }).click();

    // Verify creation in list
    await expect(page.getByText('Edifício Teste Playwright')).toBeVisible();

    // Delete (Assuming there is a delete button/action)
    // Find the row and click delete
    const row = page.locator('tr', { hasText: 'Edifício Teste Playwright' });
    await row.getByRole('button').last().click(); // Actions dropdown
    await page.getByText('Excluir').click(); // assuming this exists in dropdown

    // Confirm delete
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Verify gone
    await expect(page.getByText('Edifício Teste Playwright')).not.toBeVisible();
  });
});
