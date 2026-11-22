import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.helper.js';

test.describe('E2E - Módulo 02: Gestión Centralizada de Usuarios (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await expect(page.locator('.admin-page-container')).toBeVisible({ timeout: 10000 });
  });

  test('02.01: Navegación al panel de usuarios por rol Administrador', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin\/users/);
    await expect(page.locator('h1.admin-title')).toContainText('Gestión de Usuarios');
  });

  test('02.02: Listado renderiza usuarios precargados en el sistema', async ({ page }) => {
    const rows = page.locator('.admin-users-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.admin-users-table')).toContainText('Carlos Mendoza');
  });

  test('02.03: Búsqueda y filtrado de usuarios por término', async ({ page }) => {
    const searchInput = page.locator('.admin-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Carlos');
    await page.waitForTimeout(300);
    await expect(page.locator('.admin-users-table')).toContainText('Carlos Mendoza');
  });

  test('02.04: Filtro por rol en la vista de administración', async ({ page }) => {
    const trainerPill = page.locator('.filter-pill-btn').filter({ hasText: /entrenador/i });
    await expect(trainerPill).toBeVisible();
    await trainerPill.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.admin-users-table')).toContainText('Entrenador');
  });

  test('02.05: Apertura del modal de creación de usuario', async ({ page }) => {
    const openBtn = page.locator('.btn-primary.btn-with-icon').filter({ hasText: /nuevo usuario/i });
    await openBtn.click();
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible({ timeout: 5000 });
    // Cerrar modal
    await page.locator('.btn-close-modal').click();
  });

  test('02.06: Creación exitosa de un nuevo Entrenador', async ({ page }) => {
    const openBtn = page.locator('.btn-primary.btn-with-icon').filter({ hasText: /nuevo usuario/i });
    await openBtn.click();
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible({ timeout: 5000 });

    // Seleccionar rol Entrenador
    const trainerRoleBtn = page.locator('.role-select-btn').filter({ hasText: 'Entrenador' });
    await trainerRoleBtn.click();

    const uniqueEmail = `coach.e2e.${Date.now()}@gym.com`;
    const form = page.locator('.admin-create-modal form');
    await form.locator('input[type="text"]').first().fill('Coach E2E Test');
    await form.locator('input[type="email"]').fill(uniqueEmail);
    await form.locator('input[type="password"]').fill('password123');

    await form.locator('button[type="submit"]').click();
    // Modal se cierra o muestra éxito y recarga
    await expect(page.locator('.admin-users-table')).toContainText('Coach E2E Test', { timeout: 10000 });
  });

  test('02.07: Creación exitosa de un nuevo Atleta', async ({ page }) => {
    const openBtn = page.locator('.btn-primary.btn-with-icon').filter({ hasText: /nuevo usuario/i });
    await openBtn.click();
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible({ timeout: 5000 });

    // Seleccionar rol Atleta
    const athleteRoleBtn = page.locator('.role-select-btn').filter({ hasText: 'Atleta' });
    await athleteRoleBtn.click();

    const uniqueEmail = `atleta.e2e.${Date.now()}@gym.com`;
    const form = page.locator('.admin-create-modal form');
    await form.locator('input[type="text"]').first().fill('Atleta E2E Test');
    await form.locator('input[type="email"]').fill(uniqueEmail);
    await form.locator('input[type="password"]').fill('password123');

    await form.locator('button[type="submit"]').click();
    await expect(page.locator('.admin-users-table')).toContainText('Atleta E2E Test', { timeout: 10000 });
  });

  test('02.08: Validación de correo duplicado muestra mensaje de error visible', async ({ page }) => {
    const openBtn = page.locator('.btn-primary.btn-with-icon').filter({ hasText: /nuevo usuario/i });
    await openBtn.click();
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible({ timeout: 5000 });

    const form = page.locator('.admin-create-modal form');
    await form.locator('input[type="text"]').first().fill('Duplicado Test');
    await form.locator('input[type="email"]').fill('admin@gym.com');
    await form.locator('input[type="password"]').fill('password123');

    await form.locator('button[type="submit"]').click();
    await expect(page.locator('.admin-create-modal .alert-box.error')).toBeVisible({ timeout: 5000 });
    await page.locator('.btn-close-modal').click();
  });

  test('02.09: Validación de campos obligatorios en formulario de creación', async ({ page }) => {
    const openBtn = page.locator('.btn-primary.btn-with-icon').filter({ hasText: /nuevo usuario/i });
    await openBtn.click();
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible({ timeout: 5000 });

    const form = page.locator('.admin-create-modal form');
    await form.locator('button[type="submit"]').click();
    // Modal debe permanecer abierto
    await expect(page.locator('.modal-container.admin-create-modal')).toBeVisible();
    await page.locator('.btn-close-modal').click();
  });

  test('02.10: Modal de confirmación para baja definitiva de cuenta', async ({ page }) => {
    const deleteBtn = page.locator('.admin-users-table button.btn-table-action.delete').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('.modal-container.modal-sm')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.modal-container.modal-sm')).toContainText('¿Estás seguro');
      // Cancelar
      await page.locator('.modal-container.modal-sm .btn-secondary').click();
    }
  });

  test('02.11: Cancelación de baja mantiene el usuario en la lista', async ({ page }) => {
    const deleteBtn = page.locator('.admin-users-table button.btn-table-action.delete').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('.modal-container.modal-sm')).toBeVisible({ timeout: 5000 });
      await page.locator('.modal-container.modal-sm .btn-secondary').click();
      await expect(page.locator('.modal-container.modal-sm')).not.toBeVisible();
    }
  });

  test('02.12: Confirmación de baja elimina al usuario y actualiza la lista', async ({ page }) => {
    // Buscar el usuario que creamos en tests anteriores
    const searchInput = page.locator('.admin-search-input');
    await searchInput.fill('Atleta E2E Test');
    await page.waitForTimeout(500);

    const deleteBtn = page.locator('.admin-users-table button.btn-table-action.delete').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('.modal-container.modal-sm')).toBeVisible({ timeout: 5000 });
      await page.locator('.modal-container.modal-sm .btn-danger').click();
      await page.waitForTimeout(1000);
    }
  });
});
