import { test, expect } from '@playwright/test';

test.describe('Flow Complexo de Vistoria', () => {
  test('vistoriador deve iniciar, preencher checklist e finalizar vistoria', async ({ page }) => {
    // 1. Login do Administrador/Vistoriador
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@exemplo.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Acessar")');
    
    await expect(page).toHaveURL(/.*admin/);

    // 2. Navegar para Vistorias
    await page.goto('/admin/inspections');
    
    // 3. Iniciar uma vistoria existente (assume-se que há uma pendente na lista do simulador)
    const startButton = page.locator('button:has-text("Iniciar Vistoria")').first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 4. Preenchimento do Checklist
    // Marcar itens como conformes
    const conformeButtons = page.locator('button:has-text("Conforme")');
    await expect(conformeButtons.first()).toBeVisible();
    
    // Marcar os dois primeiros itens
    await conformeButtons.nth(0).click();
    await conformeButtons.nth(1).click();

    // Marcar um item como não conforme e adicionar observação
    const naoConformeButton = page.locator('button:has-text("Não Conforme")').first();
    await naoConformeButton.click();
    
    const obsTextArea = page.locator('textarea[placeholder*="observações"]').first();
    await obsTextArea.fill('Infiltração detectada na parede lateral');

    // 5. Finalizar Vistoria
    const finishButton = page.locator('button:has-text("Finalizar Vistoria")');
    await expect(finishButton).toBeEnabled();
    await finishButton.click();

    // 6. Validar encerramento e retorno
    await expect(page.locator('text=Vistoria finalizada com sucesso')).toBeVisible();
    await expect(page).toHaveURL(/.*admin\/inspections/);
  });
});
