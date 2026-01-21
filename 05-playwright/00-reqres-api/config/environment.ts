import dotenv from 'dotenv';

dotenv.config();

export const config = {
	baseUrl: process.env.BASE_URL || 'https://reqres.in/api',
	timeout: parseInt(process.env.TIMEOUT || '30000'),
	maxRetries: parseInt(process.env.MAX_RETRIES || '2'),
	performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD || '2000'),
};

export const endpoints = {
	users: 'api/users',
	register: 'api/register',
	login: 'api/login',
	resources: 'api/unknown',
};
