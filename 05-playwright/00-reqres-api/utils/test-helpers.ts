import { expect, APIResponse } from '@playwright/test';
import { config } from '../config/environment';

export class TestHelpers {
	/**
	 * Validate response time is within acceptable threshold
	 */
	static validateResponseTime(startTime: number, endTime: number, customThreshold?: number) {
		const responseTime = endTime - startTime;
		const threshold = customThreshold || config.performanceThreshold;
		expect(responseTime, `Response time ${responseTime}ms exceeds threshold ${threshold}ms`).toBeLessThan(
			threshold,
		);
		return responseTime;
	}

	/**
	 * Validate common response headers
	 */
	static async validateHeaders(response: APIResponse) {
		const headers = response.headers();
		expect(headers['content-type']).toContain('application/json');
		expect(headers).toHaveProperty('date');
	}

	/**
	 * Validate pagination structure
	 */
	static validatePagination(data: any, expectedPage: number) {
		expect(data).toHaveProperty('page');
		expect(data).toHaveProperty('per_page');
		expect(data).toHaveProperty('total');
		expect(data).toHaveProperty('total_pages');
		expect(data.page).toBe(expectedPage);
		expect(data.per_page).toBeGreaterThan(0);
		expect(data.total).toBeGreaterThanOrEqual(0);
	}

	/**
	 * Validate user object structure
	 */
	static validateUserStructure(user: any) {
		expect(user).toHaveProperty('id');
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('job');
		expect(user).toHaveProperty('createdAt');
		expect(typeof user.name).toBe('string');
		expect(typeof user.job).toBe('string');
	}

	/**
	 * Validate error response structure
	 */
	static validateErrorResponse(data: any) {
		expect(data).toHaveProperty('error');
		expect(typeof data.error).toBe('string');
		expect(data.error.length).toBeGreaterThan(0);
	}

	/**
	 * Extract ID from created resource
	 */
	static extractId(response: any): string {
		expect(response).toHaveProperty('id');
		return response.id;
	}

	/**
	 * Validate timestamp format (ISO 8601)
	 */
	static validateTimestamp(timestamp: string) {
		const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
		expect(timestamp).toMatch(isoDateRegex);

		const date = new Date(timestamp);
		expect(date.toString()).not.toBe('Invalid Date');
	}

	/**
	 * Wait for a specified duration (for rate limiting tests)
	 */
	static async wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
