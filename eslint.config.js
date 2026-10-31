// Configuración ESLint compartida por backend y frontend (flat config)
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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
    files: ['backend/**/*.ts', '.claude/hooks/**/*.mjs', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['.claude/hooks/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Los componentes de shadcn/ui exportan también sus variantes de estilo
    files: ['frontend/src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['frontend/vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
