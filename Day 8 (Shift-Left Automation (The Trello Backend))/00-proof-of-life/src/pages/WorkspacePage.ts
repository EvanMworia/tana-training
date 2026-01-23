// src/pages/WorkspacePage.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Trello Workspace/User Boards Page
 * Shows list of boards for a user
 */
export class WorkspacePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Navigate to user's boards page
	 * @param usernameOrWorkspaceId - Trello username (e.g., 'evansgithinji1') or workspace ID
	 */
	async goto(usernameOrWorkspaceId: string) {
		// Try the user boards URL format first (more common)
		await this.page.goto(`https://trello.com/u/${usernameOrWorkspaceId}/boards`, {
			waitUntil: 'load',
			timeout: 60000,
		});
		await this.waitForLoad();
	}

	/**
	 * Navigate to workspace page (alternative format)
	 */
	// async gotoWorkspace(workspaceId: string) {
	// 	await this.page.goto(`https://trello.com/w/${workspaceId}`, {
	// 		waitUntil: 'load',
	// 		timeout: 60000,
	// 	});
	// 	await this.waitForLoad();
	// }

	/**
	 * Get a board link by its name
	 * @param boardName - The name of the board to find
	 * @returns Locator for the board link
	 */
	getBoardLink(boardName: string): Locator {
		// More flexible selector that works on both URL formats
		return this.page.getByRole('link', { name: new RegExp(boardName, 'i') }).first();
	}

	/**
	 * Check if a board exists in the workspace
	 * @param boardName - The name of the board to check
	 * @returns true if board exists, false otherwise
	 */
	async boardExists(boardName: string): Promise<boolean> {
		try {
			const boardLink = this.getBoardLink(boardName);
			await boardLink.waitFor({ state: 'visible', timeout: 10000 });
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Assert that a board exists in the workspace
	 * @param boardName - The name of the board to verify
	 */
	async assertBoardExists(boardName: string) {
		const boardLink = this.getBoardLink(boardName);
		await expect(boardLink).toBeVisible({ timeout: 15000 });
		console.log(`✅ Board "${boardName}" found in workspace`);
	}

	/**
	 * Click on a board to open it
	 * @param boardName - The name of the board to open
	 */
	async openBoard(boardName: string) {
		const boardLink = this.getBoardLink(boardName);
		await boardLink.click();
		await this.page.waitForLoadState('load', { timeout: 60000 });
		console.log(`✅ Opened board "${boardName}"`);
	}

	/**
	 * Wait for workspace to load
	 */
	async waitForLoad() {
		// Wait for ANY board link to be visible (works on both page formats)
		// This is more reliable than waiting for specific test IDs
		await this.page.locator('[href*="/b/"]').first().waitFor({
			state: 'visible',
			timeout: 30000,
		});
		console.log('✅ Boards page loaded');
	}
}
