import { test, expect } from '../fixtures/api.fixture';
import { DataGenerator } from '../utils/data-generator';
import { TestHelpers } from '../utils/test-helpers';
import { endpoints } from '../config/environment';

test.describe('Users API - CRUD Operations', () => {
	let createdUserId: string;
	// test.only('debug URL with API key in headers', async ({ apiContext }) => {
	// 	console.log('=== ENVIRONMENT CHECK ===');
	// 	console.log('BASE_URL:', process.env.BASE_URL);
	// 	console.log('API_KEY present:', !!process.env.REQRES_API_KEY);
	// 	console.log('API_KEY value:', process.env.REQRES_API_KEY ? '***hidden***' : 'NOT SET');
	// 	console.log('========================');

	// 	const response = await apiContext.get('api/users?page=1');

	// 	console.log('Request URL:', response.url());
	// 	console.log('Status:', response.status());
	// 	console.log('Status Text:', response.statusText());

	// 	// Log response body for debugging
	// 	try {
	// 		const data = await response.json();
	// 		console.log('Response data:', JSON.stringify(data, null, 2));
	// 	} catch (error) {
	// 		const text = await response.text();
	// 		console.log('Response text:', text);
	// 	}

	// 	expect(response.status()).toBe(200);
	// });
	test.describe('GET - Retrieve Users', () => {
		test('should retrieve list of users with pagination', async ({ apiContext }) => {
			const startTime = Date.now();
			const response = await apiContext.get(`${endpoints.users}?page=2`);
			const endTime = Date.now();

			expect(response.ok()).toBeTruthy();
			expect(response.status()).toBe(200);

			const data = await response.json();
			TestHelpers.validatePagination(data, 2);
			expect(data.data).toBeInstanceOf(Array);
			expect(data.data.length).toBeGreaterThan(0);

			await TestHelpers.validateHeaders(response);
			TestHelpers.validateResponseTime(startTime, endTime);
		});

		test('should retrieve single user by ID', async ({ apiContext }) => {
			const userId = 2;
			const startTime = Date.now();
			const response = await apiContext.get(`${endpoints.users}/${userId}`);
			const endTime = Date.now();

			expect(response.status()).toBe(200);

			const data = await response.json();
			expect(data.data).toHaveProperty('id', userId);
			expect(data.data).toHaveProperty('email');
			expect(data.data).toHaveProperty('first_name');
			expect(data.data).toHaveProperty('last_name');
			expect(data.data).toHaveProperty('avatar');

			expect(typeof data.data.email).toBe('string');
			expect(data.data.email).toContain('@');

			TestHelpers.validateResponseTime(startTime, endTime);
		});

		test('should return 404 for non-existent user', async ({ apiContext }) => {
			const response = await apiContext.get(`${endpoints.users}/999999`);

			expect(response.status()).toBe(404);
			const data = await response.json();
			expect(data).toEqual({});
		});

		test('should handle invalid user ID format', async ({ apiContext }) => {
			const response = await apiContext.get(`${endpoints.users}/invalid-id`);

			expect(response.status()).toBe(404);
		});

		test('should retrieve users with default pagination when no page specified', async ({ apiContext }) => {
			const response = await apiContext.get(endpoints.users);

			expect(response.status()).toBe(200);
			const data = await response.json();
			TestHelpers.validatePagination(data, 1);
		});
	});

	test.describe('POST - Create Users', () => {
		test('should create a new user with valid data', async ({ apiContext, createdResourceIds }) => {
			const userData = DataGenerator.generateUser();
			const startTime = Date.now();

			const response = await apiContext.post(endpoints.users, {
				data: userData,
			});
			const endTime = Date.now();

			expect(response.status()).toBe(201);

			const data = await response.json();
			TestHelpers.validateUserStructure(data);

			expect(data.name).toBe(userData.name);
			expect(data.job).toBe(userData.job);

			TestHelpers.validateTimestamp(data.createdAt);

			createdResourceIds.push(data.id);
			createdUserId = data.id;

			TestHelpers.validateResponseTime(startTime, endTime);
		});

		test('should create multiple users successfully', async ({ apiContext, createdResourceIds }) => {
			const users = DataGenerator.generateUsers(3);

			for (const userData of users) {
				const response = await apiContext.post(endpoints.users, {
					data: userData,
				});

				expect(response.status()).toBe(201);
				const data = await response.json();
				createdResourceIds.push(data.id);
			}

			expect(createdResourceIds.length).toBeGreaterThanOrEqual(3);
		});

		test('should handle creation with minimal data', async ({ apiContext }) => {
			const response = await apiContext.post(endpoints.users, {
				data: { name: 'Test User' },
			});

			expect(response.status()).toBe(201);
			const data = await response.json();
			expect(data.name).toBe('Test User');
		});

		test('should accept special characters in user data', async ({ apiContext }) => {
			const userData = {
				name: "O'Brien-Smith",
				job: 'Software Engineer & Architect',
			};

			const response = await apiContext.post(endpoints.users, {
				data: userData,
			});

			expect(response.status()).toBe(201);
			const data = await response.json();
			expect(data.name).toBe(userData.name);
		});

		test('should handle empty POST request body', async ({ apiContext }) => {
			const response = await apiContext.post(endpoints.users, {
				data: {},
			});

			// reqres.in accepts empty body
			expect(response.status()).toBe(201);
		});
	});

	test.describe('PUT - Update Users', () => {
		test('should update user with PUT request', async ({ apiContext }) => {
			const updatedData = DataGenerator.generateUser();
			const userId = 2;
			const startTime = Date.now();

			const response = await apiContext.put(`${endpoints.users}/${userId}`, {
				data: updatedData,
			});
			const endTime = Date.now();

			expect(response.status()).toBe(200);

			const data = await response.json();
			expect(data.name).toBe(updatedData.name);
			expect(data.job).toBe(updatedData.job);
			expect(data).toHaveProperty('updatedAt');

			TestHelpers.validateTimestamp(data.updatedAt);
			TestHelpers.validateResponseTime(startTime, endTime);
		});

		test('should partially update user data', async ({ apiContext }) => {
			const response = await apiContext.put(`${endpoints.users}/2`, {
				data: { job: 'Senior Developer' },
			});

			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data.job).toBe('Senior Developer');
		});

		test('should handle update for non-existent user (reqres.in behavior)', async ({ apiContext }) => {
			const userData = DataGenerator.generateUser();
			const response = await apiContext.put(`${endpoints.users}/999999`, {
				data: userData,
			});

			// reqres.in returns 200 even for non-existent users
			expect(response.status()).toBe(200);
		});
	});

	test.describe('PATCH - Partial Update Users', () => {
		test('should partially update user with PATCH', async ({ apiContext }) => {
			const patchData = { job: DataGenerator.generateUser().job };

			const response = await apiContext.patch(`${endpoints.users}/2`, {
				data: patchData,
			});

			expect(response.status()).toBe(200);

			const data = await response.json();
			expect(data.job).toBe(patchData.job);
			expect(data).toHaveProperty('updatedAt');
			TestHelpers.validateTimestamp(data.updatedAt);
		});

		test('should update only name field', async ({ apiContext }) => {
			const response = await apiContext.patch(`${endpoints.users}/2`, {
				data: { name: 'Updated Name Only' },
			});

			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data.name).toBe('Updated Name Only');
		});
	});

	test.describe('DELETE - Remove Users', () => {
		test('should delete a user successfully', async ({ apiContext }) => {
			const startTime = Date.now();
			const response = await apiContext.delete(`${endpoints.users}/2`);
			const endTime = Date.now();

			expect(response.status()).toBe(204);

			const responseText = await response.text();
			expect(responseText).toBe('');

			TestHelpers.validateResponseTime(startTime, endTime);
		});

		test('should delete non-existent user (returns 204)', async ({ apiContext }) => {
			const response = await apiContext.delete(`${endpoints.users}/999999`);

			expect(response.status()).toBe(204);
		});

		test('should handle deletion with invalid ID format', async ({ apiContext }) => {
			const response = await apiContext.delete(`${endpoints.users}/abc123`);

			expect(response.status()).toBe(204);
		});
	});

	test.describe('Authentication and Registration', () => {
		test('should register user successfully', async ({ apiContext }) => {
			const registerData = DataGenerator.generateRegistration();

			const response = await apiContext.post(endpoints.register, {
				data: registerData,
			});

			expect(response.status()).toBe(200);

			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('token');
			expect(typeof data.token).toBe('string');
			expect(data.token.length).toBeGreaterThan(0);
		});

		test('should fail registration with invalid email', async ({ apiContext }) => {
			const invalidData = {
				email: DataGenerator.generateInvalidEmail(),
				password: 'testpassword123',
			};

			const response = await apiContext.post(endpoints.register, {
				data: invalidData,
			});

			expect(response.status()).toBe(400);

			const data = await response.json();
			TestHelpers.validateErrorResponse(data);
		});

		test('should fail registration without password', async ({ apiContext }) => {
			const response = await apiContext.post(endpoints.register, {
				data: { email: 'eve.holt@reqres.in' },
			});

			expect(response.status()).toBe(400);
			const data = await response.json();
			expect(data.error).toBe('Missing password');
		});

		test('should login successfully', async ({ apiContext }) => {
			const loginData = DataGenerator.generateRegistration();

			const response = await apiContext.post(endpoints.login, {
				data: loginData,
			});

			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data).toHaveProperty('token');
		});

		test('should fail login with missing credentials', async ({ apiContext }) => {
			const response = await apiContext.post(endpoints.login, {
				data: { email: 'test@test.com' },
			});

			expect(response.status()).toBe(400);
			const data = await response.json();
			TestHelpers.validateErrorResponse(data);
		});
	});

	test.describe('Edge Cases and Performance', () => {
		test('should handle large page numbers gracefully', async ({ apiContext }) => {
			const response = await apiContext.get(`${endpoints.users}?page=1000`);

			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data.data).toBeInstanceOf(Array);
			expect(data.data.length).toBe(0);
		});

		test('should handle concurrent requests', async ({ apiContext }) => {
			const requests = Array.from({ length: 5 }, (_, i) => apiContext.get(`${endpoints.users}?page=${i + 1}`));

			const responses = await Promise.all(requests);

			responses.forEach((response) => {
				expect(response.status()).toBe(200);
			});
		});

		test('should validate response time for list endpoint', async ({ apiContext }) => {
			const startTime = Date.now();
			await apiContext.get(endpoints.users);
			const endTime = Date.now();

			TestHelpers.validateResponseTime(startTime, endTime, 1000);
		});
	});
});
