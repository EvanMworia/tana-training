import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Trello Board Page
 * Represents a single board view with lists and cards
 */
export class BoardPage {
	readonly page: Page;
	readonly boardNameDisplay: Locator;
	readonly listComposerButton: Locator;
	readonly listNameInput: Locator;
	readonly addListButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.boardNameDisplay = page.locator('[data-testid="board-name-display"]').or(page.locator('h1'));
		this.listComposerButton = page.getByTestId('list-composer-button');
		this.listNameInput = page.getByRole('textbox', { name: 'Enter list name…' });
		this.addListButton = page.getByTestId('list-composer-add-list-button');
	}

	/**
	 * Navigate to a board
	 * @param boardId - The board ID
	 */
	async goto(boardId: string) {
		await this.page.goto(`https://trello.com/b/${boardId}`, { waitUntil: 'networkidle' });
	}

	/**
	 * Wait for board to load
	 */
	async waitForLoad() {
		await this.boardNameDisplay.waitFor({ state: 'visible', timeout: 10000 });
	}

	/**
	 * Get the board name displayed on the page
	 */
	async getBoardName(): Promise<string> {
		return await this.boardNameDisplay.textContent() || '';
	}

	/**
	 * Assert that the board name matches expected name
	 * @param expectedName - The expected board name
	 */
	async assertBoardName(expectedName: string) {
		await expect(this.boardNameDisplay).toContainText(expectedName, { timeout: 10000 });
		console.log(`✅ Board name verified: "${expectedName}"`);
	}

	/**
	 * Get a list by its name
	 * @param listName - The name of the list
	 * @returns Locator for the list
	 */
	getList(listName: string): Locator {
		return this.page.getByRole('region', { name: new RegExp(listName, 'i') })
			.or(this.page.locator(`[data-testid="list"]:has-text("${listName}")`))
			.or(this.page.locator(`.list:has-text("${listName}")`));
	}

	/**
	 * Check if a list exists on the board
	 * @param listName - The name of the list to check
	 * @returns true if list exists, false otherwise
	 */
	async listExists(listName: string): Promise<boolean> {
		try {
			const list = this.getList(listName);
			await list.waitFor({ state: 'visible', timeout: 5000 });
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Assert that a list exists on the board
	 * @param listName - The name of the list to verify
	 */
	async assertListExists(listName: string) {
		const list = this.getList(listName);
		await expect(list).toBeVisible({ timeout: 10000 });
		console.log(`✅ List "${listName}" found on board`);
	}

	/**
	 * Get the "Add a card" button for a specific list
	 * @param listName - The name of the list
	 * @returns Locator for the add card button
	 */
	getAddCardButton(listName: string): Locator {
		return this.page.getByRole('button', { name: new RegExp(`Add a card.*${listName}`, 'i') });
	}

	/**
	 * Get the card composer textarea
	 */
	getCardComposerTextarea(): Locator {
		return this.page.getByTestId('list-card-composer-textarea');
	}

	/**
	 * Get the add card button in the composer
	 */
	getAddCardComposerButton(): Locator {
		return this.page.getByTestId('list-card-composer-add-card-button');
	}

	/**
	 * Check if a card exists in a list
	 * @param cardName - The name of the card
	 * @param listName - The name of the list (optional, for more specific search)
	 * @returns true if card exists, false otherwise
	 */
	async cardExists(cardName: string, listName?: string): Promise<boolean> {
		try {
			let cardLocator: Locator;
			
			if (listName) {
				// Search within a specific list
				const list = this.getList(listName);
				cardLocator = list.getByRole('link', { name: cardName });
			} else {
				// Search anywhere on the board
				cardLocator = this.page.getByRole('link', { name: cardName });
			}
			
			await cardLocator.waitFor({ state: 'visible', timeout: 5000 });
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Assert that a card exists on the board
	 * @param cardName - The name of the card to verify
	 * @param listName - Optional: The name of the list to search in
	 */
	async assertCardExists(cardName: string, listName?: string) {
		let cardLocator: Locator;
		
		if (listName) {
			const list = this.getList(listName);
			cardLocator = list.getByRole('link', { name: cardName });
		} else {
			cardLocator = this.page.getByRole('link', { name: cardName });
		}
		
		await expect(cardLocator).toBeVisible({ timeout: 10000 });
		console.log(`✅ Card "${cardName}" found${listName ? ` in list "${listName}"` : ' on board'}`);
	}

	/**
	 * Refresh the page to see latest changes
	 */
	async refresh() {
		await this.page.reload({ waitUntil: 'networkidle' });
		await this.waitForLoad();
	}
}
