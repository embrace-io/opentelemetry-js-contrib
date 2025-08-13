'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-n');

/** @type {Array<import('eslint').Linter.FlatConfig>} */
const config = [
  // Ignore files
  {
    ignores: [
      '**/build/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
    ],
  },
  // Base config for all files
  {
    files: ['**/*.{js,ts,mjs}'],
    plugins: {
      node: nodePlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      // sourceType: 'module',
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.node,
      },
    },
    settings: {
      node: {
        tryExtensions: ['.js', '.json', '.node', '.ts'],
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      quotes: ['error', 'single', { avoidEscape: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-rest-params': 'off',
      'no-shadow': 'off',
      'node/no-extraneous-require': 'error',
    },
  },
  // TypeScript-specific config
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      node: nodePlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      ...tseslint.configs.strictTypeChecked.rules,
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-shadow': ['warn'],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreProperties: true },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'memberLike',
          modifiers: ['private', 'protected'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
      ],
    },
  },
  // Test files config
  {
    files: ['**/test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
      },
    },
    rules: {
      'no-empty': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  // Browser environment config
  {
    files: [
      '**/examples/web/**/*',
      '**/packages/**/browser/**/*',
      '**/packages/instrumentation-user-interaction/**/*',
      '**/packages/instrumentation-document-load/**/*',
      '**/packages/instrumentation-long-task/**/*',
      '**/packages/plugin-react-load/**/*',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        Zone: 'readonly',
        Task: 'readonly',
      },
    },
  },
];

module.exports = config;
