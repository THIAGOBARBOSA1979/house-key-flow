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
    // O botão de "Conforme" está dentro do ChecklistItemCard
    const conformeButtons = page.locator('button:has-text("Conforme")');
    await expect(conformeButtons.first()).toBeVisible();
    
    // Marcar os dois primeiros itens
    await conformeButtons.nth(0).click();
    await conformeButtons.nth(1).click();

    // Marcar um item como não conforme e adicionar observação
    // No código, o botão de falha tem o texto "Falha"
    const failureButton = page.locator('button:has-text("Falha")').first();
    await failureButton.click();
    
    const obsTextArea = page.locator('textarea[placeholder*="detalhes técnicos"]').first();
    await obsTextArea.fill('Infiltração detectada na parede lateral');

    // Navegar para a próxima seção se houver múltiplos grupos
    const nextSectionButton = page.locator('button:has-text("Próxima Seção")');
    while (await nextSectionButton.isVisible()) {
      await nextSectionButton.click();
    }

    // 5. Revisar e Finalizar Vistoria
    const reviewButton = page.locator('button:has-text("Revisar Protocolo")');
    await expect(reviewButton).toBeEnabled();
    await reviewButton.click();

    // Preencher assinatura no resumo
    await page.fill('input[placeholder*="nome completo"]', 'Engenheiro de Teste E2E');

    const finishButton = page.locator('button:has-text("Confirmar e Finalizar Vistoria")');
    await finishButton.click();

    // 6. Validar encerramento e retorno
    await expect(page.locator('text=Vistoria homologada com sucesso')).toBeVisible();
    await expect(page).toHaveURL(/.*admin\/inspections/);
  });
});
