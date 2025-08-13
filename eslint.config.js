'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-n');
const licenseHeaderPlugin = require('eslint-plugin-license-header');

const license = [
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
];

const ignores = [
  '**/build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
];

const baseConfig = tseslint.config(
  // Base rules for all files
  {
    files: ['**/*.{js,ts,mjs}'],
    ignores,
    plugins: {
      node: nodePlugin,
      'license-header': licenseHeaderPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
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
      'node/no-deprecated-api': ['warn'],
      'license-header/header': ['error', license],
    },
  },

  // TypeScript strict rules
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
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

  // Test files relaxed rules
  {
    files: ['**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-empty': 'off',
    },
  },

  // JavaScript test files
  {
    files: ['**/test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },

  // ESM files
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },

  // Browser environment
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
  }
);

module.exports = baseConfig;
