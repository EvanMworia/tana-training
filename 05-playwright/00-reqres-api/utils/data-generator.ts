import { faker } from '@faker-js/faker';

export interface UserPayload {
	name: string;
	job: string;
}

export interface RegisterPayload {
	email: string;
	password: string;
}

export class DataGenerator {
	/**
	 * Generate a random user payload
	 */
	static generateUser(): UserPayload {
		return {
			name: faker.person.fullName(),
			job: faker.person.jobTitle(),
		};
	}

	/**
	 * Generate multiple users
	 */
	static generateUsers(count: number): UserPayload[] {
		return Array.from({ length: count }, () => this.generateUser());
	}

	/**
	 * Generate registration data with reqres.in valid format
	 */
	static generateRegistration(): RegisterPayload {
		return {
			email: 'eve.holt@reqres.in', // reqres.in requires specific email format
			password: faker.internet.password({ length: 10 }),
		};
	}

	/**
	 * Generate invalid email for negative testing
	 */
	static generateInvalidEmail(): string {
		return faker.internet.email(); // Random email won't work with reqres.in
	}

	/**
	 * Generate resource payload
	 */
	static generateResource() {
		return {
			name: faker.commerce.productName(),
			year: faker.date.past().getFullYear(),
			color: faker.color.rgb(),
			pantone_value: `${faker.number.int({ min: 10, max: 99 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
		};
	}

	/**
	 * Generate random string for invalid data testing
	 */
	static generateRandomString(length: number = 10): string {
		return faker.string.alpha(length);
	}

	/**
	 * Generate invalid payloads for testing
	 */
	static generateInvalidUser() {
		return {
			invalidField: faker.lorem.word(),
			anotherInvalid: faker.number.int(),
		};
	}
}
