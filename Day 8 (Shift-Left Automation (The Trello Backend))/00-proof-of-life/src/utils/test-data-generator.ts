// src/utils/test-data-generator.ts
import { randomUUID } from 'crypto';
import { NastyString } from '../data/nasty-strings';

/**
 * Generate a unique identifier for test data
 */
export function generateTestId(): string {
	return randomUUID().substring(0, 8);
}

/**
 * Create a test card name from a nasty string
 * Includes a unique ID to ensure we can find it
 */
export function createTestCardName(nastyString: NastyString): string {
	const testId = generateTestId();
	// Format: [ID] NastyString
	return `[${testId}] ${nastyString.value}`;
}

/**
 * Create a test list name from a nasty string
 */
export function createTestListName(nastyString: NastyString): string {
	const testId = generateTestId();
	return `[${testId}] ${nastyString.value}`;
}

/**
 * Create a test board name from a nasty string
 */
export function createTestBoardName(nastyString: NastyString): string {
	const testId = generateTestId();
	return `[${testId}] ${nastyString.value}`;
}

/**
 * Extract the test ID from a generated name
 */
export function extractTestId(name: string): string | null {
	const match = name.match(/\[([a-f0-9-]+)\]/);
	return match ? match[1] : null;
}
