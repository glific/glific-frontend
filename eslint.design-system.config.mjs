import tseslint from 'typescript-eslint';

// Scoped to src/containers/** only. Invoked explicitly via
// `eslint --no-config-lookup --config eslint.design-system.config.mjs <files>` so it
// never interferes with the app's own .eslintrc.json (airbnb) setup or cypress's own
// flat config.
const MUI_IMPORT_MESSAGE =
  "Don't import @mui/material directly in src/containers/**. Use a shared component from " +
  "src/components/UI (see src/components/UI/README.md) or, if it genuinely doesn't exist " +
  'yet, add it there instead of inlining MUI here.';

export default tseslint.config({
  files: ['src/containers/**/*.ts', 'src/containers/**/*.tsx'],
  ignores: ['src/containers/**/*.test.ts', 'src/containers/**/*.test.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [{ name: '@mui/material', message: MUI_IMPORT_MESSAGE }],
        patterns: [{ group: ['@mui/material/*'], message: MUI_IMPORT_MESSAGE }],
      },
    ],
  },
});
