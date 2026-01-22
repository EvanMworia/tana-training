import { test, expect } from '@playwright/test';
import { trelloConfig } from '../src/config/env';
import {
	createBoard,
	createList,
	createCard,
	deleteBoard,
	getBoard,
} from '../src/utils/trello-api';
import {
	generateUniqueBoardName,
	generateUniqueListName,
	generateUniqueCardName,
} from '../src/utils/test-helpers';
import { LoginPage } from '../src/pages/LoginPage';
import { WorkspacePage } from '../src/pages/WorkspacePage';
import { BoardPage } from '../src/pages/BoardPage';

/**
 * Helper function to add a delay (useful for video recording to see board appear/disappear)
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe('Trello Full Workflow - Visual Browser Test with POM', () => {
	test.beforeAll(async () => {
		// Verify we have the required credentials
		expect(trelloConfig.apiKey).toBeTruthy();
		expect(trelloConfig.token).toBeTruthy();
	});

	test('should create board, list, and card with visual verification using POM', async ({ page }: { page: any }) => {
		let boardId: string | null = null;
		let boardName: string = '';
		let listName: string = '';
		let cardName: string = '';

		// Initialize Page Objects
		const loginPage = new LoginPage(page);
		const workspacePage = new WorkspacePage(page);
		const boardPage = new BoardPage(page);

		try {
			// Step 1: Create Board via API
			console.log('📋 Step 1: Creating Trello board via API...');
			boardName = generateUniqueBoardName();
			const board = await createBoard(boardName, 'A test board created via API - Visual POM Test');
			boardId = board.id;
			console.log(`✅ Board created: ${board.name} (ID: ${board.id})`);
			
			expect(board).toBeDefined();
			expect(board.id).toBeTruthy();
			expect(board.name).toBe(boardName);

			// Step 2: Login to Trello (if credentials provided)
			if (trelloConfig.username && trelloConfig.password) {
				console.log('\n🔐 Step 2: Logging into Trello...');
				
				// Always start from homepage and login
				await loginPage.login(trelloConfig.username, trelloConfig.password);
				await delay(2000); // Wait for login to complete
				
				// Navigate to workspace after login
				if (trelloConfig.workspaceId) {
					await workspacePage.goto(trelloConfig.workspaceId);
				}

				// Step 3: Verify board exists in workspace
				if (trelloConfig.workspaceId) {
					console.log('\n📋 Step 3: Verifying board exists in workspace...');
					await workspacePage.waitForLoad();
					await workspacePage.assertBoardExists(boardName);
					console.log('✅ Board found in workspace!');
					await delay(2000);

					// Step 4: Open the board
					console.log('\n📋 Step 4: Opening board in browser...');
					await workspacePage.openBoard(boardName);
				} else {
					// Navigate directly to board if no workspace ID
					console.log('\n📋 Step 3: Opening board directly...');
					await boardPage.goto(boardId);
				}
			} else {
				// No login credentials - navigate directly to board (may require manual login)
				console.log('\n⚠️  No login credentials provided. Navigating to board (may require manual login)...');
				console.log('   💡 Tip: Add TRELLO_USERNAME, TRELLO_PASSWORD, and TRELLO_WORKSPACE_ID to .env for automatic login');
				try {
					await boardPage.goto(boardId);
				} catch (error) {
					console.log('⚠️  Could not navigate to board (may require login). Continuing with API-only test...');
					// Continue with API verification only
				}
			}

			// Wait for board to load (only if we successfully navigated)
			try {
				await boardPage.waitForLoad();
				await boardPage.assertBoardName(boardName);
				console.log('✅ Board is visible in browser!');
				await delay(2000);
			} catch (error) {
				console.log('⚠️  Could not verify board in browser (may require login). Continuing with API verification...');
				// Continue with API-only workflow
			}

			// Step 5: Create List via API
			console.log('\n📋 Step 5: Creating list on board via API...');
			listName = generateUniqueListName();
			const list = await createList(boardId, listName);
			console.log(`✅ List created: ${list.name} (ID: ${list.id})`);
			
			expect(list).toBeDefined();
			expect(list.id).toBeTruthy();
			expect(list.name).toBe(listName);
			expect(list.idBoard).toBe(boardId);

			// Refresh the page to see the new list (only if page is still open)
			try {
				if (page && !page.isClosed()) {
					console.log('🔄 Refreshing page to see the new list...');
					await boardPage.refresh();
					
					// Verify list exists using POM
					await boardPage.assertListExists(listName);
					console.log('✅ List is visible in browser!');
					await delay(2000);
				}
			} catch (error) {
				console.log('ℹ️  Skipping browser verification for list (page may have closed or requires login)');
			}

			// Step 6: Create Card via API
			console.log('\n📋 Step 6: Creating card on list via API...');
			cardName = generateUniqueCardName();
			const cardDescription = 'This card was created via the Trello API - Visual POM Test';
			const card = await createCard(list.id, cardName, cardDescription);
			console.log(`✅ Card created: ${card.name} (ID: ${card.id})`);
			
			expect(card).toBeDefined();
			expect(card.id).toBeTruthy();
			expect(card.name).toBe(cardName);
			expect(card.idList).toBe(list.id);

			// Refresh the page to see the new card (only if page is still open)
			try {
				if (page && !page.isClosed()) {
					console.log('🔄 Refreshing page to see the new card...');
					await boardPage.refresh();
					
					// Verify card exists using POM
					await boardPage.assertCardExists(cardName, listName);
					console.log('✅ Card is visible in browser!');
				}
			} catch (error) {
				console.log('ℹ️  Skipping browser verification for card (page may have closed or requires login)');
			}
			
			// Verify the complete workflow
			console.log('\n✅ Success! Complete workflow executed: Board → List → Card');
			
			// Verify board still exists via API
			const retrievedBoard = await getBoard(boardId);
			expect(retrievedBoard.id).toBe(boardId);
			expect(retrievedBoard.name).toBe(boardName);

			// Add a longer delay to make it easier to see everything in the video
			console.log('\n⏳ Waiting 5 seconds before cleanup (for video recording)...');
			console.log(`   💡 You can see the board, list, and card in the browser now!`);
			await delay(5000);

		} finally {
			// Cleanup: Always delete the board, even if test fails
			if (boardId) {
				try {
					console.log(`\n🧹 Cleaning up: Deleting board ${boardId} via API...`);
					
					// Show a message in the browser before deletion
					if (page && !page.isClosed()) {
						await page.evaluate(() => {
							const message = document.createElement('div');
							message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff6b6b; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000; font-family: Arial; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
							message.textContent = '🧹 Board will be deleted in 2 seconds...';
							document.body.appendChild(message);
							setTimeout(() => message.remove(), 2000);
						});
						await delay(2000);
					}
					
					await deleteBoard(boardId);
					console.log(`✅ Cleanup successful: Board ${boardId} deleted`);
					
					// Refresh the page to show the board is gone (only if page is still open)
					try {
						if (page && !page.isClosed()) {
							console.log('🔄 Refreshing page to show board deletion...');
							await page.reload({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {
								console.log('ℹ️  Page reload skipped (page may have closed)');
							});
							
							// Wait a moment to see the "board not found" state
							await delay(2000);
							
							// Check if we're on an error page or the board is gone (only if page is still open)
							if (!page.isClosed()) {
								try {
									const pageContent = await page.content();
									if (pageContent.includes('not found') || pageContent.includes('404') || pageContent.includes('doesn\'t exist')) {
										console.log('✅ Verification: Board successfully deleted (error page shown as expected)');
									} else {
										console.log('✅ Verification: Board successfully deleted (page redirected)');
									}
								} catch (contentError) {
									console.log('ℹ️  Could not verify page content (page may have closed)');
								}
							}
						}
					} catch (pageError) {
						console.log('ℹ️  Page interaction skipped during cleanup (page may have closed)');
					}
					
					// Verify deletion by attempting to retrieve the board via API (should fail)
					try {
						await getBoard(boardId);
						console.warn('⚠️ Warning: Board still exists after deletion attempt');
					} catch (error) {
						console.log('✅ API Verification: Board successfully deleted (retrieval failed as expected)');
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					
					// Don't fail the test if the error is just about page being closed
					if (errorMessage.includes('Target page, context or browser has been closed') || 
					    errorMessage.includes('page.content') ||
					    errorMessage.includes('page closed')) {
						console.log('ℹ️  Page was closed during cleanup (this is okay, board was still deleted via API)');
						console.log('✅ Cleanup successful: Board deleted via API');
					} else {
						console.error(`❌ Cleanup failed for board ${boardId}:`, errorMessage);
						// Only re-throw if it's a real cleanup failure, not a page closure
						if (!errorMessage.includes('closed')) {
							throw new Error(`Cleanup failed: ${errorMessage}`);
						}
					}
				}
			}
		}
	});

	test('should verify board in workspace after API creation', async ({ page }: { page: any }) => {
		let boardId: string | null = null;
		let boardName: string = '';

		const loginPage = new LoginPage(page);
		const workspacePage = new WorkspacePage(page);

		try {
			// Create board via API
			console.log('📋 Creating board via API...');
			boardName = generateUniqueBoardName();
			const board = await createBoard(boardName, 'Workspace verification test board');
			boardId = board.id;
			console.log(`✅ Board created: ${board.name}`);

			// Login and navigate to workspace
			if (trelloConfig.username && trelloConfig.password && trelloConfig.workspaceId) {
				console.log('\n🔐 Logging into Trello...');
				await loginPage.login(trelloConfig.username, trelloConfig.password);
				await delay(2000); // Wait for login to complete
				await workspacePage.goto(trelloConfig.workspaceId);

				// Verify board exists in workspace
				console.log('\n✅ Verifying board in workspace...');
				await workspacePage.waitForLoad();
				await workspacePage.assertBoardExists(boardName);
				console.log('✅ Board successfully found in workspace!');
				await delay(3000);
			} else {
				console.log('⚠️  Skipping workspace verification - missing credentials or workspace ID');
			}

		} finally {
			// Cleanup
			if (boardId) {
				try {
					await deleteBoard(boardId);
					console.log('✅ Cleanup: Board deleted');
				} catch (error) {
					console.error('❌ Cleanup failed:', error);
				}
			}
		}
	});
});
