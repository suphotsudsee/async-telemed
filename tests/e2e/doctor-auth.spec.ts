import { test, expect } from '@playwright/test';

const doctorUrl = process.env.DOCTOR_APP_URL ?? 'http://localhost:5174';

const text = {
  usernameLabel: 'Username',
  loginButton: '\u0e40\u0e02\u0e49\u0e32\u0e17\u0e33\u0e07\u0e32\u0e19',
  loginFail: '\u0e0a\u0e37\u0e48\u0e2d\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e2b\u0e23\u0e37\u0e2d\u0e23\u0e2b\u0e31\u0e2a\u0e1c\u0e48\u0e32\u0e19\u0e44\u0e21\u0e48\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07',
  queueTitle: '\u0e04\u0e34\u0e27\u0e04\u0e19\u0e44\u0e02\u0e49',
  signOut: '\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a'
};

async function loginAsDoctor(page: import('@playwright/test').Page, username = 'dr.narin', password = 'doctor123') {
  await page.goto(doctorUrl, { waitUntil: 'networkidle' });
  await expect(page.getByText(text.usernameLabel, { exact: true })).toBeVisible();
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole('button', { name: text.loginButton }).click();
}

test('doctor login rejects invalid credentials', async ({ page }) => {
  await loginAsDoctor(page, 'dr.narin', 'wrongpass');
  await expect(page.getByText(text.loginFail, { exact: true })).toBeVisible();
  await expect(page.getByText(text.usernameLabel, { exact: true })).toBeVisible();
});

test('doctor can logout and return to login screen', async ({ page }) => {
  await loginAsDoctor(page);
  await expect(page.getByRole('heading', { name: text.queueTitle })).toBeVisible();
  await page.getByRole('button', { name: text.signOut }).click();
  await expect(page.getByText(text.usernameLabel, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: text.loginButton })).toBeVisible();
});

test('doctor session restores after reload in same browser context', async ({ page }) => {
  await loginAsDoctor(page);
  await expect(page.getByRole('heading', { name: text.queueTitle })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: text.queueTitle })).toBeVisible();
  await expect(page.getByText(text.usernameLabel, { exact: true })).toHaveCount(0);
});
