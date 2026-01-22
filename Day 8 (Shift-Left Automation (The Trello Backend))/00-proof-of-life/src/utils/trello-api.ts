import { trelloConfig } from '../config/env';

const BASE_URL = 'https://api.trello.com/1';

interface TrelloBoard {
	id: string;
	name: string;
	desc?: string;
	closed?: boolean;
}

interface TrelloList {
	id: string;
	name: string;
	idBoard: string;
	closed?: boolean;
}

interface TrelloCard {
	id: string;
	name: string;
	idList: string;
	desc?: string;
	closed?: boolean;
}

/**
 * Creates a new Trello board
 */
export async function createBoard(name: string, description?: string): Promise<TrelloBoard> {
	const url = new URL(`${BASE_URL}/boards`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);
	url.searchParams.set('name', name);
	if (description) {
		url.searchParams.set('desc', description);
	}

	const res = await fetch(url.toString(), {
		method: 'POST',
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to create board (${res.status}): ${errorText}`);
	}

	return (await res.json()) as TrelloBoard;
}

/**
 * Creates a new list on a Trello board
 */
export async function createList(boardId: string, name: string): Promise<TrelloList> {
	const url = new URL(`${BASE_URL}/lists`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);
	url.searchParams.set('idBoard', boardId);
	url.searchParams.set('name', name);

	const res = await fetch(url.toString(), {
		method: 'POST',
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to create list (${res.status}): ${errorText}`);
	}

	return (await res.json()) as TrelloList;
}

/**
 * Creates a new card on a Trello list
 */
export async function createCard(listId: string, name: string, description?: string): Promise<TrelloCard> {
	const url = new URL(`${BASE_URL}/cards`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);
	url.searchParams.set('idList', listId);
	url.searchParams.set('name', name);
	if (description) {
		url.searchParams.set('desc', description);
	}

	const res = await fetch(url.toString(), {
		method: 'POST',
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to create card (${res.status}): ${errorText}`);
	}

	return (await res.json()) as TrelloCard;
}

/**
 * Deletes a Trello board (useful for cleanup in tests)
 */
export async function deleteBoard(boardId: string): Promise<void> {
	const url = new URL(`${BASE_URL}/boards/${boardId}`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);

	const res = await fetch(url.toString(), {
		method: 'DELETE',
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to delete board (${res.status}): ${errorText}`);
	}
}

/**
 * Gets a board by ID
 */
export async function getBoard(boardId: string): Promise<TrelloBoard> {
	const url = new URL(`${BASE_URL}/boards/${boardId}`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);

	const res = await fetch(url.toString());

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to get board (${res.status}): ${errorText}`);
	}

	return (await res.json()) as TrelloBoard;
}

/**
 * Gets a card by ID
 */
export async function getCard(cardId: string): Promise<TrelloCard> {
	const url = new URL(`${BASE_URL}/cards/${cardId}`);
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);

	const res = await fetch(url.toString());

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Failed to get card (${res.status}): ${errorText}`);
	}

	return (await res.json()) as TrelloCard;
}
