import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { plugin as shadcn } from '@shadcn/lint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    plugins: {
      shadcn,
    },

    settings: {
      shadcn: {
        // NOTE: this repo keeps shadcn components at
        // src/shared/components/ui (imported as @/shared/components/ui/*),
        // not the default @/components/ui.
        ui: '@/shared/components/ui',
      },
    },

    rules: {
      // -------------------------
      // shadcn / Tailwind rules
      // -------------------------

      // Don't restyle shadcn components unnecessarily
      'shadcn/no-restyle': 'warn',

      // Don't use raw colors such as bg-red-500
      'shadcn/no-raw-colors': 'warn',

      // Avoid arbitrary values such as p-[13px]
      'shadcn/no-arbitrary-values': 'warn',

      // Prefer Tailwind classes over inline styles
      'shadcn/no-inline-styles': 'warn',

      // Catch invalid Tailwind classes.
      // `allow` lists project-specific JS-hook classes that intentionally
      // carry no styles (all visuals come from colocated Tailwind
      // utilities); an empty @utility would fail the production build.
      'shadcn/no-unknown-classes': [
        'error',
        {
          allow: [
            'resize-handle',
            'rotate-handle',
            'chart-editing-workspace',
            'chart-display-frame',
            'chart-data-editor-container',
            'data-editor-table-container',
            'menu-item-btn',
            'cn-input-otp',
          ],
        },
      ],

      // Prevent dynamic classes that cannot be statically analyzed
      'shadcn/require-static-classes': 'warn',

      // -------------------------
      // TypeScript consistency
      // -------------------------

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // shadcn components themselves are allowed to
  // define their own styling.
  // NOTE: adapted to this repo's actual ui location
  // (src/shared/components/ui, not src/components/ui).
  {
    files: ['src/shared/components/ui/**/*.{ts,tsx}'],

    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/require-static-classes': 'off',
    },
  },
])
