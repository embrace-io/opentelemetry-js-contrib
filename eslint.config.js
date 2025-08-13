'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-n');
const licenseHeaderPlugin = require('eslint-plugin-license-header');

// Common license header configuration
const licenseHeader = {
  'license-header/header': [
    'error',
    [
      '/*',
      ' * Copyright The OpenTelemetry Authors',
      ' *',
      ' * Licensed under the Apache License, Version 2.0 (the "License");',
      ' * you may not use this file except in compliance with the License.',
      ' * You may obtain a copy of the License at',
      ' *',
      ' *      https://www.apache.org/licenses/LICENSE-2.0',
      ' *',
      ' * Unless required by applicable law or agreed to in writing, software',
      ' * distributed under the License is distributed on an "AS IS" BASIS,',
      ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
      ' * See the License for the specific language governing permissions and',
      ' * limitations under the License.',
      ' */',
    ],
  ],
};

// Common base rules for all files
const baseRules = {
  ...js.configs.recommended.rules,
  quotes: ['error', 'single', { avoidEscape: true }],
  eqeqeq: ['error', 'smart'],
  'prefer-rest-params': 'off',
  'no-shadow': 'off',
  'node/no-deprecated-api': ['warn'],
  ...licenseHeader,
};

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
      'license-header': licenseHeaderPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        project: null,
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
    rules: baseRules,
  },
  // TypeScript-specific config
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      node: nodePlugin,
      'license-header': licenseHeaderPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: null,
      },
    },
    rules: {
      ...baseRules,
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-shadow': ['warn'],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreProperties: true },
      ],
      '@typescript-eslint/no-unsafe-function-type': 'off',
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
    files: ['**/test/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      node: nodePlugin,
      'license-header': licenseHeaderPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: null,
      },
      globals: {
        ...globals.mocha,
        ...globals.node,
      },
    },
    rules: {
      ...baseRules,
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-empty': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
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
  // ES modules config
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
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
