// eslint.config.js (ESM 書式; Node 20 ならそのまま動く)
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsEslint, prettier: eslintPluginPrettier },
    rules: {
      // 推奨セット
      ...tsEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  eslintConfigPrettier, // Prettier と競合する既定ルール無効化
];
