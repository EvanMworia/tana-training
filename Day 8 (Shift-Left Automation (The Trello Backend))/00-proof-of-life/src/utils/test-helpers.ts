import { randomUUID } from 'crypto';

/**
 * Generates a unique name for test data (boards, lists, cards, etc.)
 * Uses UUID to ensure uniqueness even in parallel CI environments
 * 
 * @param prefix - The prefix for the name (e.g., "Test Board", "Test List")
 * @returns A unique name string (e.g., "Test Board 550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUniqueName(prefix: string): string {
	const uuid = randomUUID();
	return `${prefix} ${uuid}`;
}

/**
 * Generates a unique board name for testing
 */
export function generateUniqueBoardName(): string {
	return generateUniqueName('Test Board');
}

/**
 * Generates a unique list name for testing
 */
export function generateUniqueListName(): string {
	return generateUniqueName('Test List');
}

/**
 * Generates a unique card name for testing
 */
export function generateUniqueCardName(): string {
	return generateUniqueName('Test Card');
}
