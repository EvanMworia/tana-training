// src/fixtures/trello-fixtures.ts
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { trelloConfig } from '../config/env';

type TrelloFixtures = {
	authenticatedPage: Page;
};

/**
 * Extended test fixture that provides an authenticated Trello session
 * Use this when your test needs UI access
 */
export const test = base.extend<TrelloFixtures>({
	authenticatedPage: async ({ page }, use) => {
		// Only perform login if credentials are available
		if (trelloConfig.username && trelloConfig.password) {
			const loginPage = new LoginPage(page);
			await loginPage.login(trelloConfig.username, trelloConfig.password);
			console.log('✅ Fixture: User authenticated');
		} else {
			throw new Error(
				'UI tests require TRELLO_USERNAME and TRELLO_PASSWORD in .env file'
			);
		}
		
		// Provide the authenticated page to the test
		await use(page);
		
		// Teardown happens automatically
	},
});

export { expect };