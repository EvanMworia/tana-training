// tests/trello-hybrid.spec.ts
import { test, expect } from '../src/fixtures/trello-fixtures';
import { WorkspacePage } from '../src/pages/WorkspacePage';
import { BoardPage } from '../src/pages/BoardPage';
import {
	setupBoard,
	setupBoardWithList,
	setupBoardWithListAndCard,
} from '../src/utils/test-setup-helpers';
import { trelloConfig } from '../src/config/env';

test.describe('Trello Hybrid Tests - API Setup + UI Validation', () => {
	
	test('should verify API-created board appears in workspace', async ({ authenticatedPage }) => {
		// SETUP via API (fast)
		const [testData, cleanup] = await setupBoard('Workspace visibility test');
		
		try {
			// VALIDATION via UI (necessary check)
			const workspacePage = new WorkspacePage(authenticatedPage);
			
			if (trelloConfig.workspaceId) {
				await workspacePage.goto(trelloConfig.workspaceId);
				await workspacePage.waitForLoad();
				
				// Assert the board appears in workspace
				await workspacePage.assertBoardExists(testData.boardName);
			} else {
				throw new Error('TRELLO_WORKSPACE_ID required for workspace tests');
			}
			
		} finally {
			// CLEANUP via API (fast)
			await cleanup();
		}
	});
	
	test('should verify API-created list appears on board', async ({ authenticatedPage }) => {
		// SETUP via API (fast)
		const [testData, cleanup] = await setupBoardWithList('List visibility test');
		
		try {
			// VALIDATION via UI (necessary check)
			const boardPage = new BoardPage(authenticatedPage);
			await boardPage.goto(testData.boardId);
			await boardPage.waitForLoad();
			
			// Assert board name is correct
			await boardPage.assertBoardName(testData.boardName);
			
			// Assert list appears on board
			if (testData.listName) {
				await boardPage.assertListExists(testData.listName);
			}
			
		} finally {
			// CLEANUP via API (fast)
			await cleanup();
		}
	});
	
	test('should verify API-created card appears in list', async ({ authenticatedPage }) => {
		// SETUP via API (fast)
		const [testData, cleanup] = await setupBoardWithListAndCard('Card visibility test');
		
		try {
			// VALIDATION via UI (necessary check)
			const boardPage = new BoardPage(authenticatedPage);
			await boardPage.goto(testData.boardId);
			await boardPage.waitForLoad();
			
			// Assert board exists
			await boardPage.assertBoardName(testData.boardName);
			
			// Assert list exists
			if (testData.listName) {
				await boardPage.assertListExists(testData.listName);
			}
			
			// Assert card exists in the list
			if (testData.cardName && testData.listName) {
				await boardPage.assertCardExists(testData.cardName, testData.listName);
			}
			
		} finally {
			// CLEANUP via API (fast)
			await cleanup();
		}
	});
	
	test('should verify complete workflow: board → list → card', async ({ authenticatedPage }) => {
		// SETUP via API (fast - creates everything at once)
		const [testData, cleanup] = await setupBoardWithListAndCard('Complete workflow test');
		
		try {
			// VALIDATION via UI (single navigation, multiple assertions)
			const boardPage = new BoardPage(authenticatedPage);
			await boardPage.goto(testData.boardId);
			await boardPage.waitForLoad();
			
			// Verify all elements in one page load
			await boardPage.assertBoardName(testData.boardName);
			
			if (testData.listName) {
				await boardPage.assertListExists(testData.listName);
			}
			
			if (testData.cardName && testData.listName) {
				await boardPage.assertCardExists(testData.cardName, testData.listName);
			}
			
			console.log('✅ UI Validation: Board, List, and Card all visible');
			
		} finally {
			// CLEANUP via API (fast)
			await cleanup();
		}
	});
});


