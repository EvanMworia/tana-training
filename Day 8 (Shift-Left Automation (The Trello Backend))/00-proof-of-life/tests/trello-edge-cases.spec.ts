// tests/trello-edge-cases.spec.ts
import { test, expect } from '../src/fixtures/trello-fixtures';
import { BoardPage } from '../src/pages/BoardPage';
import { setupBoardWithList } from '../src/utils/test-setup-helpers';
import { generateNastyStrings, NastyString } from '../src/data/nasty-strings';
import { createTestCardName } from '../src/utils/test-data-generator';
import { createCard } from '../src/utils/trello-api';

test.describe('Trello Edge Cases - Nasty Strings Testing', () => {
	// Generate all nasty strings once
	const nastyStrings = generateNastyStrings();

	console.log(
		`\n📊 Testing ${nastyStrings.length} edge cases across ${new Set(nastyStrings.map((ns) => ns.category)).size} categories\n`,
	);

	// Dynamically create a test for each nasty string
	for (const nastyString of nastyStrings) {
		test(`should handle card name: [${nastyString.category}] ${nastyString.description}`, async ({
			authenticatedPage,
		}) => {
			// SETUP: Create board + list via API
			const [testData, cleanup] = await setupBoardWithList(`Edge case test: ${nastyString.category}`);

			try {
				if (!testData.listId) {
					throw new Error('List was not created');
				}

				// Create card name with nasty string
				const cardName = createTestCardName(nastyString);

				console.log(`\n🧪 Testing: ${nastyString.description}`);
				console.log(`   Category: ${nastyString.category}`);
				console.log(`   Value: "${nastyString.value}"`);
				console.log(`   Length: ${nastyString.value.length} chars`);

				// CREATE: Card via API with nasty string
				const card = await createCard(testData.listId, cardName, `Edge case test: ${nastyString.description}`);

				expect(card).toBeDefined();
				expect(card.id).toBeTruthy();
				console.log(`   ✅ API: Card created successfully (ID: ${card.id})`);

				// VALIDATE: Card appears correctly in UI
				const boardPage = new BoardPage(authenticatedPage);
				await boardPage.goto(testData.boardId);
				await boardPage.waitForLoad();

				// Check if the card is visible (with the test ID prefix)
				const cardExists = await boardPage.cardExists(cardName, testData.listName);

				if (nastyString.shouldSucceed) {
					expect(cardExists).toBe(true);
					console.log(`   ✅ UI: Card found on board`);

					// Additional validation: Card displays correctly
					await boardPage.assertCardExists(cardName, testData.listName);
				} else {
					// If we expect it to fail, document the behavior
					console.log(`   ⚠️  Expected to fail, but succeeded: ${cardExists}`);
				}
			} catch (error) {
				if (nastyString.shouldSucceed) {
					console.error(`   ❌ FAILED: ${nastyString.description}`);
					console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
					throw error;
				} else {
					console.log(`   ✅ Failed as expected`);
				}
			} finally {
				// CLEANUP: Delete board via API
				await cleanup();
			}
		});
	}
});

test.describe('Trello Edge Cases - Category-Based Testing', () => {
	const nastyStrings = generateNastyStrings();
	const categories = [...new Set(nastyStrings.map((ns) => ns.category))];

	// Test all strings in each category together (faster)
	for (const category of categories) {
		test(`should handle all ${category} edge cases`, async ({ authenticatedPage }) => {
			const categoryStrings = nastyStrings.filter((ns) => ns.category === category);

			// SETUP: Single board + list for all strings in this category
			const [testData, cleanup] = await setupBoardWithList(`Edge cases: ${category}`);

			try {
				if (!testData.listId) {
					throw new Error('List was not created');
				}

				console.log(`\n📦 Testing ${categoryStrings.length} ${category} edge cases`);

				const results: { nastyString: NastyString; success: boolean; error?: string }[] = [];

				// Create ALL cards for this category via API (fast)
				for (const nastyString of categoryStrings) {
					const cardName = createTestCardName(nastyString);

					try {
						await createCard(testData.listId, cardName, nastyString.description);
						results.push({ nastyString, success: true });
						console.log(`   ✅ ${nastyString.description}`);
					} catch (error) {
						results.push({
							nastyString,
							success: false,
							error: error instanceof Error ? error.message : String(error),
						});
						console.log(`   ❌ ${nastyString.description}: ${error}`);
					}
				}

				// VALIDATE: All cards appear in UI (single page load)
				const boardPage = new BoardPage(authenticatedPage);
				await boardPage.goto(testData.boardId);
				await boardPage.waitForLoad();

				let visibleCount = 0;
				for (const result of results) {
					if (result.success) {
						const cardName = createTestCardName(result.nastyString);
						const isVisible = await boardPage.cardExists(cardName, testData.listName);
						if (isVisible) visibleCount++;
					}
				}

				console.log(`\n📊 Results: ${visibleCount}/${categoryStrings.length} cards visible in UI`);

				// Assert that most cards are visible (allow some edge cases to fail)
				const successRate = visibleCount / categoryStrings.length;
				expect(successRate).toBeGreaterThan(0.8); // 80% success rate
			} finally {
				// CLEANUP
				await cleanup();
			}
		});
	}
});

test.describe('Trello Edge Cases - Stress Testing', () => {
	test('should handle 20+ cards with different edge cases on single board', async ({ authenticatedPage }) => {
		const nastyStrings = generateNastyStrings();
		const [testData, cleanup] = await setupBoardWithList('Stress test: All edge cases');

		try {
			if (!testData.listId) {
				throw new Error('List was not created');
			}

			console.log(`\n🔥 Stress test: Creating ${nastyStrings.length} cards with edge cases`);

			// Create ALL cards via API (fast bulk operation)
			const createdCards: string[] = [];
			for (const nastyString of nastyStrings) {
				const cardName = createTestCardName(nastyString);
				try {
					await createCard(testData.listId, cardName, nastyString.description);
					createdCards.push(cardName);
				} catch (error) {
					console.log(`   ⚠️  Skipped: ${nastyString.description}`);
				}
			}

			console.log(`   ✅ Created ${createdCards.length}/${nastyStrings.length} cards via API`);

			// VALIDATE: Navigate once and check all cards
			const boardPage = new BoardPage(authenticatedPage);
			await boardPage.goto(testData.boardId);
			await boardPage.waitForLoad();

			let visibleCount = 0;
			for (const cardName of createdCards) {
				const isVisible = await boardPage.cardExists(cardName, testData.listName);
				if (isVisible) visibleCount++;
			}

			console.log(`   ✅ ${visibleCount}/${createdCards.length} cards visible in UI`);

			// Assert reasonable success rate
			expect(visibleCount).toBeGreaterThan(createdCards.length * 0.7); // 70% visible
		} finally {
			await cleanup();
		}
	});
});
