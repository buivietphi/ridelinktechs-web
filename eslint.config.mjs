import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';

const sharedRules = {
  'react/no-unknown-property': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react/jsx-no-target-blank': 'off',
  'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
  'jsx-a11y/aria-props': 'warn',
  'jsx-a11y/aria-proptypes': 'warn',
  'jsx-a11y/aria-unsupported-elements': 'warn',
  'jsx-a11y/role-has-required-aria-props': 'warn',
  'jsx-a11y/role-supports-aria-props': 'warn',
};

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.impeccable/**',
      'scripts/check-*.mts',
      '_screenshots/**',
      '.claude/**',
    ],
  },
  nextPlugin.flatConfig.coreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...sharedRules,
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
