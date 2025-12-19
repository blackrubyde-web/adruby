module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-constant-condition': 'warn',
    'no-undef': 'off',
    'prefer-rest-params': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off'
  },
  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
      env: { 'vitest/env': true },
      plugins: ['vitest']
    }
  ]
};
