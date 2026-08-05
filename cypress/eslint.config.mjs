import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import cypress from 'eslint-plugin-cypress';
import tseslint from 'typescript-eslint';

// Scoped to the cypress/ suite only. Invoked explicitly via
// `eslint --config cypress/eslint.config.mjs cypress` so it never
// interferes with the app's own .eslintrc.json (airbnb) setup.
export default tseslint.config(
  {
    ignores: ['../node_modules/**', 'videos/**', 'screenshots/**', 'downloads/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,js}'],
    ...cypress.configs.recommended,
    rules: {
      ...cypress.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-prototype-builtins': 'warn',
      // Legacy E2E specs rely on waits/chaining; enforce gradually, not blocking CI.
      'cypress/no-unnecessary-waiting': 'off',
      'cypress/unsafe-to-chain-command': 'off',
      'cypress/no-assigning-return-values': 'off',
      'cypress/no-force': 'warn',
      'cypress/chain-as-command': 'off',
      'cypress/no-async-before': 'warn',
      'cypress/no-pause': 'error',
    },
  }
);
