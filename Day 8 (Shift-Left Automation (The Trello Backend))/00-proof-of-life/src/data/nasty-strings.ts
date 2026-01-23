// src/data/nasty-strings.ts

/**
 * Edge case categories for comprehensive testing
 */
export type EdgeCaseCategory =
	| 'unicode'
	| 'special-chars'
	| 'injection'
	| 'length'
	| 'whitespace'
	| 'emoji'
	| 'rtl'
	| 'zalgo';

/**
 * Test case with metadata for better reporting
 */
export interface NastyString {
	category: EdgeCaseCategory;
	description: string;
	value: string;
	shouldSucceed: boolean; // Does Trello support this?
}

/**
 * Generates a comprehensive set of edge case strings
 * Based on the Big List of Naughty Strings (BLNS) but dynamically generated
 */
export function generateNastyStrings(): NastyString[] {
	const nastyStrings: NastyString[] = [];

	// 1. UNICODE & INTERNATIONAL CHARACTERS (5 cases)
	nastyStrings.push(
		{
			category: 'unicode',
			description: 'Chinese characters',
			value: '测试卡片名称',
			shouldSucceed: true,
		},
		{
			category: 'unicode',
			description: 'Japanese (Hiragana + Kanji)',
			value: 'テストカード名前',
			shouldSucceed: true,
		},
		{
			category: 'unicode',
			description: 'Arabic',
			value: 'اختبار البطاقة',
			shouldSucceed: true,
		},
		{
			category: 'unicode',
			description: 'Russian (Cyrillic)',
			value: 'Тестовая карточка',
			shouldSucceed: true,
		},
		{
			category: 'unicode',
			description: 'Mixed scripts',
			value: 'Test测试Тест',
			shouldSucceed: true,
		},
	);

	// 2. EMOJI (3 cases)
	nastyStrings.push(
		{
			category: 'emoji',
			description: 'Single emoji',
			value: '🚀',
			shouldSucceed: true,
		},
		{
			category: 'emoji',
			description: 'Multiple emojis',
			value: '🎯🔥💯✨🚀',
			shouldSucceed: true,
		},
		{
			category: 'emoji',
			description: 'Text with emojis',
			value: '🎯 Important Task 🔥',
			shouldSucceed: true,
		},
	);

	// 3. SPECIAL CHARACTERS (4 cases)
	nastyStrings.push(
		{
			category: 'special-chars',
			description: 'HTML-like tags',
			value: '<script>alert("XSS")</script>',
			shouldSucceed: true, // Trello should escape this
		},
		{
			category: 'special-chars',
			description: 'Special symbols',
			value: '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`',
			shouldSucceed: true,
		},
		{
			category: 'special-chars',
			description: 'Quotes and apostrophes',
			value: `"Double" 'Single' \`Backtick\``,
			shouldSucceed: true,
		},
		{
			category: 'special-chars',
			description: 'Backslashes and forward slashes',
			value: 'C:\\Users\\Test\\file.txt',
			shouldSucceed: true,
		},
	);

	// 4. SQL INJECTION ATTEMPTS (3 cases)
	nastyStrings.push(
		{
			category: 'injection',
			description: 'SQL injection - DROP TABLE',
			value: "'; DROP TABLE cards;--",
			shouldSucceed: true, // Should be treated as text
		},
		{
			category: 'injection',
			description: 'SQL injection - OR 1=1',
			value: "' OR '1'='1",
			shouldSucceed: true,
		},
		{
			category: 'injection',
			description: 'Script injection',
			value: '<img src=x onerror=alert(1)>',
			shouldSucceed: true, // Should be escaped
		},
	);

	// 5. WHITESPACE VARIATIONS (3 cases)
	nastyStrings.push(
		{
			category: 'whitespace',
			description: 'Leading/trailing spaces',
			value: '   Spaces Around   ',
			shouldSucceed: true,
		},
		{
			category: 'whitespace',
			description: 'Multiple spaces',
			value: 'Multiple    Spaces    Between',
			shouldSucceed: true,
		},
		{
			category: 'whitespace',
			description: 'Tabs and newlines',
			value: 'Line1\nLine2\tTabbed',
			shouldSucceed: true,
		},
	);

	// 6. LENGTH EXTREMES (3 cases)
	nastyStrings.push(
		{
			category: 'length',
			description: 'Single character',
			value: 'A',
			shouldSucceed: true,
		},
		{
			category: 'length',
			description: 'Very long string (500 chars)',
			value: 'A'.repeat(500),
			shouldSucceed: true, // Trello might truncate
		},
		{
			category: 'length',
			description: 'Extremely long string (5000 chars)',
			value: 'Lorem ipsum '.repeat(400), // ~4800 chars
			shouldSucceed: true, // Test Trello's limits
		},
	);

	// 7. RIGHT-TO-LEFT (RTL) TEXT (2 cases)
	nastyStrings.push(
		{
			category: 'rtl',
			description: 'RTL text (Hebrew)',
			value: 'בדיקה',
			shouldSucceed: true,
		},
		{
			category: 'rtl',
			description: 'Mixed LTR and RTL',
			value: 'Test בדיקה Test',
			shouldSucceed: true,
		},
	);

	// 8. ZALGO TEXT (corrupted/combining characters) (2 cases)
	nastyStrings.push(
		{
			category: 'zalgo',
			description: 'Combining diacritical marks',
			value: 'T̸̢̛͚̦̈́e̵̡̨̱̍s̷̰̈́̂t̶̰̾',
			shouldSucceed: true,
		},
		{
			category: 'zalgo',
			description: 'Heavy combining marks',
			value: 'Z̷̳̀a̷͜͝l̶̰͝g̵̰̈́o̷̱͝',
			shouldSucceed: true,
		},
	);

	return nastyStrings;
}

/**
 * Get nasty strings filtered by category
 */
export function getNastyStringsByCategory(category: EdgeCaseCategory): NastyString[] {
	return generateNastyStrings().filter((ns) => ns.category === category);
}

/**
 * Get a random nasty string
 */
export function getRandomNastyString(): NastyString {
	const all = generateNastyStrings();
	return all[Math.floor(Math.random() * all.length)];
}
