import { test as base, APIRequestContext } from '@playwright/test';

type ApiFixtures = {
	apiContext: APIRequestContext;
	createdResourceIds: string[];
};

export const test = base.extend<ApiFixtures>({
	/**
	 * Reusable API context fixture with optional API key support
	 */
	apiContext: async ({ playwright }, use) => {
		// Get API key from environment variable if it exists
		const apiKey = process.env.REQRES_API_KEY || '';

		const headers: Record<string, string> = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};

		// Add API key to headers if it exists
		// Different APIs use different header names, adjust as needed:
		if (apiKey) {
			// Option 1: X-API-Key header (common)
			headers['X-API-Key'] = apiKey;

			// Option 2: Authorization header with Bearer token (also common)
			// headers['Authorization'] = `Bearer ${apiKey}`;

			// Option 3: Custom header name (depends on API)
			// headers['X-Custom-Auth'] = apiKey;
		}

		const context = await playwright.request.newContext({
			baseURL: process.env.BASE_URL || 'https://reqres.in/api',
			extraHTTPHeaders: headers,
			timeout: parseInt(process.env.TIMEOUT || '30000'),
		});

		await use(context);
		await context.dispose();
	},

	/**
	 * Track created resources for cleanup
	 */
	createdResourceIds: async ({}, use) => {
		const ids: string[] = [];
		await use(ids);

		if (ids.length > 0) {
			console.log(`Cleanup: Would delete ${ids.length} resources`);
		}
	},
});

export { expect } from '@playwright/test';
