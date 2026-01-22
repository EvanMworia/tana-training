import { trelloConfig } from '../config/env';

interface TrelloMember {
	username?: string;
	fullName?: string;
	id?: string;
}

async function fetchTrelloMember(): Promise<TrelloMember> {
	const url = new URL('https://api.trello.com/1/members/me');
	url.searchParams.set('key', trelloConfig.apiKey);
	url.searchParams.set('token', trelloConfig.token);

	try {
		const res = await fetch(url.toString());
		
		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(
				`Trello API error (${res.status} ${res.statusText}): ${errorText}`
			);
		}

		const data = (await res.json()) as TrelloMember;
		return data;
	} catch (error) {
		if (error instanceof Error && error.message.includes('Trello API error')) {
			throw error;
		}
		throw new Error(`Failed to fetch Trello member data: ${error instanceof Error ? error.message : String(error)}`);
	}
}

async function main() {
	try {
		const member = await fetchTrelloMember();
		
		const username = member.username ?? 'unknown';
		const fullName = member.fullName ? ` (${member.fullName})` : '';
		
		console.log(`Trello username: ${username}${fullName}`);
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

main();
