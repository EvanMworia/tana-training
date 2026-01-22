import { createBoard, createList, createCard, deleteBoard } from '../utils/trello-api';
import { generateUniqueBoardName, generateUniqueListName, generateUniqueCardName } from '../utils/test-helpers';

async function main() {
	try {
		console.log('Creating Trello board...');
		const boardName = generateUniqueBoardName();
		const board = await createBoard(boardName, 'A test board created via API');
		console.log(`✓ Board created: ${board.name} (ID: ${board.id})`);

		console.log('\nCreating list on board...');
		const listName = generateUniqueListName();
		const list = await createList(board.id, listName);
		console.log(`✓ List created: ${list.name} (ID: ${list.id})`);

		console.log('\nCreating card on list...');
		const cardName = generateUniqueCardName();
		const card = await createCard(list.id, cardName, 'This card was created via the Trello API');
		console.log(`✓ Card created: ${card.name} (ID: ${card.id})`);

		console.log('\n✅ Success! Board, list, and card created.');
		console.log(`\nYou can view your board at: https://trello.com/b/${board.id}`);

		// Uncomment the line below if you want to automatically delete the board after creation
		// The delete board is useful for cleanup in tests
		 await deleteBoard(board.id);
		console.log('\n✓ Board deleted (cleanup)');
		// console.log('\n✓ =====================BOARD DELETION WOULDVE HAPPENED HERE(cleanup )=======================');
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

main();
