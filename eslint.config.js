// Configuración ESLint compartida por backend y frontend (flat config)
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/build',
      '**/coverage',
      'backend/uploads',
      'backend/src/generated',
      '**/.angular',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['backend/**/*.ts', '.claude/hooks/**/*.mjs', 'scripts/**/*.mjs', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['.claude/hooks/**/*.mjs', 'scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['frontend/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  prettier,
);
