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

/**
 * Helper function to add a delay (useful for video recording to see board appear/disappear)
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe('Trello Full Workflow - Self-Cleaning Tests', () => {
	test.beforeAll(async () => {
		// Verify we have the required credentials
		expect(trelloConfig.apiKey).toBeTruthy();
		expect(trelloConfig.token).toBeTruthy();
	});

	test('should create board, list, and card with automatic cleanup on success', async () => {
		let boardId: string | null = null;
		let boardName: string = '';

		try {
			// Step 1: Create Board
			console.log('📋 Step 1: Creating Trello board...');
			boardName = generateUniqueBoardName();
			const board = await createBoard(boardName, 'A test board created via API - Full Workflow Test');
			boardId = board.id;
			console.log(`✅ Board created: ${board.name} (ID: ${board.id})`);
			console.log(`🔗 View board: https://trello.com/b/${board.id}`);
			
			expect(board).toBeDefined();
			expect(board.id).toBeTruthy();
			expect(board.name).toBe(boardName);

			// Step 2: Create List
			console.log('\n📋 Step 2: Creating list on board...');
			const listName = generateUniqueListName();
			const list = await createList(boardId, listName);
			console.log(`✅ List created: ${list.name} (ID: ${list.id})`);
			
			expect(list).toBeDefined();
			expect(list.id).toBeTruthy();
			expect(list.name).toBe(listName);
			expect(list.idBoard).toBe(boardId);

			// Step 3: Create Card
			console.log('\n📋 Step 3: Creating card on list...');
			const cardName = generateUniqueCardName();
			const cardDescription = 'This card was created via the Trello API - Full Workflow Test';
			const card = await createCard(list.id, cardName, cardDescription);
			console.log(`✅ Card created: ${card.name} (ID: ${card.id})`);
			
			expect(card).toBeDefined();
			expect(card.id).toBeTruthy();
			expect(card.name).toBe(cardName);
			expect(card.idList).toBe(list.id);

			// Verify the complete workflow
			console.log('\n✅ Success! Complete workflow executed: Board → List → Card');
			
			// Verify board still exists and contains our data
			const retrievedBoard = await getBoard(boardId);
			expect(retrievedBoard.id).toBe(boardId);
			expect(retrievedBoard.name).toBe(boardName);

			// Add a delay to make it easier to see the board in Trello before cleanup
			// This is especially useful for video recording
			// Adjust the delay (in milliseconds) if you need more/less time to see the board
			console.log('\n⏳ Waiting 3 seconds before cleanup (for video recording)...');
			console.log(`   💡 Tip: Open https://trello.com/b/${boardId} in your browser now to see the board!`);
			await delay(4000);

		} finally {
			// Cleanup: Always delete the board, even if test fails
			if (boardId) {
				try {
					console.log(`\n🧹 Cleaning up: Deleting board ${boardId}...`);
					await deleteBoard(boardId);
					console.log(`✅ Cleanup successful: Board ${boardId} deleted`);
					
					// Verify deletion by attempting to retrieve the board (should fail)
					try {
						await getBoard(boardId);
						console.warn('⚠️ Warning: Board still exists after deletion attempt');
					} catch (error) {
						console.log('✅ Verification: Board successfully deleted (retrieval failed as expected)');
					}
				} catch (error) {
					console.error(`❌ Cleanup failed for board ${boardId}:`, error);
					// Re-throw to ensure test fails if cleanup fails
					throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		}
	});

	test('should cleanup even if card creation fails', async () => {
		let boardId: string | null = null;
		let listId: string | null = null;

		try {
			// Step 1: Create Board
			console.log('📋 Step 1: Creating Trello board...');
			const boardName = generateUniqueBoardName();
			const board = await createBoard(boardName, 'Test board for failure scenario');
			boardId = board.id;
			console.log(`✅ Board created: ${board.name} (ID: ${board.id})`);

			// Step 2: Create List
			console.log('\n📋 Step 2: Creating list on board...');
			const listName = generateUniqueListName();
			const list = await createList(boardId, listName);
			listId = list.id;
			console.log(`✅ List created: ${list.name} (ID: ${list.id})`);

			// Step 3: Simulate failure during card creation
			console.log('\n📋 Step 3: Simulating card creation failure...');
			// Force an error by using an invalid list ID
			await expect(
				createCard('invalid-list-id', generateUniqueCardName(), 'This should fail')
			).rejects.toThrow();
			
			console.log('✅ Simulated failure occurred as expected');

		} finally {
			// Cleanup: Should still delete board even though card creation "failed"
			if (boardId) {
				try {
					console.log(`\n🧹 Cleaning up after failure: Deleting board ${boardId}...`);
					await deleteBoard(boardId);
					console.log(`✅ Cleanup successful: Board ${boardId} deleted despite test failure`);
				} catch (error) {
					console.error(`❌ Cleanup failed for board ${boardId}:`, error);
					throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		}
	});

	test('should cleanup even if list creation fails', async () => {
		let boardId: string | null = null;

		try {
			// Step 1: Create Board
			console.log('📋 Step 1: Creating Trello board...');
			const boardName = generateUniqueBoardName();
			const board = await createBoard(boardName, 'Test board for list creation failure');
			boardId = board.id;
			console.log(`✅ Board created: ${board.name} (ID: ${board.id})`);

			// Step 2: Simulate failure during list creation
			console.log('\n📋 Step 2: Simulating list creation failure...');
			// Force an error by using an invalid board ID
			await expect(
				createList('invalid-board-id', generateUniqueListName())
			).rejects.toThrow();
			
			console.log('✅ Simulated failure occurred as expected');

		} finally {
			// Cleanup: Should still delete board even though list creation failed
			if (boardId) {
				try {
					console.log(`\n🧹 Cleaning up after failure: Deleting board ${boardId}...`);
					await deleteBoard(boardId);
					console.log(`✅ Cleanup successful: Board ${boardId} deleted despite test failure`);
				} catch (error) {
					console.error(`❌ Cleanup failed for board ${boardId}:`, error);
					throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		}
	});

	test('should handle multiple sequential workflow executions with cleanup', async () => {
		const workflows = 3;
		const createdBoards: string[] = [];

		try {
			for (let i = 1; i <= workflows; i++) {
				let boardId: string | null = null;
				
				try {
					console.log(`\n🔄 Workflow ${i}/${workflows}: Starting...`);
					
					// Create Board
					const boardName = generateUniqueBoardName();
					const board = await createBoard(boardName, `Workflow ${i} test board`);
					boardId = board.id;
					createdBoards.push(boardId);
					console.log(`✅ Workflow ${i}: Board created (ID: ${board.id})`);

					// Create List
					const list = await createList(boardId, generateUniqueListName());
					console.log(`✅ Workflow ${i}: List created (ID: ${list.id})`);

					// Create Card
					const card = await createCard(list.id, generateUniqueCardName());
					console.log(`✅ Workflow ${i}: Card created (ID: ${card.id})`);

					// Immediately cleanup this workflow
					console.log(`🧹 Workflow ${i}: Cleaning up...`);
					await deleteBoard(boardId);
					console.log(`✅ Workflow ${i}: Cleanup complete`);
					
					// Remove from tracking since it's already cleaned up
					createdBoards.pop();

				} catch (error) {
					console.error(`❌ Workflow ${i} failed:`, error);
					// Keep boardId in createdBoards for final cleanup
					if (boardId) {
						createdBoards.push(boardId);
					}
					throw error;
				}
			}

			console.log(`\n✅ All ${workflows} workflows completed successfully`);

		} finally {
			// Final cleanup: Delete any remaining boards
			for (const boardId of createdBoards) {
				try {
					console.log(`🧹 Final cleanup: Deleting board ${boardId}...`);
					await deleteBoard(boardId);
					console.log(`✅ Final cleanup: Board ${boardId} deleted`);
				} catch (error) {
					console.error(`❌ Final cleanup failed for board ${boardId}:`, error);
				}
			}
		}
	});
});
