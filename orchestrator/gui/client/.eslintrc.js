module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      generators: false,
      jsx: true,
      objectLiteralDuplicateProperties: false
    },
    ecmaVersion: 2018,
    project: 'tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname
  },
  plugins: [
    '@typescript-eslint',
    'compat',
    'import',
    'jest',
    'jsx-a11y',
    'prettier',
    'promise',
    'react'
  ],
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      react: {
        version: 'detect'
      },
      webpack: {
        config: require.resolve('./config/webpack.config.eslint.js')
      }
    }
  },
  rules: {
    ...require('./config/eslint_rules'),
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 0
  }
};
