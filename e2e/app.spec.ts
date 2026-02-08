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

    // Find a specific product card by its title and wait for it to be visible.
    const productCard = page.getByText('Filter Coffee', { exact: true }).locator('xpath=ancestor::div[contains(@class, "flex-col")]');
    await expect(productCard).toBeVisible({ timeout: 20000 }); // Increased timeout for product loading

    // Click the product to open the dialog.
    await productCard.click();

    // The "Add to invoice" dialog should appear.
    await expect(page.getByRole('heading', { name: 'Add Filter Coffee to Invoice' })).toBeVisible();
    
    // Add to invoice.
    await page.getByRole('button', { name: 'Add to Invoice' }).click();

    // Check that the invoice details section is no longer empty.
    await expect(page.getByRole('heading', { name: 'Current Invoice' })).toBeVisible();
    await expect(page.getByText('Your invoice is empty')).not.toBeVisible();
    
    // Verify the item and subtotal are now in the invoice.
    await expect(page.getByText('Filter Coffee')).toBeVisible();
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
