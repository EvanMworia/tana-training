import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Trello Login Page
 */
export class LoginPage {
	readonly page: Page;
	readonly loginLink: Locator;
	readonly usernameInput: Locator;
	readonly passwordInput: Locator;
	readonly loginSubmitButton: Locator;
	readonly mfaDismissButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.loginLink = page.getByTestId('bignav').getByRole('link', { name: 'Log in' });
		this.usernameInput = page.getByTestId('username');
		this.passwordInput = page.getByTestId('password');
		this.loginSubmitButton = page.getByTestId('login-submit-idf-testid');
		this.mfaDismissButton = page.getByTestId('mfa-promote-dismiss-idf-testid');
	}

	/**
	 * Navigate to Trello homepage
	 */
	async goto() {
		await this.page.goto('https://trello.com/');
	}

	/**
	 * Click the login link from the homepage
	 */
	async clickLoginLink() {
		await this.loginLink.click();
	}

	/**
	 * Enter username/email
	 */
	async enterUsername(username: string) {
		await this.usernameInput.click();
		await this.usernameInput.fill(username);
	}

	/**
	 * Enter password
	 */
	async enterPassword(password: string) {
		await this.passwordInput.fill(password);
	}

	/**
	 * Submit login form (after entering username)
	 */
	async submitUsername() {
		await this.loginSubmitButton.click();
	}

	/**
	 * Submit login form (after entering password)
	 */
	async submitPassword() {
		await this.loginSubmitButton.click();
	}

	/**
	 * Dismiss 2FA promotion popup if it appears (conditional)
	 */
	async dismissMfaIfPresent() {
		try {
			// Wait for the MFA dismiss button with a short timeout
			// If it doesn't appear, that's fine - we'll catch the error
			const mfaButton = this.mfaDismissButton;
			await mfaButton.waitFor({ state: 'visible', timeout: 3000 });
			await mfaButton.click();
			console.log('✅ 2FA promotion popup dismissed');
		} catch (error) {
			// MFA popup didn't appear, which is fine
			console.log('ℹ️  No 2FA promotion popup appeared (this is normal)');
		}
	}

	/**
	 * Complete full login flow
	 * @param username - Trello username/email
	 * @param password - Trello password
	 */
	async login(username: string, password: string) {
		console.log('🔐 Starting login process...');
		
		// Navigate to Trello homepage
		await this.goto();
		
		// Click the "Log in" link from the homepage
		await this.clickLoginLink();
		await this.page.waitForTimeout(1000); // Wait for login form to appear

		// Enter username
		await this.enterUsername(username);
		await this.submitUsername();
		await this.page.waitForTimeout(1000); // Wait for password field to appear

		// Enter password
		await this.enterPassword(password);
		await this.submitPassword();
		
		// Wait for login to complete
		await this.page.waitForTimeout(2000);

		// Dismiss 2FA popup if it appears
		await this.dismissMfaIfPresent();

		console.log('✅ Login completed');
	}
}
