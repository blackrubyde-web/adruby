import { test, expect } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:8888';

test.describe('Payment & Auth flows', () => {
  test('missing session id on verification shows error screen', async ({ page }) => {
    await page.goto(`${baseURL}/payment-verification`);
    await expect(page.locator('text=Zahlung konnte nicht')).toBeVisible();
  });

  test('cancel route exists and shows CTA', async ({ page }) => {
    await page.goto(`${baseURL}/payment-cancelled`);
    await expect(page.getByRole('button', { name: /Checkout erneut starten/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Preisen/i })).toBeVisible();
  });

  test('create checkout session returns url', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/create-checkout-session`, {
      data: {
        userId: 'test-user-id',
        email: 'test@example.com'
      }
    });

    expect(response.status()).toBeLessThan(500);
    const json = await response.json();
    expect(json.url).toBeTruthy();
  });

  test('protected route redirects unauthenticated', async ({ page }) => {
    await page.goto(`${baseURL}/overview-dashboard`);
    await expect(page).toHaveURL(/login/);
  });
});
