// src/utils/test-setup-helpers.ts
import {
	createBoard,
	createList,
	createCard,
	deleteBoard,
} from './trello-api';
import {
	generateUniqueBoardName,
	generateUniqueListName,
	generateUniqueCardName,
} from './test-helpers';

/**
 * Test data type for board setup
 */
export type BoardTestData = {
	boardId: string;
	boardName: string;
	listId?: string;
	listName?: string;
	cardId?: string;
	cardName?: string;
};

/**
 * Setup: Create a board via API (fast)
 * Returns cleanup function
 */
export async function setupBoard(
	description = 'Test board'
): Promise<[BoardTestData, () => Promise<void>]> {
	const boardName = generateUniqueBoardName();
	const board = await createBoard(boardName, description);
	
	console.log(`📋 API Setup: Created board "${boardName}" (${board.id})`);
	
	const testData: BoardTestData = {
		boardId: board.id,
		boardName: board.name,
	};
	
	// Return data + cleanup function
	const cleanup = async () => {
		console.log(`🧹 API Cleanup: Deleting board ${board.id}...`);
		await deleteBoard(board.id);
		console.log(`✅ API Cleanup: Board deleted`);
	};
	
	return [testData, cleanup];
}

/**
 * Setup: Create a board + list via API (fast)
 */
export async function setupBoardWithList(
	description = 'Test board with list'
): Promise<[BoardTestData, () => Promise<void>]> {
	const [boardData, cleanupBoard] = await setupBoard(description);
	
	const listName = generateUniqueListName();
	const list = await createList(boardData.boardId, listName);
	
	console.log(`📋 API Setup: Created list "${listName}" (${list.id})`);
	
	const testData: BoardTestData = {
		...boardData,
		listId: list.id,
		listName: list.name,
	};
	
	return [testData, cleanupBoard]; // Cleanup is same (delete board)
}

/**
 * Setup: Create a board + list + card via API (fast)
 */
export async function setupBoardWithListAndCard(
	description = 'Test board with list and card'
): Promise<[BoardTestData, () => Promise<void>]> {
	const [boardData, cleanupBoard] = await setupBoardWithList(description);
	
	if (!boardData.listId) {
		throw new Error('List was not created');
	}
	
	const cardName = generateUniqueCardName();
	const card = await createCard(
		boardData.listId,
		cardName,
		'Card created via API for testing'
	);
	
	console.log(`📋 API Setup: Created card "${cardName}" (${card.id})`);
	
	const testData: BoardTestData = {
		...boardData,
		cardId: card.id,
		cardName: card.name,
	};
	
	return [testData, cleanupBoard];
}