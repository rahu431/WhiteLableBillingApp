import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // This test requires a user to be created in Firebase Auth with the following credentials.
  // Email: test-user@example.com
  // Password: password123
  const email = 'test-user@example.com';
  const password = 'password123';

  await page.goto('/login');

  // Wait for the login form to be visible, as the page might show a loading state initially.
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // Wait for the main app page to load. In a tablet view, this is the "New Invoice" heading.
  await expect(page.getByRole('heading', { name: 'New Invoice' })).toBeVisible({ timeout: 15000 });
  
  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
