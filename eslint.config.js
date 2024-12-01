import { defineConfig } from 'eslint-define-config'; // Optional, if you're using it

export default defineConfig({
	languageOptions: {
		parserOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
		},
		globals: {
			// Define global variables here (instead of 'env')
			node: true,
			es2021: true,
		},
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	rules: {
		// Your custom ESLint rules go here
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			parser: '@typescript-eslint/parser',
			rules: {
				// Specific TypeScript rules can go here
			},
		},
	],
});
