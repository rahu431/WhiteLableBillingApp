import { test, expect } from '@playwright/test';

test.describe('App Navigation and Core Features', () => {
  test('should navigate to products page and see product list', async ({ page }) => {
    await page.goto('/');
  
    // Navigate to products page from sidebar
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
  
    // Check for product management card
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByPlaceholder('Search active products...')).toBeVisible();
  });
  
  test('should add a product to the invoice', async ({ page }) => {
    await page.goto('/');
  
    // Wait for products to load and click on the first one
    const firstProduct = page.locator('div.grid > div > .flex-col').first();
    await expect(firstProduct).toBeVisible({ timeout: 20000 }); // Increased timeout for product loading
    await firstProduct.click();
  
    // In the dialog, add to invoice
    await page.getByRole('button', { name: 'Add to Invoice' }).click();
  
    // Check that the invoice details section is no longer empty
    await expect(page.getByRole('heading', { name: 'Current Invoice' })).toBeVisible();
    await expect(page.getByText('Your invoice is empty')).not.toBeVisible();
    await expect(page.getByText('Subtotal')).toBeVisible();
  });

  test('should navigate to accounts page and see invoices', async ({ page }) => {
    await page.goto('/');

    // Navigate to accounts page
    await page.getByRole('link', { name: 'Accounts' }).click();
    await expect(page).toHaveURL('/accounts');

    // Check for the accounts table
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
