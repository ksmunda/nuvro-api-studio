// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Base ESLint configuration for TypeScript files.
 * @type {import('eslint').Linter.Config[]}
 */
export const baseConfig = [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      boundaries,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        URL: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        globalThis: 'readonly',
        document: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        ReadableStream: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        RequestInit: 'readonly',
        FormData: 'readonly',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];

/**
 * React-specific ESLint configuration.
 * @type {import('eslint').Linter.Config[]}
 */
export const reactConfig = [
  ...baseConfig,
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'warn',
    },
  },
];

/**
 * Architectural boundary rules — enforces dependency constraints between packages.
 * @type {import('eslint').Linter.Config}
 */
export const boundaryConfig = {
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'config', pattern: 'packages/config/**' },
      { type: 'types', pattern: 'packages/types/**' },
      { type: 'validation', pattern: 'packages/validation/**' },
      { type: 'core', pattern: 'packages/core/**' },
      { type: 'api-client', pattern: 'packages/api-client/**' },
      { type: 'ui', pattern: 'packages/ui/**' },
      { type: 'web', pattern: 'apps/web/**' },
      { type: 'desktop', pattern: 'apps/desktop/**' },
      { type: 'backend', pattern: 'backend/**' },
      { type: 'database', pattern: 'database/**' },
      { type: 'e2e', pattern: 'tests/e2e/**' },
    ],
    'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx'],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'config', allow: [] },
          { from: 'types', allow: ['config', 'validation'] },
          { from: 'validation', allow: ['config', 'types'] },
          { from: 'core', allow: ['config', 'types', 'validation'] },
          { from: 'api-client', allow: ['config', 'types', 'validation', 'core'] },
          { from: 'ui', allow: ['config', 'types', 'validation', 'core'] },
          { from: 'web', allow: ['config', 'types', 'validation', 'core', 'api-client', 'ui'] },
          { from: 'desktop', allow: ['config', 'types', 'validation', 'core', 'api-client', 'ui'] },
          { from: 'backend', allow: ['config', 'types', 'validation', 'core', 'database'] },
          { from: 'database', allow: ['config'] },
          { from: 'e2e', allow: ['*'] },
        ],
      },
    ],
  },
};

export default [...baseConfig];
