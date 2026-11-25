import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTrainer, loginAsAthlete, logout } from './helpers/auth.helper.js';

test.describe('E2E - Módulo 01: Autenticación, Sesión y Control de Acceso', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await expect(page.locator('.login-page-wrapper')).toBeVisible();
  });

  test('01.01: Renderiza la pantalla de autenticación con título institucional y formulario', async ({ page }) => {
    await expect(page.locator('.login-page-wrapper')).toBeVisible();
    await expect(page.locator('.login-title')).toContainText('Gym');
    await expect(page.locator('#emailInput')).toBeVisible();
    await expect(page.locator('#passwordInput')).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  });

  test('01.02: Acceso rápido 1-Click con rol Administrador', async ({ page }) => {
    await page.locator('.btn-demo-card.admin').click();
    await expect(page.locator('.navbar-root')).toBeVisible();
    await expect(page.locator('.navbar-root .user-role-badge')).toContainText('Admin');
    await expect(page).toHaveURL(/.*admin\/users/);
  });

  test('01.03: Acceso rápido 1-Click con rol Entrenador', async ({ page }) => {
    await page.locator('.btn-demo-card.trainer').click();
    await expect(page.locator('.navbar-root')).toBeVisible();
    await expect(page.locator('.navbar-root .user-role-badge')).toContainText('Entrenador');
    await expect(page).toHaveURL(/.*trainer\/assign-plan/);
  });

  test('01.04: Acceso rápido 1-Click con rol Atleta', async ({ page }) => {
    await page.locator('.btn-demo-card.athlete').click();
    await expect(page.locator('.navbar-root')).toBeVisible();
    await expect(page.locator('.navbar-root .user-role-badge')).toContainText('Atleta');
    await expect(page.locator('.athlete-dashboard, .dashboard-container, main')).toBeVisible();
  });

  test('01.05: Inicio de sesión manual con credenciales válidas', async ({ page }) => {
    await page.locator('#emailInput').fill('admin@gym.com');
    await page.locator('#passwordInput').fill('admin123');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.locator('.navbar-root')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('Administrador');
  });

  test('01.06: Inicio de sesión manual con contraseña incorrecta muestra alerta visible', async ({ page }) => {
    await page.locator('#emailInput').fill('admin@gym.com');
    await page.locator('#passwordInput').fill('wrongpass999');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.locator('.alert-box.alert-error')).toBeVisible();
    await expect(page.locator('.alert-box.alert-error')).toContainText(/credenciales|error/i);
  });

  test('01.07: Inicio de sesión manual con usuario inexistente muestra alerta visible', async ({ page }) => {
    await page.locator('#emailInput').fill('noexiste@gym.com');
    await page.locator('#passwordInput').fill('algunapass');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.locator('.alert-box.alert-error')).toBeVisible();
  });

  test('01.08: Validación en campos de correo y contraseña vacíos', async ({ page }) => {
    const emailInput = page.locator('#emailInput');
    await expect(emailInput).toHaveAttribute('required', '');
    const passInput = page.locator('#passwordInput');
    await expect(passInput).toHaveAttribute('required', '');
  });

  test('01.09: Cierre de sesión (logout) limpia token y redirige a la pantalla de login', async ({ page }) => {
    await loginAsAdmin(page);
    await logout(page);

    await expect(page.locator('.login-page-wrapper')).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('gym_auth_token'));
    expect(token).toBeNull();
  });

  test('01.10: Redirección de ruta raíz: Administrador redirige a /admin/users', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/');
    await expect(page).toHaveURL(/.*admin\/users/);
  });

  test('01.11: Redirección de ruta raíz: Entrenador redirige a /trainer/assign-plan', async ({ page }) => {
    await loginAsTrainer(page);
    await page.goto('/');
    await expect(page).toHaveURL(/.*trainer\/assign-plan/);
  });

  test('01.12: Persistencia de sesión y token en localStorage tras recarga del navegador (F5)', async ({ page }) => {
    await loginAsAthlete(page);
    await page.reload();

    await expect(page.locator('.navbar-root')).toBeVisible();
    await expect(page.locator('.navbar-root .user-role-badge')).toContainText('Atleta');
  });
});
