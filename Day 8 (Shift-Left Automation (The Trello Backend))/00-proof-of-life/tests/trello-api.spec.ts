import { test, expect } from '@playwright/test';
import { trelloConfig } from '../src/config/env';
import {
	createBoard,
	createList,
	createCard,
	deleteBoard,
	getBoard,
	getCard,
} from '../src/utils/trello-api';
import {
	generateUniqueBoardName,
	generateUniqueListName,
	generateUniqueCardName,
} from '../src/utils/test-helpers';

test.describe('Trello API Tests', () => {
	let boardId: string;
	let listId: string;
	let cardId: string;

	test.beforeAll(async () => {
		// Verify we have the required credentials
		expect(trelloConfig.apiKey).toBeTruthy();
		expect(trelloConfig.token).toBeTruthy();
	});

	test('should create a board', async ({ request }) => {
		const boardName = generateUniqueBoardName();
		const board = await createBoard(boardName, 'Test board description');

		expect(board).toBeDefined();
		expect(board.id).toBeTruthy();
		expect(board.name).toBe(boardName);
		boardId = board.id;
	});

	test('should create a list on a board', async ({ request }) => {
		// Create a board first if we don't have one
		if (!boardId) {
			const board = await createBoard(generateUniqueBoardName());
			boardId = board.id;
		}

		const listName = generateUniqueListName();
		const list = await createList(boardId, listName);

		expect(list).toBeDefined();
		expect(list.id).toBeTruthy();
		expect(list.name).toBe(listName);
		expect(list.idBoard).toBe(boardId);
		listId = list.id;
	});

	test('should create a card on a list', async ({ request }) => {
		// Create board and list first if needed
		if (!boardId) {
			const board = await createBoard(generateUniqueBoardName());
			boardId = board.id;
		}
		if (!listId) {
			const list = await createList(boardId, generateUniqueListName());
			listId = list.id;
		}

		const cardName = generateUniqueCardName();
		const cardDescription = 'This is a test card created via API';
		const card = await createCard(listId, cardName, cardDescription);

		expect(card).toBeDefined();
		expect(card.id).toBeTruthy();
		expect(card.name).toBe(cardName);
		expect(card.idList).toBe(listId);
		cardId = card.id;
	});

	test('should retrieve a board by ID', async ({ request }) => {
		// Create a board first
		const boardName = generateUniqueBoardName();
		const createdBoard = await createBoard(boardName);
		boardId = createdBoard.id;

		// Retrieve it
		const retrievedBoard = await getBoard(boardId);

		expect(retrievedBoard).toBeDefined();
		expect(retrievedBoard.id).toBe(boardId);
		expect(retrievedBoard.name).toBe(boardName);

		// Cleanup
		await deleteBoard(boardId);
	});

	test('should retrieve a card by ID', async ({ request }) => {
		// Create board, list, and card
		const board = await createBoard(generateUniqueBoardName());
		const list = await createList(board.id, generateUniqueListName());
		const cardName = generateUniqueCardName();
		const createdCard = await createCard(list.id, cardName);

		// Retrieve it
		const retrievedCard = await getCard(createdCard.id);

		expect(retrievedCard).toBeDefined();
		expect(retrievedCard.id).toBe(createdCard.id);
		expect(retrievedCard.name).toBe(cardName);

		// Cleanup
		await deleteBoard(board.id);
	});

	test('should create a complete board with list and card', async ({ request }) => {
		// Create board
		const boardName = generateUniqueBoardName();
		const board = await createBoard(boardName, 'End-to-end test board');
		boardId = board.id;

		// Create list
		const listName = 'To Do';
		const list = await createList(boardId, listName);
		listId = list.id;

		// Create card
		const cardName = 'Test Task';
		const cardDescription = 'This is a test task';
		const card = await createCard(listId, cardName, cardDescription);
		cardId = card.id;

		// Verify everything was created
		expect(board.id).toBeTruthy();
		expect(list.id).toBeTruthy();
		expect(card.id).toBeTruthy();

		// Verify relationships
		expect(list.idBoard).toBe(boardId);
		expect(card.idList).toBe(listId);

		// Cleanup
		await deleteBoard(boardId);
	});

	test.afterEach(async () => {
		// Cleanup: delete the board if it exists
		// This will also delete all lists and cards on the board
		if (boardId) {
			try {
				await deleteBoard(boardId);
			} catch (error) {
				console.warn(`Failed to cleanup board ${boardId}:`, error);
			}
			boardId = '';
			listId = '';
			cardId = '';
		}
	});
});
