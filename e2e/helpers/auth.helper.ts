import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  const adminDemoBtn = page.locator('.btn-demo-card.admin');
  await adminDemoBtn.waitFor({ state: 'visible', timeout: 10000 });
  await adminDemoBtn.click();
  await expect(page.locator('.navbar-root')).toBeVisible({ timeout: 10000 });
}

export async function loginAsTrainer(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  const trainerDemoBtn = page.locator('.btn-demo-card.trainer');
  await trainerDemoBtn.waitFor({ state: 'visible', timeout: 10000 });
  await trainerDemoBtn.click();
  await expect(page.locator('.navbar-root')).toBeVisible({ timeout: 10000 });
}

export async function loginAsAthlete(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  const athleteDemoBtn = page.locator('.btn-demo-card.athlete');
  await athleteDemoBtn.waitFor({ state: 'visible', timeout: 10000 });
  await athleteDemoBtn.click();
  await expect(page.locator('.navbar-root')).toBeVisible({ timeout: 10000 });
}

export async function logout(page: Page) {
  const logoutBtn = page.locator('.btn-logout');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await expect(page.locator('.login-page-wrapper')).toBeVisible({ timeout: 10000 });
  }
}
