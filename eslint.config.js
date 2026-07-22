const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    {
        ignores: ['out', 'dist', '**/*.d.ts'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/naming-convention': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn',
            'semi': 'off',
        },
    },
);
