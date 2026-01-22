import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Trello Workspace Page
 * Shows list of boards in a workspace
 */
export class WorkspacePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Navigate to workspace page
	 * @param workspaceId - The workspace ID (e.g., 'userworkspace48327296')
	 */
	async goto(workspaceId: string) {
		await this.page.goto(`https://trello.com/w/${workspaceId}`, { waitUntil: 'networkidle' });
	}

	/**
	 * Get a board link by its name
	 * @param boardName - The name of the board to find
	 * @returns Locator for the board link
	 */
	getBoardLink(boardName: string): Locator {
		return this.page.getByRole('link', { name: boardName });
	}

	/**
	 * Check if a board exists in the workspace
	 * @param boardName - The name of the board to check
	 * @returns true if board exists, false otherwise
	 */
	async boardExists(boardName: string): Promise<boolean> {
		try {
			const boardLink = this.getBoardLink(boardName);
			await boardLink.waitFor({ state: 'visible', timeout: 5000 });
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
		await expect(boardLink).toBeVisible({ timeout: 10000 });
		console.log(`✅ Board "${boardName}" found in workspace`);
	}

	/**
	 * Click on a board to open it
	 * @param boardName - The name of the board to open
	 */
	async openBoard(boardName: string) {
		const boardLink = this.getBoardLink(boardName);
		await boardLink.click();
		await this.page.waitForLoadState('networkidle');
		console.log(`✅ Opened board "${boardName}"`);
	}

	/**
	 * Wait for workspace to load
	 */
	async waitForLoad() {
		// Wait for boards to be visible (boards container or any board link)
		await this.page.waitForSelector('[data-testid="board-tile"], [href*="/b/"]', { timeout: 10000 });
	}
}
