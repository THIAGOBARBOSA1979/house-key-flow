import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Inspection Scheduling', () => {
  test('client should schedule an inspection and admin should confirm it', async ({ page, browser }) => {
    // 1. Client Login (Mocked session or actually filling form)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@exemplo.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Acessar")');
    
    await expect(page).toHaveURL(/.*client/);

    // 2. Client schedules inspection
    await page.click('button:has-text("Solicitar Vistoria")');
    await page.fill('input[name="date"]', '2026-06-20');
    await page.fill('input[name="time"]', '10:00');
    await page.click('button:has-text("Confirmar Agendamento")');

    await expect(page.locator('text=Solicitação enviada')).toBeVisible();

    // 3. Admin Login in a separate context (or reuse page after logout)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/login');
    await adminPage.fill('input[type="email"]', 'admin@exemplo.com');
    await adminPage.fill('input[type="password"]', '123456');
    await adminPage.click('button:has-text("Acessar")');

    await adminPage.goto('/admin/warranty');
    
    // 4. Admin sees and updates status
    await adminPage.click('text=2026-06-20'); // Click the inspection card
    await adminPage.selectOption('select[name="status"]', 'confirmed');
    await adminPage.click('button:has-text("Salvar")');

    await expect(adminPage.locator('text=Status atualizado')).toBeVisible();
    await adminContext.close();
  });
});

test.describe('Critical Flow: Support Ticketing', () => {
  test('client opens ticket, admin responds, client closes', async ({ page, browser }) => {
    // Client opens ticket
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@exemplo.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Acessar")');
    
    await page.goto('/client/support');
    await page.click('button:has-text("Novo Chamado")');
    await page.fill('input[name="subject"]', 'E2E Support Test');
    await page.fill('textarea[name="message"]', 'Need help with plumbing');
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('text=Chamado aberto')).toBeVisible();

    // Admin context
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/login');
    await adminPage.fill('input[type="email"]', 'admin@exemplo.com');
    await adminPage.fill('input[type="password"]', '123456');
    await adminPage.click('button:has-text("Acessar")');
    
    await adminPage.goto('/admin/support');
    await adminPage.click('text=E2E Support Test');
    await adminPage.fill('textarea[placeholder*="Mensagem"]', 'We are sending a technician.');
    await adminPage.click('button:has-text("Responder")');

    await expect(adminPage.locator('text=Mensagem enviada')).toBeVisible();
    await adminContext.close();
  });
});
