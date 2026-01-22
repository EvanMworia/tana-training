import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://trello.com/');
  await page.getByTestId('bignav').getByRole('link', { name: 'Log in' }).click();
  await page.getByTestId('username').click();
  await page.getByTestId('username').click();
  await page.getByTestId('username').click();
  await page.getByTestId('username').fill('evannji99@gmail.com');
  await page.getByTestId('login-submit-idf-testid').click();
});