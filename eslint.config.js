import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['.svelte-kit/**', '.vercel/**', 'build/**', 'node_modules/**', '*.config.cjs'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-each-key': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: tseslint.parser } },
		rules: {
			'@typescript-eslint/no-unused-vars': 'off'
		}
	}
);
