import { test, expect } from '@playwright/test';
import { loginAsTrainer } from './helpers/auth.helper.js';

test.describe('E2E - Módulo 03: Catálogo de Ejercicios y Reproductor Multimedia', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTrainer(page);
    await page.goto('/exercises');
    await expect(page.locator('.catalog-page-layout')).toBeVisible({ timeout: 10000 });
  });

  test('03.01: Navegación al catálogo oficial de ejercicios por rol Entrenador', async ({ page }) => {
    await expect(page).toHaveURL(/.*exercises/);
    await expect(page.locator('h1.page-main-title')).toContainText('Catálogo Oficial de Ejercicios');
  });

  test('03.02: Visualización de tarjetas de ejercicios precargadas', async ({ page }) => {
    const cards = page.locator('.exercise-card');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });

  test('03.03: Búsqueda de ejercicio por término clave', async ({ page }) => {
    const searchInput = page.locator('.catalog-search-input, input[placeholder*="Buscar"]');
    await searchInput.fill('Sentadilla');
    await page.waitForTimeout(300);
    await expect(page.locator('.exercise-card').first()).toContainText(/Sentadilla/i);
  });

  test('03.04: Filtrado mediante píldoras de grupo muscular', async ({ page }) => {
    const musclePill = page.locator('.muscle-chip, .filter-chip').filter({ hasText: 'Piernas' }).first();
    if (await musclePill.isVisible()) {
      await musclePill.click();
      await page.waitForTimeout(300);
      await expect(musclePill).toHaveClass(/active|selected/);
    }
  });

  test('03.05: Selección de "Todos los grupos" restablece el catálogo', async ({ page }) => {
    const allPill = page.locator('.muscle-chip, .filter-chip').filter({ hasText: /todos/i }).first();
    if (await allPill.isVisible()) {
      await allPill.click();
      await page.waitForTimeout(300);
      await expect(page.locator('.exercise-card').first()).toBeVisible();
    }
  });

  test('03.06: Apertura del modal de creación de ejercicio', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container h3.modal-title')).toBeVisible({ timeout: 5000 });
    await page.locator('.btn-icon-close, .btn-secondary:has-text("Cancelar")').first().click();
  });

  test('03.07: Creación de ejercicio con grupo muscular existente', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueName = `Press Militar E2E ${Date.now()}`;
    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);
    
    // Seleccionar grupo
    const groupSelect = page.locator('.modal-container select.form-input');
    if (await groupSelect.isVisible()) {
      await groupSelect.selectOption({ index: 0 });
    }

    // Agregar zona rápida
    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) {
      await quickZone.click();
    } else {
      await page.locator('.zone-input-row input').fill('Hombros');
      await page.locator('.btn-add-tag').click();
    }

    // Descripción
    await page.locator('.modal-container textarea.form-input').fill('Empuje vertical por encima de la cabeza.');

    // Submit
    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.catalog-page-layout')).toContainText(uniqueName, { timeout: 10000 });
  });

  test('03.08: Creación de ejercicio con nuevo grupo muscular dinámico', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueGroup = `Grupo-${Date.now()}`;
    const uniqueName = `Ejercicio Nuevo Grupo ${Date.now()}`;

    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);

    // Toggle grupo nuevo
    const newGroupBtn = page.locator('.custom-toggle-btn');
    if (await newGroupBtn.isVisible()) {
      await newGroupBtn.click();
      await page.locator('.custom-group-input-box input').fill(uniqueGroup);
    }

    // Zona rápida
    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) {
      await quickZone.click();
    } else {
      await page.locator('.zone-input-row input').fill('Zona Custom');
      await page.locator('.btn-add-tag').click();
    }

    await page.locator('.modal-container textarea.form-input').fill('Descripción del nuevo ejercicio.');
    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.catalog-page-layout')).toContainText(uniqueName, { timeout: 10000 });
  });

  test('03.09: Incorporación de zonas musculares trabajadas con botón agregar', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const zoneInput = page.locator('.zone-input-row input');
    await zoneInput.fill('Deltoides Anterior');
    await page.locator('.btn-add-tag').click();
    await expect(page.locator('.selected-zone-badge').filter({ hasText: 'Deltoides Anterior' })).toBeVisible();

    await page.locator('.btn-icon-close, .btn-secondary:has-text("Cancelar")').first().click();
  });

  test('03.10: Incorporación de múltiples zonas separadas por comas', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const zoneInput = page.locator('.zone-input-row input');
    await zoneInput.fill('Tríceps, Pectoral Clavicular');
    await page.locator('.btn-add-tag').click();
    await expect(page.locator('.selected-zone-badge').filter({ hasText: 'Tríceps' })).toBeVisible();

    await page.locator('.btn-icon-close, .btn-secondary:has-text("Cancelar")').first().click();
  });

  test('03.11: Eliminación de chips de zonas musculares', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const zoneInput = page.locator('.zone-input-row input');
    await zoneInput.fill('Zona Borrable');
    await page.locator('.btn-add-tag').click();
    await expect(page.locator('.selected-zone-badge').filter({ hasText: 'Zona Borrable' })).toBeVisible();

    // Quitar la zona recién agregada
    await page.locator('.selected-zone-badge').filter({ hasText: 'Zona Borrable' }).locator('.btn-remove-zone').click();
    await expect(page.locator('.selected-zone-badge').filter({ hasText: 'Zona Borrable' })).toHaveCount(0);

    await page.locator('.btn-icon-close, .btn-secondary:has-text("Cancelar")').first().click();
  });

  test('03.12: Creación con URL de YouTube estándar', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueName = `Remo Barra ${Date.now()}`;
    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);
    
    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) await quickZone.click();

    await page.locator('.modal-container textarea.form-input').fill('Pautas de ejecución del ejercicio.');
    await page.locator('.modal-container input[type="url"]').fill('https://www.youtube.com/watch?v=G8l_8chR5BE');

    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.catalog-page-layout')).toContainText(uniqueName, { timeout: 10000 });
  });

  test('03.13: Creación con URL de YouTube Shorts', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueName = `Shorts Ejercicio ${Date.now()}`;
    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);

    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) await quickZone.click();

    await page.locator('.modal-container textarea.form-input').fill('Pautas de ejecución del ejercicio.');
    await page.locator('.modal-container input[type="url"]').fill('https://www.youtube.com/shorts/3jZ_hK8aBcD');

    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.catalog-page-layout')).toContainText(uniqueName, { timeout: 10000 });
  });

  test('03.14: Creación con URL directa a video MP4', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueName = `MP4 Ejercicio ${Date.now()}`;
    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);

    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) await quickZone.click();

    await page.locator('.modal-container textarea.form-input').fill('Pautas de ejecución del ejercicio.');
    await page.locator('.modal-container input[type="url"]').fill('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');

    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.catalog-page-layout')).toContainText(uniqueName, { timeout: 10000 });
  });

  test('03.15: Creación sin video muestra etiqueta visible "Sin video"', async ({ page }) => {
    await page.locator('.btn-primary').filter({ hasText: /crear ejercicio/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible({ timeout: 5000 });

    const uniqueName = `Ejercicio Sin Video ${Date.now()}`;
    await page.locator('.modal-container input[type="text"]').first().fill(uniqueName);

    const quickZone = page.locator('.quick-zone-chip').first();
    if (await quickZone.isVisible()) await quickZone.click();

    await page.locator('.modal-container textarea.form-input').fill('Pautas de ejecución del ejercicio.');
    await page.locator('.modal-container input[type="url"]').fill('');

    await page.locator('.modal-footer button[type="submit"]').click();
    await expect(page.locator('.exercise-card').filter({ hasText: uniqueName })).toContainText(/sin video/i, { timeout: 10000 });
  });

  test('03.16: Apertura del modal de detalle biomecánico al hacer clic en una tarjeta', async ({ page }) => {
    const firstCard = page.locator('.exercise-card').first();
    await firstCard.locator('.btn-secondary.btn-block').click();
    await expect(page.locator('.video-modal-card')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
  });

  test('03.17: Iframe de YouTube incrustado correctamente con parámetros rel=0', async ({ page }) => {
    const cardWithVideo = page.locator('.exercise-card:not(:has-text("Sin video"))').first();
    if (await cardWithVideo.isVisible()) {
      await cardWithVideo.locator('.btn-secondary.btn-block').click();
      const iframe = page.locator('.video-modal-card iframe');
      if (await iframe.isVisible()) {
        await expect(iframe).toHaveAttribute('src', /youtube.*rel=0/);
      }
      await page.keyboard.press('Escape');
    }
  });

  test('03.18: Muñeco anatómico (HumanBodyFigure) ilumina zonas trabajadas', async ({ page }) => {
    const firstCard = page.locator('.exercise-card').first();
    await firstCard.locator('.btn-secondary.btn-block').click();
    await expect(page.locator('.anatomic-figure-container').first()).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
  });

  test('03.19: Mensaje de respaldo cuando el ejercicio no posee video', async ({ page }) => {
    const noVideoCard = page.locator('.exercise-card').filter({ hasText: /sin video/i }).first();
    if (await noVideoCard.isVisible()) {
      await noVideoCard.locator('.btn-secondary.btn-block').click();
      await expect(page.locator('.video-modal-card')).toContainText(/no disponible|sin video/i);
      await page.keyboard.press('Escape');
    }
  });

  test('03.20: Cierre de modal de detalle mediante botón cerrar o tecla Escape', async ({ page }) => {
    const firstCard = page.locator('.exercise-card').first();
    await firstCard.locator('.btn-secondary.btn-block').click();
    await expect(page.locator('.video-modal-card')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('.video-modal-card')).not.toBeVisible();
  });
});
